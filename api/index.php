<?php 



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
<?php

echo "Welcome to the API. Please use the appropriate endpoints to access the data.";
?>