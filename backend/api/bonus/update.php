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

    // Read JSON body
    $data = json_decode(file_get_contents("php://input"), true);

    $bonusName = $data['bonusName'] ?? '';
    $baseValue = $data['baseValue'] ?? '';
    $id        = $data['editId'] ?? '';

    // Basic validation
    if (empty($id) || empty($bonusName) || empty($baseValue)) {
        throw new Exception("All fields are required.");
    }

    if (!is_numeric($baseValue) || !is_numeric($id)) {
        throw new Exception("Invalid numeric value.");
    }

    // ✅ Use prepared statement (secure)
    $stmt = $conn->prepare("
        UPDATE bonuses 
        SET bonusName = ?, baseValue = ? 
        WHERE id = ?
    ");

    $stmt->bind_param("sdi", $bonusName, $baseValue, $id);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Bonus '$bonusName' updated successfully!"
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
