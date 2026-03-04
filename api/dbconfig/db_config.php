<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

$id = $_GET['id'] ?? 0;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// DB Config
$servername = "gateway01.eu-central-1.prod.aws.tidbcloud.com";
$port = 4000;
$username = "3AEZrv2kzEmLLGp.root";
$password = "qOakZjYjWqhDR7G4";
$database = "test";

$conn = mysqli_init();
mysqli_ssl_set($conn, NULL, NULL, NULL, NULL, NULL);

// Connect with SSL
if (!mysqli_real_connect($conn, $servername, $username, $password, $database, $port, NULL, MYSQLI_CLIENT_SSL)) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Connection Failed",
        "details" => mysqli_connect_error()
    ]);
    exit();
}

// Connection successful
if ($id) {
    $result = mysqli_query($conn, "SHOW TABLES");
    $tables = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $tables[] = $row;
    }

    echo json_encode([
        "success" => true,
        "message" => "Connected to TiDB successfully!",
        "tables" => $tables
    ]);
} else {
    echo json_encode([
        "success" => true,
        "message" => "Connected to TiDB successfully! No ID provided."
    ]);
}

mysqli_close($conn);
?>