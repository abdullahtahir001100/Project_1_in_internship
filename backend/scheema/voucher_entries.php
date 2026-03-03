<?php
include "dbconfig/db_config.php";

$sql = "
CREATE TABLE IF NOT EXISTS voucher_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    voucher_id INT NOT NULL,
    entry_type ENUM('debit', 'credit') NOT NULL,
    ledger_id INT NOT NULL,
    description TEXT DEFAULT NULL,
    amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE,
    FOREIGN KEY (ledger_id) REFERENCES ledgers(id) ON DELETE CASCADE
);
";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => "Voucher entries table created successfully"]);
} else {
    echo json_encode(["error" => $conn->error]);
}

?>
