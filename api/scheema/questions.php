<?php
include "dbconfig/db_config.php";

$sql = "
CREATE TABLE IF NOT EXISTS Main_Question (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_name VARCHAR(255) NOT NULL,
    Rating INT NOT NULL,
    parent_id INT NOT NULL,
    FOREIGN KEY (parent_id) REFERENCES Posts(id) ON DELETE CASCADE,
    created_at DATE NOT NULL DEFAULT (CURRENT_DATE)
);
";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => "Table created successfully"]);
} else {
    echo json_encode(["error" => $conn->error]);
}


?>
