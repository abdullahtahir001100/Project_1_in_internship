<?php
include "dbconfig/db_config.php";

$sql = "
CREATE TABLE IF NOT EXISTS vouchers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jv_number VARCHAR(50) NOT NULL UNIQUE,
    reference_no VARCHAR(100) DEFAULT NULL,
    date DATE NOT NULL,
    narration TEXT DEFAULT NULL,
    image VARCHAR(500) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => "Vouchers table created successfully"]);
} else {
    echo json_encode(["error" => $conn->error]);
}

?>
