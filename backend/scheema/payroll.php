<?php
include 'dbconfig/db_config.php';

$sql = "CREATE TABLE IF NOT EXISTS payroll (
    id INT AUTO_INCREMENT PRIMARY KEY,
   employee_id INT NOT NULL,
   duration VARCHAR(50) NOT NULL,
   foreign key (employee_id) references Employs(id) on delete cascade,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if($conn->query($sql)){
    echo json_encode(["success"=>"payroll table created successfully"]);
}else{
    echo json_encode(["error"=>$conn->error]);
}
?>
