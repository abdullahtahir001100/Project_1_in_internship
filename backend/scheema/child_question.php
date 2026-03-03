<?php
include "dbconfig/db_config.php";

$sql = "CREATE TABLE IF NOT EXISTS Child_Question (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Child_question_name VARCHAR(255) NOT NULL,
    rating INT NOT NULL,
    parent_id_question INT NOT NULL,
    FOREIGN KEY (parent_id_question) REFERENCES Main_Question(id) ON DELETE CASCADE,
    created_at DATE NOT NULL DEFAULT (CURRENT_DATE)
);
";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => "Table created successfully"]);
} else {
    echo json_encode(["error" => $conn->error]);
}


?>
