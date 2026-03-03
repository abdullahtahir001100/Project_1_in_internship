<?php

include "../../dbconfig/db_config.php";

// ── Get all vouchers with their entries ─────────────────────────────
$sql = "SELECT * FROM vouchers ORDER BY id DESC";
$result = $conn->query($sql);

$vouchers = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $voucher_id = $row['id'];

        // Fetch debit entries
        $debitStmt = $conn->prepare("
            SELECT ve.*, l.name AS ledger_name 
            FROM voucher_entries ve 
            LEFT JOIN ledgers l ON ve.ledger_id = l.id 
            WHERE ve.voucher_id = ? AND ve.entry_type = 'debit'
        ");
        $debitStmt->bind_param("i", $voucher_id);
        $debitStmt->execute();
        $debitResult = $debitStmt->get_result();
        $row['debit_entries'] = [];
        while ($d = $debitResult->fetch_assoc()) {
            $row['debit_entries'][] = $d;
        }
        $debitStmt->close();

        // Fetch credit entries
        $creditStmt = $conn->prepare("
            SELECT ve.*, l.name AS ledger_name 
            FROM voucher_entries ve 
            LEFT JOIN ledgers l ON ve.ledger_id = l.id 
            WHERE ve.voucher_id = ? AND ve.entry_type = 'credit'
        ");
        $creditStmt->bind_param("i", $voucher_id);
        $creditStmt->execute();
        $creditResult = $creditStmt->get_result();
        $row['credit_entries'] = [];
        while ($c = $creditResult->fetch_assoc()) {
            $row['credit_entries'][] = $c;
        }
        $creditStmt->close();

        // Compute totals for list view
        $row['debit_total'] = array_sum(array_column($row['debit_entries'], 'amount'));
        $row['credit_total'] = array_sum(array_column($row['credit_entries'], 'amount'));

        $vouchers[] = $row;
    }
}

echo json_encode($vouchers);

$conn->close();
?>
