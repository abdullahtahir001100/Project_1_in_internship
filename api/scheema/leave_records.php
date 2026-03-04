<?php
include 'dbconfig/db_config';

$sql = "CREATE TABLE IF NOT EXISTS leave_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
     emp_id INT NOT NULL,
     date DATE NOT NULL,
     type ENUM('leave','absent') NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

     CONSTRAINT fk_employee
         FOREIGN KEY (emp_id) REFERENCES employs(id)
         ON DELETE CASCADE,

     UNIQUE KEY unique_emp_date (emp_id, date)
)";

if($conn->query($sql)){
    echo json_encode(["success"=>"leave_records table created successfully"]);
}else{
    echo json_encode(["error"=>$conn->error]);
}
 ?>