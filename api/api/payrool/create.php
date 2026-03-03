<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include "../../dbconfig/db_config.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        "success" => false,
        "error" => "Only POST requests are allowed"
    ]);
    exit;
}

try {

    $data = json_decode(file_get_contents("php://input"), true);

    $emp_id    = $data['emp_id'] ?? null;
    $duration  = $data['duration'] ?? '';
    $department = $data['department'] ?? null;

    if (empty($duration)) {
        throw new Exception("Duration is required");
    }

    $conn->begin_transaction();

    $employees = [];

    /* ==============================
       CASE 1: All Employees
    ============================== */
    if ($department === 'all') {

        $result = $conn->query("SELECT id FROM Employs");

        while ($row = $result->fetch_assoc()) {
            $employees[] = (int)$row['id'];
        }
    }

    /* ==============================
       CASE 2: Department Employees
    ============================== */
    elseif ($department !== 'all' && $emp_id === 'all') {

        $stmt = $conn->prepare("SELECT id FROM Employs WHERE department_id = ?");
        $stmt->bind_param("i", $department);
        $stmt->execute();
        $result = $stmt->get_result();

        while ($row = $result->fetch_assoc()) {
            $employees[] = (int)$row['id'];
        }
    }

    /* ==============================
       CASE 3: Single Employee
    ============================== */
    elseif ($emp_id !== 'all') {

        $employees[] = (int)$emp_id;
    }

    else {
        throw new Exception("Invalid selection");
    }

    if (empty($employees)) {
        throw new Exception("No employees found");
    }

    /* ==============================
       Insert Payroll Records
    ============================== */

    $insertStmt = $conn->prepare("
        INSERT INTO payroll (employee_id, duration)
        VALUES (?, ?)
    ");

    $checkStmt = $conn->prepare("
        SELECT id FROM payroll 
        WHERE employee_id = ? AND duration = ?
    ");

    $inserted = 0;
    $skipped = [];

    foreach ($employees as $employee) {

        $checkStmt->bind_param("is", $employee, $duration);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();

        if ($checkResult->num_rows > 0) {
            $skipped[] = $employee;
            continue;
        }

        $insertStmt->bind_param("is", $employee, $duration);

        if (!$insertStmt->execute()) {
            throw new Exception("Insert failed for employee ID: $employee");
        }

        $inserted++;
    }

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Payroll processed successfully",
        "inserted" => $inserted,
        "skipped_existing" => $skipped
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
