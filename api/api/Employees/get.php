<?php

include_once __DIR__ . "/../../dbconfig/db_config.php";


$sql = "SELECT Employs.*, departments.department_name AS department_name, Posts.Post_name AS post_name, ledgers.ledger_unique_id, ledgers.name AS ledger_name FROM Employs LEFT JOIN departments ON Employs.department_id = departments.id LEFT JOIN Posts ON Employs.post_id = Posts.id LEFT JOIN ledgers ON Employs.ledger_id = ledgers.id";
$result = $conn->query($sql);
$employees = [];

while ($row = $result->fetch_assoc()) {
    $emp_id = $row['id'];

    // Get bonuses for this employee
    $bonus_sql = "SELECT bonuses.id, bonuses.bonusName AS name, bonuses.baseValue AS value FROM employ_bonus LEFT JOIN bonuses ON employ_bonus.bonus_id = bonuses.id WHERE employ_bonus.employ_id = $emp_id";
    $bonus_result = $conn->query($bonus_sql);
    $bonuses = [];
    if ($bonus_result) {
        while ($b = $bonus_result->fetch_assoc()) {
            $bonuses[] = $b;
        }
    }
    $row['bonuses'] = $bonuses;

   

    $deduction_sql = "SELECT deductions.id, deductions.deduction_name AS name, deductions.deduction_amount AS value FROM employ_deduction LEFT JOIN deductions ON employ_deduction.deduction_id = deductions.id WHERE employ_deduction.employ_id = $emp_id";
    $deduction_result = $conn->query($deduction_sql);
    $deductions = [];
    if ($deduction_result) {
        while ($d = $deduction_result->fetch_assoc()) {
            $deductions[] = $d;
        }
    }
    $row['deductions'] = $deductions;

    $employees[] = $row;
}

echo json_encode($employees);

?>
