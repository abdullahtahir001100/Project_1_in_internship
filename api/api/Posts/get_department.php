<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "../../dbconfig/db_config";

$result = $conn->query("SELECT * FROM departments");
$departments = [];

while ($row = $result->fetch_assoc()) {
    $departments[] = $row;
}

echo json_encode($departments);


?>
