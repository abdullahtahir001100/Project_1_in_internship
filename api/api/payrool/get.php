<?php
include_once __DIR__ . "/../../dbconfig/db_config.php";

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