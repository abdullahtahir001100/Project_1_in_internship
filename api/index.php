<?php 

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");


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

$fullPath = __DIR__ . '/' . $path;

// Security: prevent directory traversal
$realBase = realpath(__DIR__);
$realFile = realpath($fullPath);

if ($realFile && str_starts_with($realFile, $realBase) && file_exists($realFile)) {
    require $realFile;
    exit;
}

http_response_code(404);
echo json_encode(["error" => "Route not found"]);
include "dbconfig/db_config.php";
include "scheema/departments.php";
include "scheema/Posts.php";
include "scheema/Employs.php";
include "scheema/questions.php";
include "scheema/child_question.php";
include "scheema/rating_table.php";
include "scheema/bonus.php";
include "scheema/deduction.php";
include "scheema/bonus_employ.php";
include "scheema/deduction_employ.php";
include "scheema/bonusmain.php";
include "scheema/bonuschild.php";
include "scheema/payroll.php";
include "scheema/reasons.php";
include "scheema/ledgers.php";
include "scheema/vouchers.php";
include "scheema/leave_records.php";
include "scheema/voucher_entries.php";

?>