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

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(["error" => "Only DELETE requests are allowed"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['id'])) {
    http_response_code(400);
    echo json_encode(["message" => "ID is required."]);
    exit;
}

$id = (int)$input['id'];

// Get image path before deleting
$stmt = $conn->prepare("SELECT image FROM vouchers WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(["message" => "Voucher not found."]);
    $stmt->close();
    $conn->close();
    exit;
}

$voucher = $result->fetch_assoc();
$stmt->close();

// Delete voucher (entries auto-delete via ON DELETE CASCADE)
$delStmt = $conn->prepare("DELETE FROM vouchers WHERE id = ?");
$delStmt->bind_param("i", $id);

if ($delStmt->execute()) {
    // Delete the image file
    if ($voucher['image'] && file_exists(__DIR__ . '/../../' . $voucher['image'])) {
        unlink(__DIR__ . '/../../' . $voucher['image']);
    }

    echo json_encode(["success" => true, "message" => "Voucher deleted successfully."]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Failed to delete voucher: " . $delStmt->error]);
}

$delStmt->close();
$conn->close();
?>
