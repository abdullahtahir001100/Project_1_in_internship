<?php

include "../../dbconfig/db_config";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Accept GET with ?id=X
$id = (int)($_GET['id'] ?? 0);

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "Voucher ID is required."]);
    exit;
}

$stmt = $conn->prepare("SELECT * FROM vouchers WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(["message" => "Voucher not found."]);
    $stmt->close();
    $conn->close();
    exit;
}

$voucher = $result->fetch_assoc();
$stmt->close();

// Fetch debit entries
$debitStmt = $conn->prepare("
    SELECT ve.*, l.name AS ledger_name 
    FROM voucher_entries ve 
    LEFT JOIN ledgers l ON ve.ledger_id = l.id 
    WHERE ve.voucher_id = ? AND ve.entry_type = 'debit'
");
$debitStmt->bind_param("i", $id);
$debitStmt->execute();
$debitResult = $debitStmt->get_result();
$voucher['debit_entries'] = [];
while ($d = $debitResult->fetch_assoc()) {
    $voucher['debit_entries'][] = $d;
}
$debitStmt->close();

// Fetch credit entries
$creditStmt = $conn->prepare("
    SELECT ve.*, l.name AS ledger_name 
    FROM voucher_entries ve 
    LEFT JOIN ledgers l ON ve.ledger_id = l.id 
    WHERE ve.voucher_id = ? AND ve.entry_type = 'credit'
");
$creditStmt->bind_param("i", $id);
$creditStmt->execute();
$creditResult = $creditStmt->get_result();
$voucher['credit_entries'] = [];
while ($c = $creditResult->fetch_assoc()) {
    $voucher['credit_entries'][] = $c;
}
$creditStmt->close();

echo json_encode($voucher);

$conn->close();
?>
