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
   $data = json_decode(file_get_contents("php://input"), true);

$month    = (int)($data['month'] ?? 0);
$type     = $data['type'] ?? '';
$year     = (int)($data['year'] ?? 0);
$children = $data['children'] ?? [];

if (empty($children)) {
    throw new Exception("No children data received");
}

$conn->begin_transaction();

// Insert into bonus_main
$stmtMain = $conn->prepare("
    INSERT INTO bonus_main (month, type, year, created_at)
    VALUES (?, ?, ?, NOW())
");
$stmtMain->bind_param("isi", $month, $type, $year);

if (!$stmtMain->execute()) {
    throw new Exception("Main insert failed: ".$stmtMain->error);
}

$bonus_main_id = $conn->insert_id;
if (!$bonus_main_id) {
    throw new Exception("Invalid bonus_main_id, got 0");
}

// Insert into bonus_child
$stmtChild = $conn->prepare("
    INSERT INTO bonus_child (employee_id, bonus, fine, bonus_main_id, created_at)
    VALUES (?, ?, ?, ?, NOW())
");

foreach ($children as $child) {
    $emp_id = (int)($child['emp_id'] ?? 0);
    $bonus  = isset($child['bonus']) && $child['bonus'] !== '' ? (float)$child['bonus'] : null;
    $fine   = isset($child['fine']) && $child['fine'] !== '' ? (float)$child['fine'] : null;
    if (empty($bonus) && empty($fine)) {
         throw new Exception("Both bonus and fine cannot be empty for employee_id: $emp_id");
        exit;
    }
    $stmtChild->bind_param("iddi", $emp_id, $bonus, $fine, $bonus_main_id);

    if (!$stmtChild->execute()) {
        throw new Exception("Child insert failed: ".$stmtChild->error);
    }
}

$conn->commit();

echo json_encode([
    "success" => true,
    "message" => "Bonus data inserted successfully",
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
