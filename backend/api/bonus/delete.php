<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

header("Access-Control-Allow-Methods: DELETE");
header("Access-Control-Allow-Headers: Content-Type");

include "../../dbconfig/db_config.php";

$input = json_decode(file_get_contents("php://input"), true);

if(!isset($input['id'])){
    echo json_encode(["status" => "error", "message" => "ID missing"]);
    exit;
}

$id = $input['id'];


$stmt = $conn->prepare("DELETE FROM bonuses WHERE id = ?");
$stmt->bind_param("i", $id);

if($stmt->execute()){
    echo json_encode(["status" => "success", "message" => "Bonus deleted Successfully"]);
}else{
    echo json_encode(["status" => "error", "message" => "Delete failed"]);
}

$stmt->close();
$conn->close();
?>
