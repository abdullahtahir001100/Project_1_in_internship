<?php
header("Content-Type: application/json");

    
$id = $_GET['id11'] ?? 0;
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

$servername = "gateway01.eu-central-1.prod.aws.tidbcloud.com";
$port = 4000;
$username = "3AEZrv2kzEmLLGp.root";
$password = "IZS8gZtNqECsqPry";
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

$jv_number      = trim($payload['jv_number'] ?? '');
$reference_no   = trim($payload['reference_no'] ?? '');
$date           = trim($payload['date'] ?? '');
$narration      = trim($payload['narration'] ?? '');
$debit_entries  = $payload['debit_entries'] ?? [];
$credit_entries = $payload['credit_entries'] ?? [];

// ── Validation ──────────────────────────────────────────────────────
if (empty($jv_number)) {
    http_response_code(400);
    echo json_encode(["message" => "JV number is required."]);
    exit;
}
if (empty($date)) {
    http_response_code(400);
    echo json_encode(["message" => "Date is required."]);
    exit;
}
if (empty($debit_entries) && empty($credit_entries)) {
    http_response_code(400);
    echo json_encode(["message" => "At least one debit or credit entry is required."]);
    exit;
}

// ── Image handling (accept only images) ─────────────────────────────
$imagePath = null;

if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
    $allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'tiff', 'tif', 'ico'];
    $ext = strtolower(pathinfo($_FILES['attachment']['name'], PATHINFO_EXTENSION));

    if (!in_array($ext, $allowedExts)) {
        http_response_code(400);
        echo json_encode(["message" => "Only image files are allowed (jpg, png, gif, webp, bmp, svg, tiff)."]);
        exit;
    }

    // Max 5 MB
    if ($_FILES['attachment']['size'] > 5 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(["message" => "Image size must be less than 5 MB."]);
        exit;
    }

    $uploadDir = '/uploads/vouchers/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $fileName = 'voucher_' . time() . '_' . mt_rand(1000, 9999) . '.' . $ext;
    $destination = $uploadDir . $fileName;

    if (move_uploaded_file($_FILES['attachment']['tmp_name'], $destination)) {
        $imagePath = 'uploads/vouchers/' . $fileName;
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Failed to upload image."]);
        exit;
    }
}

// ── Check JV number uniqueness ──────────────────────────────────────
$check = $conn->prepare("SELECT id FROM vouchers WHERE jv_number = ?");
$check->bind_param("s", $jv_number);
$check->execute();
$check->store_result();
if ($check->num_rows > 0) {
    http_response_code(409);
    echo json_encode(["message" => "JV number '$jv_number' already exists."]);
    $check->close();
    exit;
}
$check->close();

// ── Begin transaction ───────────────────────────────────────────────
$conn->begin_transaction();

try {
    // Insert voucher
    $stmt = $conn->prepare("INSERT INTO vouchers (jv_number, reference_no, date, narration, image) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $jv_number, $reference_no, $date, $narration, $imagePath);
    $stmt->execute();
    $voucher_id = $conn->insert_id;
    $stmt->close();

    // Insert debit entries
    $entryStmt = $conn->prepare("INSERT INTO voucher_entries (voucher_id, entry_type, ledger_id, description, amount) VALUES (?, ?, ?, ?, ?)");

    foreach ($debit_entries as $entry) {
        $type = 'debit';
        $ledger_id   = (int)($entry['ledger_id'] ?? 0);
        $description = trim($entry['description'] ?? '');
        $amount      = (float)($entry['amount'] ?? 0);

        if ($ledger_id <= 0 || $amount <= 0) continue;

        $entryStmt->bind_param("isiss", $voucher_id, $type, $ledger_id, $description, $amount);
        $entryStmt->execute();
    }

    // Insert credit entries
    foreach ($credit_entries as $entry) {
        $type = 'credit';
        $ledger_id   = (int)($entry['ledger_id'] ?? 0);
        $description = trim($entry['description'] ?? '');
        $amount      = (float)($entry['amount'] ?? 0);

        if ($ledger_id <= 0 || $amount <= 0) continue;

        $entryStmt->bind_param("isiss", $voucher_id, $type, $ledger_id, $description, $amount);
        $entryStmt->execute();
    }

    $entryStmt->close();
    $conn->commit();

    echo json_encode([
        "success"   => true,
        "message"   => "Voucher '$jv_number' created successfully!",
        "id"        => $voucher_id,
        "jv_number" => $jv_number,
        "image"     => $imagePath
    ]);

} catch (Exception $e) {
    $conn->rollback();

    // Remove uploaded image if transaction failed
    if ($imagePath && file_exists($imagePath)) {
        unlink($imagePath);
    }

    http_response_code(500);
    echo json_encode(["message" => "Failed to create voucher: " . $e->getMessage()]);
}

$conn->close();
?>
