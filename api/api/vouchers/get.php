<?php

header("Content-Type: application/json");
    
$id = $_GET['id11'] ?? 0;
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

$servername = "gateway01.eu-central-1.prod.aws.tidbcloud.com";
$port = 4000;
$username = "3AEZrv2kzEmLLGp.root";
$password = "IZS8gZtNqECsqPry";
$database = "test";
// ho gi ha 
$conn = mysqli_init();

// TiDB requires SSL. We set it here.
// Even with NULL parameters, this initializes the SSL state.
mysqli_ssl_set($conn, NULL, NULL, NULL, NULL, NULL);

// Key Change: Added MYSQLI_CLIENT_SSL at the end
if (!mysqli_real_connect($conn, $servername, $username, $password, $database, $port, NULL, MYSQLI_CLIENT_SSL)) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Connection Failed",
        "details" => mysqli_connect_error()
    ]);
    exit();
}
else {
    if ($id) {
         echo json_encode([
        "success" => true,
        "message" => "Connected to TiDB successfully!",
        "tables" => mysqli_query($conn, "SHOW TABLES")->fetch_all(MYSQLI_ASSOC)
    ]);
    }
  
}

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
