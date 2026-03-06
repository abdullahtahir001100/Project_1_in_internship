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

// Order by date to ensure consistency
$sql = "SELECT * FROM payroll ORDER BY created_at DESC";
$result = $conn->query($sql);

$groupedData = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        // Extract the date (YYYY-MM-DD) to use as the grouping key
        $dateKey = $row['duration'];
        
        // Initialize the date group if it doesn't exist
        if (!isset($groupedData[$dateKey])) {
            $groupedData[$dateKey] = [
                "date" => $dateKey,
                "total_employees" => 0,
                "employees" => []
            ];
        }
        
        // Push the employee data into the specific date group
        $groupedData[$dateKey]['employees'][] = [
            "id" => $row['id'],
            "employee_id" => $row['employee_id'],
            "duration" => $row['duration'],
            "created_at" => $row['created_at']
        ];
        
        // Increment the count for that date
        $groupedData[$dateKey]['total_employees']++;
    }
}

// Use array_values to remove the date strings as keys and return a clean indexed array
echo json_encode(array_values($groupedData), JSON_PRETTY_PRINT);
?>