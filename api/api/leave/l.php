<?php
    
$id = $_GET['id11'] ?? 0;
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

$servername = "gateway01.eu-central-1.prod.aws.tidbcloud.com";
$port = 4000;
$username = "3AEZrv2kzEmLLGp.root";
$password = "qOakZjYjWqhDR7G4";
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


header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];

function respond($success, $message = null, $data = null) {
    echo json_encode([
        "success" => $success,
        "message" => $message,
        "data" => $data
    ]);
    exit;
}

switch ($method) {

    // =====================================================
    // GET → Fetch records by year & month (with emp filter)
    // =====================================================
    case "GET":

        if (!isset($_GET['year']) || !isset($_GET['month'])) {
            respond(false, "Year and month are required.");
        }

        $year  = intval($_GET['year']);
        $month = intval($_GET['month']);
        $empId = isset($_GET['emp_id']) && $_GET['emp_id'] !== '' 
                    ? intval($_GET['emp_id']) 
                    : null;

        if ($year < 2000 || $year > 2100 || $month < 1 || $month > 12) {
            respond(false, "Invalid year or month.");
        }

        $startDate = sprintf("%04d-%02d-01", $year, $month);
        $endDate   = date("Y-m-t", strtotime($startDate));

        $sql = "
            SELECT 
                lr.id,
                lr.emp_id,
                DATE_FORMAT(lr.date, '%Y-%m-%d') as date,
                lr.type,
                CONCAT(e.first_name, ' ', e.last_name) AS emp_name
            FROM leave_records lr
            INNER JOIN employs e ON lr.emp_id = e.id
            WHERE lr.date BETWEEN ? AND ?
        ";

        if ($empId !== null) {
            $sql .= " AND lr.emp_id = ?";
        }

        $sql .= " ORDER BY lr.date ASC";

        $stmt = $conn->prepare($sql);

        if (!$stmt) {
            respond(false, "Prepare failed: " . $conn->error);
        }

        if ($empId !== null) {
            $stmt->bind_param("ssi", $startDate, $endDate, $empId);
        } else {
            $stmt->bind_param("ss", $startDate, $endDate);
        }

        $stmt->execute();
        $result = $stmt->get_result();

        $records = [];
        while ($row = $result->fetch_assoc()) {
            $records[] = $row;
        }

        respond(true, null, $records);
        break;


    // ====================
    // POST → Create or Update (Duplicate Safe)
    // ====================
    case "POST":

        $input = json_decode(file_get_contents("php://input"), true);

        if (!isset($input['emp_id'], $input['date'], $input['type'])) {
            respond(false, "Missing required fields.");
        }

        $emp_id = intval($input['emp_id']);
        $date   = $input['date'];
        $type   = $input['type'];

        if (!in_array($type, ['leave', 'absent'])) {
            respond(false, "Invalid type value.");
        }

        // 🔥 Auto update if same emp/date exists
        $stmt = $conn->prepare("
            INSERT INTO leave_records (emp_id, date, type)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
                type = VALUES(type),
                updated_at = CURRENT_TIMESTAMP
        ");

        if (!$stmt) {
            respond(false, "Prepare failed: " . $conn->error);
        }

        $stmt->bind_param("iss", $emp_id, $date, $type);

        if ($stmt->execute()) {
            respond(true, "Record saved successfully.");
        } else {
            respond(false, "Execute failed: " . $stmt->error);
        }

        break;


    // ====================
    // PUT → Update record safely
    // ====================
    case "PUT":

        $input = json_decode(file_get_contents("php://input"), true);

        if (!isset($input['id'], $input['emp_id'], $input['date'], $input['type'])) {
            respond(false, "Missing required fields.");
        }

        $id     = intval($input['id']);
        $emp_id = intval($input['emp_id']);
        $date   = $input['date'];
        $type   = $input['type'];

        if (!in_array($type, ['leave', 'absent'])) {
            respond(false, "Invalid type value.");
        }

        $stmt = $conn->prepare("
            UPDATE leave_records
            SET emp_id = ?, date = ?, type = ?
            WHERE id = ?
        ");

        if (!$stmt) {
            respond(false, "Prepare failed: " . $conn->error);
        }

        $stmt->bind_param("issi", $emp_id, $date, $type, $id);

        if ($stmt->execute()) {
            respond(true, "Record updated successfully.");
        } else {
            respond(false, "Execute failed: " . $stmt->error);
        }

        break;


    // ====================
    // DELETE → Remove record
    // ====================
    case "DELETE":

        if (!isset($_GET['id'])) {
            respond(false, "ID is required.");
        }

        $id = intval($_GET['id']);

        $stmt = $conn->prepare("DELETE FROM leave_records WHERE id = ?");

        if (!$stmt) {
            respond(false, "Prepare failed: " . $conn->error);
        }

        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            respond(true, "Record deleted successfully.");
        } else {
            respond(false, "Execute failed: " . $stmt->error);
        }

        break;


    default:
        respond(false, "Invalid request method.");
}
?>