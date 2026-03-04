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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Only POST requests are allowed"]);
    exit;
}

try {
    $deptName = $_POST['Department_id'] ?? '';
    $status = $_POST['Post_name'] ?? '';

  

    $stmt = $conn->prepare("INSERT INTO Posts (Post_name, department_id) VALUES (?, ?)");
    $stmt->bind_param("si", $status,$deptName);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Department $deptName added successfully!"
        ]);
    } else {
        throw new Exception($stmt->error);
    }

    $stmt->close();
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}


?>
