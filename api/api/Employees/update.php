<?php

include "../../dbconfig/db_config";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Only POST requests are allowed"]);
    exit;
}

$conn->begin_transaction();

try {

    /* =========================
       GET FORM DATA
    ========================== */

    $id             = (int)($_POST['id'] ?? 0);
    $first_name     = $_POST['first_name'] ?? '';
    $last_name      = $_POST['last_name'] ?? '';
    $email          = $_POST['email'] ?? '';
    $phone          = $_POST['phone'] ?? '';
    $address        = $_POST['address'] ?? '';
    $salary         = $_POST['salary'] ?? '';
     $department_id  = (int)($_POST['department_id'] ?? 0);
   
    $post_id        = (int)($_POST['post_id'] ?? 0);
    $ledger_id      = isset($_POST['ledger_id']) && $_POST['ledger_id'] !== '' ? (int)$_POST['ledger_id'] : null;

    $bonuses = isset($_POST['bonuses']) 
        ? json_decode($_POST['bonuses'], true) 
        : [];

    $deductions = isset($_POST['deductions']) 
        ? json_decode($_POST['deductions'], true) 
        : [];

    if ($id <= 0) {
        throw new Exception("Invalid employee ID");
    }

    /* =========================
       UPDATE EMPLOYEE
    ========================== */

    $stmt = $conn->prepare("
        UPDATE Employs 
        SET first_name = ?, 
            last_name = ?, 
            email = ?, 
            phone = ?, 
            Salery = ?,
            address = ?, 
            department_id = ?, 
            post_id = ?,
            ledger_id = ?
        WHERE id = ?
    ");

$stmt->bind_param(
    "ssssdsiisi",
    $first_name,
    $last_name,
    $email,
    $phone,
    $salary,
    $address,
    $department_id,
    $post_id,
    $ledger_id,
    $id
);


    if (!$stmt->execute()) {
        throw new Exception($stmt->error);
    }

    $stmt->close();

    /* =========================
       DELETE OLD RELATIONS
    ========================== */

    $delBonus = $conn->prepare("DELETE FROM employ_bonus WHERE employ_id = ?");
    $delBonus->bind_param("i", $id);
    $delBonus->execute();
    $delBonus->close();

    $delDeduction = $conn->prepare("DELETE FROM employ_deduction WHERE employ_id = ?");
    $delDeduction->bind_param("i", $id);
    $delDeduction->execute();
    $delDeduction->close();

    /* =========================
       INSERT NEW BONUSES
    ========================== */

    if (!empty($bonuses)) {

        $bonusStmt = $conn->prepare("
            INSERT INTO employ_bonus (employ_id, bonus_id) 
            VALUES (?, ?)
        ");

        foreach ($bonuses as $bonus_id) {
            $bonus_id = (int)$bonus_id;
            $bonusStmt->bind_param("ii", $id, $bonus_id);

            if (!$bonusStmt->execute()) {
                throw new Exception($bonusStmt->error);
            }
        }

        $bonusStmt->close();
    }

    /* =========================
       INSERT NEW DEDUCTIONS
    ========================== */

    if (!empty($deductions)) {

        $deductionStmt = $conn->prepare("
            INSERT INTO employ_deduction (employ_id, deduction_id) 
            VALUES (?, ?)
        ");

        foreach ($deductions as $deduction_id) {
            $deduction_id = (int)$deduction_id;
            $deductionStmt->bind_param("ii", $id, $deduction_id);

            if (!$deductionStmt->execute()) {
                throw new Exception($deductionStmt->error);
            }
        }

        $deductionStmt->close();
    }

    /* =========================
       COMMIT
    ========================== */

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Employee $first_name $last_name updated successfully!"
    ]);

} catch (Exception $e) {

    $conn->rollback();

    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}

$conn->close();
?>
