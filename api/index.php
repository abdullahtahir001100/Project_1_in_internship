<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// -------------------------------
// 1️⃣ Schemas
// -------------------------------
// Ye sirf index.php ke liye hai. Nested APIs apna DB + schema include karegi.
include_once __DIR__ . "/../scheema/departments.php";
include_once __DIR__ . "/../scheema/Posts.php";
include_once __DIR__ . "/../scheema/Employs.php";
include_once __DIR__ . "/../scheema/questions.php";
include_once __DIR__ . "/../scheema/child_question.php";
include_once __DIR__ . "/../scheema/rating_table.php";
include_once __DIR__ . "/../scheema/bonus.php";
include_once __DIR__ . "/../scheema/deduction.php";
include_once __DIR__ . "/../scheema/bonus_employ.php";
include_once __DIR__ . "/../scheema/deduction_employ.php";
include_once __DIR__ . "/../scheema/bonusmain.php";
include_once __DIR__ . "/../scheema/bonuschild.php";
include_once __DIR__ . "/../scheema/payroll.php";
include_once __DIR__ . "/../scheema/reasons.php";
include_once __DIR__ . "/../scheema/ledgers.php";
include_once __DIR__ . "/../scheema/vouchers.php";
include_once __DIR__ . "/../scheema/leave_records.php";
include_once __DIR__ . "/../scheema/voucher_entries.php";

// -------------------------------
// 2️⃣ Router Logic
// -------------------------------

// Get path after /api
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$base = '/api/';
$path = str_starts_with($uri, $base) ? substr($uri, strlen($base)) : '';
$path = trim($path, '/');

// Default route
if ($path === '' || $path === false) {
    $path = 'index.php';
}

// If extension missing, assume .php
if (!str_ends_with($path, '.php')) {
    $path .= '.php';
}

// Absolute path of requested file
$fullPath = __DIR__ . '/' . $path;

// Security: prevent directory traversal
$realBase = realpath(__DIR__);
$realFile = realpath($fullPath);

if ($realFile && str_starts_with($realFile, $realBase) && file_exists($realFile)) {
    // Nested API file will include its own DB + required schema
    require $realFile;
    exit;
}

// -------------------------------
// 3️⃣ Route not found
// -------------------------------
http_response_code(404);
echo json_encode(["error" => "Route not found"]);

?>