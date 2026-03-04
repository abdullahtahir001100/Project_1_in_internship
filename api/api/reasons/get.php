<?php
header("Access-Control-Allow-Origin: *");
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

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id > 0) {
    $stmt = $conn->prepare("
        SELECT r.*, 
               e.first_name, e.last_name, e.email,
               d.department_name,
               p.Post_name AS post_name
        FROM reasons r
        LEFT JOIN Employs e ON r.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN Posts p ON e.post_id = p.id
        WHERE r.id = ?
    ");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $output = $result->fetch_assoc();
    echo json_encode($output);
    exit;
}

$result = $conn->query(" 
        SELECT r.*, 
               e.first_name, e.last_name, e.email,
               d.department_name,
               p.Post_name AS post_name
        FROM reasons r
        LEFT JOIN Employs e ON r.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN Posts p ON e.post_id = p.id
        ORDER BY r.id DESC
");

$rows = [];
while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
}
echo json_encode($rows);
?>