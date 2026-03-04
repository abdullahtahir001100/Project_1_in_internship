<?php
include "dbconfig/db_config";

$sql = "
CREATE TABLE IF NOT EXISTS ledgers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ledger_unique_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    father_name VARCHAR(255) DEFAULT NULL,
    cnic VARCHAR(255) DEFAULT NULL,
    email VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    salary INT DEFAULT 0,
    status VARCHAR(255) DEFAULT 'active',
    created_at DATE NOT NULL DEFAULT (CURRENT_DATE)
);
";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => "Table created successfully"]);
} else {
    echo json_encode(["error" => $conn->error]);
}

?>
//ALTER TABLE ledgers ADD COLUMN email VARCHAR(255) DEFAULT NULL AFTER cnic;
ALTER TABLE ledgers ADD COLUMN salary INT DEFAULT 0 AFTER phone;
ALTER TABLE ledgers MODIFY COLUMN address VARCHAR(255) DEFAULT NULL;
