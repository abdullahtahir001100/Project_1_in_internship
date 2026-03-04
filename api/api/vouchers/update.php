<?php
header("Content-Type: application/json");

    
$id = $_GET['id11'] ?? 0;
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

$servername = "gateway01.eu-central-1.prod.aws.tidbcloud.com";
$port = 4000;
$username = "3AEZrv2kzEmLLGp.root";
$password = "qOakZjYjWqhDR7G4";
$database = "test";
// ho gi ha 
$conn = mysqli_init();

// TiDB requires SSL. We set it here.
// Even with NULL parameters, this initializes the SSL state.
mysqli_ssl_set($conn, NULL, NULL, NULL, NULL, NULL);

// Key Change: Added MYSQLI_CLIENT_SSL at the end
if (!mysqli_real_connect($conn, $servername, $username, $password, $database, $port, NULL, MYSQLI_CLIENT_SSL)) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Connection Failed",
        "details" => mysqli_connect_error()
    ]);
    exit();
}
else {
    if ($id) {
         echo json_encode([
        "success" => true,
        "message" => "Connected to TiDB successfully!",
        "tables" => mysqli_query($conn, "SHOW TABLES")->fetch_all(MYSQLI_ASSOC)
    ]);
    }
  
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Only POST requests are allowed"]);
    exit;
}

// ── Parse FormData (payload JSON + attachment file) ─────────────────
$payload = json_decode($_POST['payload'] ?? '{}', true);

$id             = (int)($payload['id'] ?? 0);
$jv_number      = trim($payload['jv_number'] ?? '');
$reference_no   = trim($payload['reference_no'] ?? '');
$date           = trim($payload['date'] ?? '');
$narration      = trim($payload['narration'] ?? '');
$debit_entries  = $payload['debit_entries'] ?? [];
$credit_entries = $payload['credit_entries'] ?? [];

// ── Validation ──────────────────────────────────────────────────────
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "Voucher ID is required."]);
    exit;
}
if (empty($date)) {
    http_response_code(400);
    echo json_encode(["message" => "Date is required."]);
    exit;
}

// ── Get existing voucher ────────────────────────────────────────────
$existing = $conn->prepare("SELECT * FROM vouchers WHERE id = ?");
$existing->bind_param("i", $id);
$existing->execute();
$existingResult = $existing->get_result();
if ($existingResult->num_rows === 0) {
    http_response_code(404);
    echo json_encode(["message" => "Voucher not found."]);
    exit;
}
$oldVoucher = $existingResult->fetch_assoc();
$existing->close();

// ── Image handling ──────────────────────────────────────────────────
$imagePath = $oldVoucher['image']; // keep old image by default

if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
    $allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'tiff', 'tif', 'ico'];
    $ext = strtolower(pathinfo($_FILES['attachment']['name'], PATHINFO_EXTENSION));

    if (!in_array($ext, $allowedExts)) {
        http_response_code(400);
        echo json_encode(["message" => "Only image files are allowed (jpg, png, gif, webp, bmp, svg, tiff)."]);
        exit;
    }

    if ($_FILES['attachment']['size'] > 5 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(["message" => "Image size must be less than 5 MB."]);
        exit;
    }

    $uploadDir = __DIR__ . '/../../uploads/vouchers/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $fileName = 'voucher_' . time() . '_' . mt_rand(1000, 9999) . '.' . $ext;
    $destination = $uploadDir . $fileName;

    if (move_uploaded_file($_FILES['attachment']['tmp_name'], $destination)) {
        // Delete old image
        if ($oldVoucher['image'] && file_exists(__DIR__ . '/../../' . $oldVoucher['image'])) {
            unlink(__DIR__ . '/../../' . $oldVoucher['image']);
        }
        $imagePath = 'uploads/vouchers/' . $fileName;
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Failed to upload image."]);
        exit;
    }
}

// ── Begin transaction ───────────────────────────────────────────────
$conn->begin_transaction();

try {
    // Update voucher
    $stmt = $conn->prepare("UPDATE vouchers SET reference_no = ?, date = ?, narration = ?, image = ? WHERE id = ?");
    $stmt->bind_param("ssssi", $reference_no, $date, $narration, $imagePath, $id);
    $stmt->execute();
    $stmt->close();

    // Delete old entries
    $del = $conn->prepare("DELETE FROM voucher_entries WHERE voucher_id = ?");
    $del->bind_param("i", $id);
    $del->execute();
    $del->close();

    // Re-insert entries
    $entryStmt = $conn->prepare("INSERT INTO voucher_entries (voucher_id, entry_type, ledger_id, description, amount) VALUES (?, ?, ?, ?, ?)");

    foreach ($debit_entries as $entry) {
        $type = 'debit';
        $ledger_id   = (int)($entry['ledger_id'] ?? 0);
        $description = trim($entry['description'] ?? '');
        $amount      = (float)($entry['amount'] ?? 0);
        if ($ledger_id <= 0 || $amount <= 0) continue;

        $entryStmt->bind_param("isiss", $id, $type, $ledger_id, $description, $amount);
        $entryStmt->execute();
    }

    foreach ($credit_entries as $entry) {
        $type = 'credit';
        $ledger_id   = (int)($entry['ledger_id'] ?? 0);
        $description = trim($entry['description'] ?? '');
        $amount      = (float)($entry['amount'] ?? 0);
        if ($ledger_id <= 0 || $amount <= 0) continue;

        $entryStmt->bind_param("isiss", $id, $type, $ledger_id, $description, $amount);
        $entryStmt->execute();
    }

    $entryStmt->close();
    $conn->commit();

    echo json_encode([
        "success"   => true,
        "message"   => "Voucher updated successfully!",
        "id"        => $id,
        "image"     => $imagePath
    ]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["message" => "Failed to update voucher: " . $e->getMessage()]);
}

$conn->close();
?>
