<?php
header("Access-Control-Allow-Origin: *");
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
$employees = [];

/* Get duration from frontend */
$duration = $_GET['duration'] ?? '';

$sql = "SELECT Employs.*, departments.department_name, Posts.Post_name 
        FROM Employs 
        LEFT JOIN departments ON Employs.department_id = departments.id 
        LEFT JOIN Posts ON Employs.post_id = Posts.id";

$result = $conn->query($sql);

while ($row = $result->fetch_assoc()) {

    $emp_id = $row['id'];

    /* ================================
       1️⃣ Check Payroll Status
    ================================= */

    $is_processed = 0;

    if (!empty($duration)) {
        $checkStmt = $conn->prepare("
            SELECT id FROM payroll 
            WHERE employee_id = ? AND duration = ?
        ");
        $checkStmt->bind_param("is", $emp_id, $duration);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();

        if ($checkResult->num_rows > 0) {
            $is_processed = 1;
        }
    }

    $row['is_processed'] = $is_processed;

    /* ================================
       2️⃣ Bonuses
    ================================= */

    $bonus_sql = "SELECT bonuses.id, bonuses.bonusName AS name, bonuses.baseValue AS value 
                  FROM employ_bonus 
                  LEFT JOIN bonuses ON employ_bonus.bonus_id = bonuses.id 
                  WHERE employ_bonus.employ_id = $emp_id";

    $bonus_result = $conn->query($bonus_sql);
    $bonuses = [];

    if ($bonus_result) {
        while ($b = $bonus_result->fetch_assoc()) {
            $bonuses[] = $b;
        }
    }

    $row['bonuses'] = $bonuses;

    /* ================================
       3️⃣ Deductions
    ================================= */

    $deduction_sql = "SELECT deductions.id, deductions.deduction_name AS name, deductions.deduction_amount AS value 
                      FROM employ_deduction 
                      LEFT JOIN deductions ON employ_deduction.deduction_id = deductions.id 
                      WHERE employ_deduction.employ_id = $emp_id";

    $deduction_result = $conn->query($deduction_sql);
    $deductions = [];

    if ($deduction_result) {
        while ($d = $deduction_result->fetch_assoc()) {
            $deductions[] = $d;
        }
    }

    $row['deductions'] = $deductions;

    /* ================================
       4️⃣ Bonus Main (Monthly Bonus/Fine)
    ================================= */

    $bonus_main_sql = "SELECT 
            bonus_child.employee_id,
            bonus_main.id,
            bonus_main.month,
            bonus_main.year,
            bonus_main.type,
            bonus_child.bonus,
            bonus_child.fine
        FROM bonus_child
        INNER JOIN bonus_main 
            ON bonus_child.bonus_main_id = bonus_main.id
        WHERE bonus_child.employee_id = $emp_id";

    $bonus_main_result = $conn->query($bonus_main_sql);
    $bonus_main = [];

    if ($bonus_main_result) {
        while ($bm = $bonus_main_result->fetch_assoc()) {
            $bonus_main[] = $bm;
        }
    }

    $row['bonus_main'] = $bonus_main;

    // $employees[] = $row;
     /* ================================
       4️⃣ Advance in vouchers  Main (Monthly Bonus/Fine)
    ================================= */
    
   $vouchers_main_sql = "SELECT vm.date, z.amount, z.id as entry_id
        FROM voucher_entries z
        LEFT JOIN vouchers vm ON vm.id = z.voucher_id
        WHERE z.ledger_id = $emp_id AND z.entry_type = 'credit'
        ORDER BY vm.date DESC";

$vouchers_main_result = $conn->query($vouchers_main_sql);
$grouped_vouchers = [];

if ($vouchers_main_result) {
    while ($vm = $vouchers_main_result->fetch_assoc()) {
        $date = explode('-', $vm['date'])[0] . '-' . explode('-', $vm['date'])[1]; // YYYY-MM
        
        
        if (!isset($grouped_vouchers[$date])) {
            $grouped_vouchers[$date] = [
                'date' => $date,
                'total_amount' => 0,
                'vouchers' => [] // Ismein us din ke saare vouchers jayenge
            ];
        }

        // Voucher details add karo
        $grouped_vouchers[$date]['vouchers'][] = [
            'entry_id' => $vm['entry_id'],
            'amount' => $vm['amount']
        ];

        // Saath hi saath total bhi barhate jao
        $grouped_vouchers[$date]['total_amount'] += $vm['amount'];
    }
}

// Array ki keys (dates) hata kar simple list banane ke liye array_values use karein
$row['vouchers_main'] = array_values($grouped_vouchers);

    $employees[] = $row;

}

echo json_encode([
    "success" => true,
    "data" => $employees
], JSON_PRETTY_PRINT);

$conn->close();
?>
