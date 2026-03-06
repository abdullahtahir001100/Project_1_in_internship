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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Only POST allowed"]);
    exit;
}

try {

    $input = json_decode(file_get_contents("php://input"), true);

    $employee_id = $input['employee_id'] ?? 0;
    $ratings = $input['ratings'] ?? [];

    if (!$employee_id || empty($ratings)) {
        throw new Exception("Missing employee_id or ratings");
    }

    // 🔁 Remove old ratings (update case)
    $delete = $conn->prepare("DELETE FROM Employee_Ratings WHERE employee_id = ?");
    $delete->bind_param("i", $employee_id);
    $delete->execute();
    $delete->close();

    // Prepare insert
    $stmt = $conn->prepare("
        INSERT INTO Employee_Ratings 
        (employee_id, question_id, sub_question_id, rating) 
        VALUES (?, ?, ?, ?)
    ");

    foreach ($ratings as $key => $value) {

        $rating = (int)$value;

        $question_id = NULL;
        $sub_question_id = NULL;

        // 🔹 If key starts with q_ → main question
        if (strpos($key, 'q_') === 0) {
            $question_id = (int) str_replace('q_', '', $key);
        } else {
            // 🔹 Otherwise → child question
            $sub_question_id = (int)$key;
        }

        $stmt->bind_param(
            "iiii",
            $employee_id,
            $question_id,
            $sub_question_id,
            $rating
        );

        if (!$stmt->execute()) {
            throw new Exception($stmt->error);
        }
    }

    $stmt->close();

    echo json_encode([
        "success" => true,
        "message" => "Ratings saved successfully"
    ]);

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}

$conn->close();
?>
