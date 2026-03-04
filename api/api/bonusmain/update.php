<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
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
    echo json_encode([
        "success" => false,
        "error" => "Only POST requests are allowed"
    ]);
    exit;
}

try {
    // Decode JSON safely
    $data = json_decode(file_get_contents("php://input"), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON decode error: " . json_last_error_msg());
    }

    // Correct IDs from payload
    $bonus_main_id = (int)($data['bonus_main_id'] ?? 0);
    $employee_id   = (int)($data['employee_id'] ?? 0); // agar zarurat ho future me
    $month         = (int)($data['month'] ?? 0);
    $type          = $data['type'] ?? '';
    $year          = (int)($data['year'] ?? 0);
    $children      = $data['children'] ?? [];

    if (!$bonus_main_id) {
        throw new Exception("Missing bonus_main_id");
    }

    if (empty($children)) {
        throw new Exception("No children data received");
    }

    $conn->begin_transaction();

    // 1️⃣ Update main table
    $stmtMain = $conn->prepare("
        UPDATE bonus_main
        SET month = ?, type = ?, year = ?
        WHERE id = ?
    ");
    $stmtMain->bind_param("isii", $month, $type, $year, $bonus_main_id);
    if (!$stmtMain->execute()) {
        throw new Exception("Main update failed: " . $stmtMain->error);
    }

    // 2️⃣ Delete existing children
    $stmtDelete = $conn->prepare("DELETE FROM bonus_child WHERE bonus_main_id = ?");
    $stmtDelete->bind_param("i", $bonus_main_id);
    if (!$stmtDelete->execute()) {
        throw new Exception("Failed to delete old child records: " . $stmtDelete->error);
    }

    // 3️⃣ Insert new child records
    $stmtChild = $conn->prepare("
        INSERT INTO bonus_child (employee_id, bonus, fine, bonus_main_id, created_at)
        VALUES (?, ?, ?, ?, NOW())
    ");

    foreach ($children as $child) {
        $emp_id = (int)($child['emp_id'] ?? 0);
        $bonus  = isset($child['bonus']) && $child['bonus'] !== '' ? (float)$child['bonus'] : null;
        $fine   = isset($child['fine']) && $child['fine'] !== '' ? (float)$child['fine'] : null;

        if ($bonus === null && $fine === null) {
            throw new Exception("Both bonus and fine cannot be empty for employee_id: $emp_id");
        }

        $stmtChild->bind_param("iddi", $emp_id, $bonus, $fine, $bonus_main_id);
        if (!$stmtChild->execute()) {
            throw new Exception("Child insert failed for employee_id $emp_id: " . $stmtChild->error);
        }
    }

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Bonus data updated successfully",
        "bonus_main_id" => $bonus_main_id
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}

$conn->close();
?>
