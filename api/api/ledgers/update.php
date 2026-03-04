<?php

include_once __DIR__ . "/../../dbconfig/db_config.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(["error" => "Only PUT requests are allowed"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

$id          = (int)($input['id'] ?? 0);
$name        = trim($input['name'] ?? '');
$father_name = trim($input['father_name'] ?? '');
$cnic        = trim($input['cnic'] ?? '');
$email       = trim($input['email'] ?? '');
$phone       = trim($input['phone'] ?? '');
$salary      = (int)($input['salary'] ?? 0);
$status      = $input['status'] ?? 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid ledger ID."]);
    exit;
}

if (empty($name)) {
    http_response_code(400);
    echo json_encode(["message" => "Name is required."]);
    exit;
}

$stmt = $conn->prepare("UPDATE ledgers SET name = ?, father_name = ?, cnic = ?, email = ?, phone = ?, salary = ?,status = '$status' WHERE id = ?");
$stmt->bind_param("sssssii", $name, $father_name, $cnic, $email, $phone, $salary, $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Ledger updated successfully!"]);
    } else {
        echo json_encode(["success" => true, "message" => "No changes made."]);
    }
} else {
    http_response_code(500);
    echo json_encode(["message" => "Failed to update ledger: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
