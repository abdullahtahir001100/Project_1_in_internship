<?php

include_once __DIR__ . "/../../dbconfig/db_config.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Only POST requests are allowed"]);
    exit;
}

$conn->begin_transaction();

try {

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

    // Check if employee already exists (same first_name, last_name, phone)
    $checkStmt = $conn->prepare("SELECT id FROM Employs WHERE first_name = ? AND last_name = ? AND phone = ?");
    $checkStmt->bind_param("sss", $first_name, $last_name, $phone);
    $checkStmt->execute();
    $checkStmt->store_result();
    if ($checkStmt->num_rows > 0) {
        $checkStmt->close();
        throw new Exception("Employee with this name and phone already exists.");
    }
    $checkStmt->close();

    $stmt = $conn->prepare("
        INSERT INTO Employs 
        (first_name, last_name, email, phone, address, Salery, department_id, post_id, ledger_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->bind_param(
        "sssssdiis",
        $first_name,
        $last_name,
        $email,
        $phone,
        $address,
        $salary,
        $department_id,
        $post_id,
        $ledger_id
    );

    if (!$stmt->execute()) {
        throw new Exception($stmt->error);
    }

    $employ_id = $conn->insert_id;
    $stmt->close();
    

    if (!empty($bonuses)) {

        $bonusStmt = $conn->prepare("
            INSERT INTO employ_bonus (employ_id, bonus_id) 
            VALUES (?, ?)
        ");

        foreach ($bonuses as $bonus_id) {
            $bonus_id = (int)$bonus_id;
            $bonusStmt->bind_param("ii", $employ_id, $bonus_id);

            if (!$bonusStmt->execute()) {
                throw new Exception($bonusStmt->error);
            }
        }

        $bonusStmt->close();
    }

    /* =========================
       INSERT DEDUCTIONS
    ========================== */

    if (!empty($deductions)) {

        $deductionStmt = $conn->prepare("
            INSERT INTO employ_deduction (employ_id, deduction_id) 
            VALUES (?, ?)
        ");

        foreach ($deductions as $deduction_id) {
            $deduction_id = (int)$deduction_id;
            $deductionStmt->bind_param("ii", $employ_id, $deduction_id);

            if (!$deductionStmt->execute()) {
                throw new Exception($deductionStmt->error);
            }
        }

        $deductionStmt->close();
    }

    /* =========================
       COMMIT TRANSACTION
    ========================== */

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Employee $first_name $last_name added successfully!",
        "employee_id" => $employ_id
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
