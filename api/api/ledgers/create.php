<?php

include_once __DIR__ . "/../../dbconfig/db_config.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Only POST requests are allowed"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

$name        = trim($input['name'] ?? '');
$father_name = trim($input['father_name'] ?? '');
$cnic        = trim($input['cnic'] ?? '');
$email       = trim($input['email'] ?? '');
$phone       = trim($input['phone'] ?? '');
$salary      = (int)($input['salary'] ?? 0);
$status      = $input['status'] ?? 0;

if (empty($name)) {
    http_response_code(400);
    echo json_encode(["message" => "Name is required."]);
    exit;
}

// Generate unique ledger ID: LDG-XXXXXX
$unique_id = 'LDG-' . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);

// Make sure unique_id is actually unique
$check = $conn->prepare("SELECT id FROM ledgers WHERE ledger_unique_id = ?");
$check->bind_param("s", $unique_id);
$check->execute();
$check->store_result();
while ($check->num_rows > 0) {
    $unique_id = 'LDG-' . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
    $check->bind_param("s", $unique_id);
    $check->execute();
    $check->store_result();
}
$check->close();

$stmt = $conn->prepare("INSERT INTO ledgers (ledger_unique_id, name, father_name, cnic, email, phone, salary,status) VALUES (?, ?, ?, ?, ?, ?, ?,'$status')");
$stmt->bind_param("ssssssi", $unique_id, $name, $father_name, $cnic, $email, $phone, $salary);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Ledger '$name' created successfully!",
        "id" => $conn->insert_id,
        "ledger_unique_id" => $unique_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Failed to create ledger: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
