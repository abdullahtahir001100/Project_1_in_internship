<?php
include "dbconfig/db_config.php";

$sql = "
CREATE TABLE IF NOT EXISTS employ_bonus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employ_id INT NOT NULL,
    bonus_id INT NOT NULL,
    created_at DATE NOT NULL DEFAULT (CURRENT_DATE),

    FOREIGN KEY (employ_id) REFERENCES Employs(id) ON DELETE CASCADE,
    FOREIGN KEY (bonus_id) REFERENCES bonuses(id) ON DELETE CASCADE
);
";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => "employ_bonus table created successfully"]);
} else {
    echo json_encode(["error" => $conn->error]);
}
?>
