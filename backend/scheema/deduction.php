<?php
include "dbconfig/db_config.php";

$sql = "
CREATE TABLE IF NOT EXISTS deductions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deduction_name VARCHAR(255) NOT NULL,
    deduction_amount INT NOT NULL,
    created_at DATE NOT NULL DEFAULT (CURRENT_DATE)
);
";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => "Table created successfully"]);
} else {
    echo json_encode(["error" => $conn->error]);
}


?>
