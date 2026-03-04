<?php

include_once __DIR__ . "/../../dbconfig/db_config.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(["error" => "Only DELETE requests are allowed"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['id'])) {
    http_response_code(400);
    echo json_encode(["message" => "ID is required."]);
    exit;
}

$id = (int)$input['id'];

$stmt = $conn->prepare("DELETE FROM ledgers WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Ledger deleted successfully."]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Failed to delete ledger: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
