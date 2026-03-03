<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "../../dbconfig/db_config.php";
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$result = $conn->query("SELECT p.*, d.id as department_id, COALESCE(d.department_name, 'No Department') as department_name
 FROM Posts p
 LEFT JOIN departments d ON p.department_id = d.id
 WHERE p.id = $id
 ");

if ($result === FALSE) {
    echo json_encode(["error" => $conn->error]);
    exit;
}

$posts = [];

while ($row = $result->fetch_assoc()) {
    $posts[] = $row;
}

echo json_encode($posts);


?>
