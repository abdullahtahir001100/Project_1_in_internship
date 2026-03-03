<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "../../dbconfig/db_config.php";

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['id']) || empty($input['id'])) {
    echo json_encode([
        "status" => "error",
        "message" => "ID missing"
    ]);
    exit;
}

$id = (int)$input['id'];

try {

    $conn->begin_transaction();

    $stmt = $conn->prepare("DELETE FROM bonus_main WHERE id = ?");
    $stmt->bind_param("i", $id);

    if (!$stmt->execute()) {
        throw new Exception($stmt->error);
    }

    if ($stmt->affected_rows === 0) {
        throw new Exception("Record not found");
    }

    $conn->commit();

    echo json_encode([
        "status" => "success",
        "message" => "Bonus_main deleted successfully"
    ]);

} catch (Exception $e) {

    $conn->rollback();

    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

$stmt->close();
$conn->close();
?>
