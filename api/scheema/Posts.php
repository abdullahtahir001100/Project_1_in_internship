<?php
include "dbconfig/db_config.php";

$sql = "
CREATE TABLE IF NOT EXISTS Posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Post_name VARCHAR(255) NOT NULL,
    department_id INT DEFAULT 1,
    created_at DATE NOT NULL DEFAULT (CURRENT_DATE),
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);
";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => "Table created successfully"]);
} else {
    echo json_encode(["error" => $conn->error]);
}


?>
