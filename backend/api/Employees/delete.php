<?php

include "../../dbconfig/db_config.php";

$input = json_decode(file_get_contents("php://input"), true);

if(!isset($input['id'])){
    echo json_encode(["status" => "error", "message" => "ID missing"]);
    exit;
}

$id = $input['id'];


$stmt = $conn->prepare("DELETE FROM Employs WHERE id = ?");
$stmt->bind_param("i", $id);

if($stmt->execute()){
    echo json_encode(["status" => "success", "message" => "Employee deleted"]);
}else{
    echo json_encode(["status" => "error", "message" => "Delete failed"]);
}

$stmt->close();
$conn->close();
?>
