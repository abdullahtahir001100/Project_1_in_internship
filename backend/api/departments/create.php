<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include "../../dbconfig/db_config.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Only POST requests are allowed"]);
    exit;
}

try {
    $deptName = $_POST['Department_name'] ?? '';
    $status = $_POST['status'] ?? '';

  

    $stmt = $conn->prepare("INSERT INTO departments (department_name, status, created_at) VALUES (?, ?, NOW())");
    $stmt->bind_param("si", $deptName, $status);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Department $deptName added successfully!"
        ]);
    } else {
        throw new Exception($stmt->error);
    }

    $stmt->close();
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}


?>
