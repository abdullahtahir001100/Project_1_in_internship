<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Base path for project
$basePath = realpath(__DIR__ . '/../'); // /var/task/user

// DB config
include_once $basePath . '/dbconfig/db_config.php';

// Schemas
$scheema = $basePath . '/scheema';
include_once $scheema . '/departments.php';
include_once $scheema . '/Posts.php';
include_once $scheema . '/Employs.php';
include_once $scheema . '/questions.php';
include_once $scheema . '/child_question.php';
include_once $scheema . '/rating_table.php';
include_once $scheema . '/bonus.php';
include_once $scheema . '/deduction.php';
include_once $scheema . '/bonus_employ.php';
include_once $scheema . '/deduction_employ.php';
include_once $scheema . '/bonusmain.php';
include_once $scheema . '/bonuschild.php';
include_once $scheema . '/payroll.php';
include_once $scheema . '/reasons.php';
include_once $scheema . '/ledgers.php';
include_once $scheema . '/vouchers.php';
include_once $scheema . '/leave_records.php';
include_once $scheema . '/voucher_entries.php';

// Router logic
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$base = '/api/';
$path = str_starts_with($uri, $base) ? substr($uri, strlen($base)) : '';
$path = trim($path, '/');

if ($path === '' || $path === false) {
    $path = 'index.php';
}

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