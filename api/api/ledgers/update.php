<?php

    
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

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(["error" => "Only PUT requests are allowed"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

$id          = (int)($input['id'] ?? 0);
$name        = trim($input['name'] ?? '');
$father_name = trim($input['father_name'] ?? '');
$cnic        = trim($input['cnic'] ?? '');
$email       = trim($input['email'] ?? '');
$phone       = trim($input['phone'] ?? '');
$salary      = (int)($input['salary'] ?? 0);
$status      = $input['status'] ?? 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid ledger ID."]);
    exit;
}

if (empty($name)) {
    http_response_code(400);
    echo json_encode(["message" => "Name is required."]);
    exit;
}

$stmt = $conn->prepare("UPDATE ledgers SET name = ?, father_name = ?, cnic = ?, email = ?, phone = ?, salary = ?,status = '$status' WHERE id = ?");
$stmt->bind_param("sssssii", $name, $father_name, $cnic, $email, $phone, $salary, $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Ledger updated successfully!"]);
    } else {
        echo json_encode(["success" => true, "message" => "No changes made."]);
    }
} else {
    http_response_code(500);
    echo json_encode(["message" => "Failed to update ledger: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
