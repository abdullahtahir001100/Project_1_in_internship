<?php
include 'dbconfig/db_config.php';

$sql = "CREATE TABLE IF NOT EXISTS bonus_child (
    id INT AUTO_INCREMENT PRIMARY KEY,
   employee_id INT NOT NULL,
    bonus INT  NULL,
    fine INT NULL,
    bonus_main_id INT NOT NULL,
   foreign key (bonus_main_id) references bonus_main(id) on delete cascade,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if($conn->query($sql)){
    echo json_encode(["success"=>"bonus_child table created successfully"]);
}else{
    echo json_encode(["error"=>$conn->error]);
}
?>
