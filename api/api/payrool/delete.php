
<?php
header("Content-Type: application/json");
    
$id = $_GET['id11'] ?? 0;
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

$servername = "gateway01.eu-central-1.prod.aws.tidbcloud.com";
$port = 4000;
$username = "3AEZrv2kzEmLLGp.root";
$password = "IZS8gZtNqECsqPry";
$database = "test";
// ho gi ha 
$conn = mysqli_init();

// TiDB requires SSL. We set it here.
// Even with NULL parameters, this initializes the SSL state.
mysqli_ssl_set($conn, NULL, NULL, NULL, NULL, NULL);

// Key Change: Added MYSQLI_CLIENT_SSL at the end
if (!mysqli_real_connect($conn, $servername, $username, $password, $database, $port, NULL, MYSQLI_CLIENT_SSL)) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "Connection Failed",
        "details" => mysqli_connect_error()
    ]);
    exit();
}
else {
    if ($id) {
         echo json_encode([
        "success" => true,
        "message" => "Connected to TiDB successfully!",
        "tables" => mysqli_query($conn, "SHOW TABLES")->fetch_all(MYSQLI_ASSOC)
    ]);
    }
  
}
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