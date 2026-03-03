
<?php

include "../../dbconfig/db_config.php";
$id = isset($_GET['employee_id']) ? (int)$_GET['employee_id'] : 0;
$result = $conn->query("SELECT * FROM Employee_Ratings WHERE employee_id = $id");
$departments = [];

while ($row = $result->fetch_assoc()) {
    $departments[] = $row;
}

echo json_encode($departments);


?>
