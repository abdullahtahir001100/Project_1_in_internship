<?php
include "../../dbconfig/db_config.php";

$sql = "
    SELECT 
        bonus_child.employee_id,
        bonus_main.id,
        bonus_main.month,
        bonus_main.year,
        bonus_main.type,
        bonus_child.bonus,
        bonus_child.fine
    FROM bonus_child
    INNER JOIN bonus_main 
        ON bonus_child.bonus_main_id = bonus_main.id
";

$result = $conn->query($sql);

$data = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}

echo json_encode($data);
?>
