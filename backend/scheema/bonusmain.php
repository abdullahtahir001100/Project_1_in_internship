<?php
include 'dbconfig/db_config.php';

$sql = "CREATE TABLE IF NOT EXISTS bonus_main (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
 
    month INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if($conn->query($sql)){
    echo json_encode(["success"=>"bonus_main table created successfully"]);
}else{
    echo json_encode(["error"=>$conn->error]);
}
?>
