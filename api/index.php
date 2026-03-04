<?php 

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
include "dbconfig/db_config";
include "scheema/departments";
include "scheema/Posts";
include "scheema/Employs";
include "scheema/questions";
include "scheema/child_question";
include "scheema/rating_table";
include "scheema/bonus";
include "scheema/deduction";
include "scheema/bonus_employ";
include "scheema/deduction_employ";
include "scheema/bonusmain";
include "scheema/bonuschild";
include "scheema/payroll";
include "scheema/reasons";
include "scheema/ledgers";
include "scheema/vouchers";
include "scheema/leave_records";
include "scheema/voucher_entries";

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

?>