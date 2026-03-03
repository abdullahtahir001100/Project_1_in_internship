<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include "../../dbconfig/db_config.php";

// handle preflight
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
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON input: " . json_last_error_msg());
    }

    $employee_id      = (int)($data['employee_id'] ?? 0);
    $reason_type      = trim($data['reason_type'] ?? '');
    $reason           = trim($data['reason'] ?? '');
    $resignation_date = $data['resignation_date'] ?? date('Y-m-d');

    if ($employee_id <= 0 || $reason_type === '') {
        throw new Exception("Missing required fields");
    }

    $stmt = $conn->prepare("INSERT INTO reasons (employee_id, reason_type, reason, resignation_date, created_at)
                            VALUES (?, ?, ?, ?, NOW())");
    $stmt->bind_param("isss", $employee_id, $reason_type, $reason, $resignation_date);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Resignation record saved successfully"
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

$conn->close();
?>