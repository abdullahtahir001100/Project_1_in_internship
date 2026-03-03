<?php
include "dbconfig/db_config.php";

$sql = "
CREATE TABLE IF NOT EXISTS Employs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    department_id INT NOT NULL,
    post_id INT NOT NULL,
    Salery INT NOT NULL,
    ledger_id INT DEFAULT NULL,
    status TINYINT(1) DEFAULT 1,
    created_at DATE NOT NULL DEFAULT (CURRENT_DATE)
);
";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => "Table created successfully"]);
} else {
    echo json_encode(["error" => $conn->error]);
}


?>
