<?php
include "dbconfig/db_config.php";

$sql = "
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(255) NOT NULL,
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
