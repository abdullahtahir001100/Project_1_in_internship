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

  

    $id = $_POST['id'] ?? 0;

    $stmt = $conn->prepare("UPDATE departments SET department_name = ?, status = ?, created_at = NOW() WHERE id = ?");
    $stmt->bind_param("sii", $deptName, $status, $id);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Department $deptName updated successfully!"
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
