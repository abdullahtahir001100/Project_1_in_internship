<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "../../dbconfig/db_config.php";
$id = $_GET['id'] ?? 0;
$id ? $result = $conn->query("SELECT * FROM bonuses WHERE id = $id") : $result = $conn->query("SELECT * FROM bonuses");
$departments = [];

while ($row = $result->fetch_assoc()) {
    $departments[] = $row;
}

echo json_encode($departments);


?>
