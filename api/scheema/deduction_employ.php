<?php
include "dbconfig/db_config.php";

$sql = "
CREATE TABLE IF NOT EXISTS employ_deduction (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employ_id INT NOT NULL,
    deduction_id INT NOT NULL,
    created_at DATE NOT NULL DEFAULT (CURRENT_DATE),

    FOREIGN KEY (employ_id) REFERENCES Employs(id) ON DELETE CASCADE,
    FOREIGN KEY (deduction_id) REFERENCES deductions(id) ON DELETE CASCADE
);
";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => "employ_deduction table created successfully"]);
} else {
    echo json_encode(["error" => $conn->error]);
}
?>
