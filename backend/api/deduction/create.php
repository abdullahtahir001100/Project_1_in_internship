<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include "../../dbconfig/db_config.php";

// Handle preflight
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

    // ✅ Read JSON input from axios
    $data = json_decode(file_get_contents("php://input"), true);

    $deduction_name = $data['deduction_name'] ?? '';
    $deduction_amount = $data['deduction_amount'] ?? '';

   

    $stmt = $conn->prepare("
        INSERT INTO deductions (deduction_name, deduction_amount, created_at)
        VALUES (?, ?, NOW())
    ");

    $stmt->bind_param("sd", $deduction_name, $deduction_amount);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "deduction '$deduction_name' added successfully!"
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
