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

$sql = "SELECT 
  d.id AS department_id,
  d.department_name,
  d.created_at AS department_created_at,
  p.id AS post_id,
  p.Post_name,
  p.created_at AS post_created_at
FROM departments d
LEFT JOIN Posts p ON d.id = p.department_id
ORDER BY d.id
";

$result = $conn->query($sql);

$departments = [];

while ($row = $result->fetch_assoc()) {
    $deptId = $row['department_id'];

  
    if (!isset($departments[$deptId])) {
        $departments[$deptId] = [
            "department_id" => $deptId,
            "department_name" => $row['department_name'],
            "created_at" => $row['department_created_at'],
            "posts" => []
        ];
    }

    // agar post exist karti hai
    if ($row['post_id']) {
        $departments[$deptId]['posts'][] = [
            "id" => $row['post_id'],
            "Post_name" => $row['Post_name'],
            "created_at" => $row['post_created_at']
        ];
    }
}

// re-index array
echo json_encode(array_values($departments));
?>
