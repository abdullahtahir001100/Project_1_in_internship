<?php
include 'dbconfig/db_config.php';

$sql = "CREATE TABLE IF NOT EXISTS Employee_Ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    rating INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if($conn->query($sql)){
    echo json_encode(["success"=>"Employee_Ratings table created successfully"]);
}else{
    echo json_encode(["error"=>$conn->error]);
}
// ?>
// CREATE TABLE leave_records (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     emp_id INT NOT NULL,
//     date DATE NOT NULL,
//     type ENUM('leave','absent') NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

//     CONSTRAINT fk_employee
//         FOREIGN KEY (emp_id) REFERENCES employs(id)
//         ON DELETE CASCADE,

//     UNIQUE KEY unique_emp_date (emp_id, date)
// );