
<?php
include "../../dbconfig/db_config.php";
$input = $_GET['date'];

$date = explode("-", $input)[0] . "-" . str_pad(explode("-", $input)[1], 2, "0", STR_PAD_LEFT);
echo json_encode(["status" => "success", "message" => "Attempting to delete payroll records for $date"]);
$stmt = $conn->prepare("DELETE FROM payroll WHERE duration = ?");
$stmt->bind_param("s", $date);
if($stmt->execute()){
    echo json_encode(["status" => "success", "message" => "Payroll records for $date deleted Successfully"]);
}else{
    echo json_encode(["status" => "error", "message" => "Delete failed"]);
}
$stmt->close();
$conn->close();

?>