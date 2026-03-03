<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "../../dbconfig/db_config.php";

$result = $conn->query("SELECT p.*, COALESCE(d.department_name, 'No Department') as department_name FROM Posts p LEFT JOIN departments d ON p.department_id = d.id");
$posts = [];

while ($row = $result->fetch_assoc()) {
    $posts[] = $row;
}

echo json_encode($posts);


?>
