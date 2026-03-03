<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "../../dbconfig/db_config.php";

$employees = [];

/* Get duration from frontend */
$duration = $_GET['duration'] ?? '';

$sql = "SELECT Employs.*, departments.department_name, Posts.Post_name 
        FROM Employs 
        LEFT JOIN departments ON Employs.department_id = departments.id 
        LEFT JOIN Posts ON Employs.post_id = Posts.id";

$result = $conn->query($sql);

while ($row = $result->fetch_assoc()) {

    $emp_id = $row['id'];

    /* ================================
       1️⃣ Check Payroll Status
    ================================= */

    $is_processed = 0;

    if (!empty($duration)) {
        $checkStmt = $conn->prepare("
            SELECT id FROM payroll 
            WHERE employee_id = ? AND duration = ?
        ");
        $checkStmt->bind_param("is", $emp_id, $duration);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();

        if ($checkResult->num_rows > 0) {
            $is_processed = 1;
        }
    }

    $row['is_processed'] = $is_processed;

    /* ================================
       2️⃣ Bonuses
    ================================= */

    $bonus_sql = "SELECT bonuses.id, bonuses.bonusName AS name, bonuses.baseValue AS value 
                  FROM employ_bonus 
                  LEFT JOIN bonuses ON employ_bonus.bonus_id = bonuses.id 
                  WHERE employ_bonus.employ_id = $emp_id";

    $bonus_result = $conn->query($bonus_sql);
    $bonuses = [];

    if ($bonus_result) {
        while ($b = $bonus_result->fetch_assoc()) {
            $bonuses[] = $b;
        }
    }

    $row['bonuses'] = $bonuses;

    /* ================================
       3️⃣ Deductions
    ================================= */

    $deduction_sql = "SELECT deductions.id, deductions.deduction_name AS name, deductions.deduction_amount AS value 
                      FROM employ_deduction 
                      LEFT JOIN deductions ON employ_deduction.deduction_id = deductions.id 
                      WHERE employ_deduction.employ_id = $emp_id";

    $deduction_result = $conn->query($deduction_sql);
    $deductions = [];

    if ($deduction_result) {
        while ($d = $deduction_result->fetch_assoc()) {
            $deductions[] = $d;
        }
    }

    $row['deductions'] = $deductions;

    /* ================================
       4️⃣ Bonus Main (Monthly Bonus/Fine)
    ================================= */

    $bonus_main_sql = "SELECT 
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
        WHERE bonus_child.employee_id = $emp_id";

    $bonus_main_result = $conn->query($bonus_main_sql);
    $bonus_main = [];

    if ($bonus_main_result) {
        while ($bm = $bonus_main_result->fetch_assoc()) {
            $bonus_main[] = $bm;
        }
    }

    $row['bonus_main'] = $bonus_main;

    $employees[] = $row;
}

echo json_encode([
    "success" => true,
    "data" => $employees
], JSON_PRETTY_PRINT);

$conn->close();
?>
