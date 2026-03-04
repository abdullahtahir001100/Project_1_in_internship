<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include "../../dbconfig/db_config";

// handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    echo json_encode([
        "success" => false,
        "error" => "Only PUT requests are allowed"
    ]);
    exit;
}

try {
    $data = json_decode(file_get_contents("php://input"), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON input: " . json_last_error_msg());
    }

    $id               = (int)($data['id'] ?? 0);
    $reason_type      = trim($data['reason_type'] ?? '');
    $reason           = trim($data['reason'] ?? '');
    $resignation_date = $data['resignation_date'] ?? null;

    if ($id <= 0 || $reason_type === '') {
        throw new Exception("Missing required fields");
    }

    $stmt = $conn->prepare("UPDATE reasons
                            SET reason_type = ?,
                                reason = ?,
                                resignation_date = ?
                            WHERE id = ?");
    $stmt->bind_param("sssi", $reason_type, $reason, $resignation_date, $id);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Resignation record updated successfully"
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