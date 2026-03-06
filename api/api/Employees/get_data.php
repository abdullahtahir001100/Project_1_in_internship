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

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
    echo json_encode(null);
    exit;
}

/* =========================
   1️⃣ GET EMPLOYEE DATA
========================= */

$sql = "SELECT Employs.*, 
               departments.department_name, 
               Posts.Post_name,
               ledgers.id AS ledger_id,
               ledgers.ledger_unique_id,
               ledgers.name AS ledger_name
        FROM Employs
        LEFT JOIN departments ON Employs.department_id = departments.id
        LEFT JOIN Posts ON Employs.post_id = Posts.id
        LEFT JOIN ledgers ON Employs.ledger_id = ledgers.id
        WHERE Employs.id = $id";

$result = $conn->query($sql);

if (!$result || $result->num_rows == 0) {
    echo json_encode(null);
    exit;
}

$row = $result->fetch_assoc();

/* =========================
   2️⃣ GET BONUSES
========================= */

$bonusQuery = " SELECT bonuses.id AS value, bonuses.bonusName AS label , bonuses.baseValue AS baseValue
    FROM employ_bonus
    LEFT JOIN bonuses ON employ_bonus.bonus_id = bonuses.id
    WHERE employ_bonus.employ_id = $id
";

$bonusResult = $conn->query($bonusQuery);

$bonuses = [];

while ($b = $bonusResult->fetch_assoc()) {
    $bonuses[] = $b;
}

$row['bonuses'] = $bonuses;

/* =========================
   3️⃣ GET DEDUCTIONS
========================= */

$deductionQuery = "
    SELECT deductions.id AS value, deductions.deduction_name AS label, deductions.deduction_amount AS baseValue
    FROM employ_deduction
    LEFT JOIN deductions ON employ_deduction.deduction_id = deductions.id
    WHERE employ_deduction.employ_id = $id
";

$deductionResult = $conn->query($deductionQuery);

$deductions = [];

while ($d = $deductionResult->fetch_assoc()) {
    $deductions[] = $d;
}

$row['deductions'] = $deductions;

/* =========================
   RETURN RESULT
========================= */

echo json_encode($row);
?>
