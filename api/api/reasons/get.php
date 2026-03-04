<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include_once __DIR__ . "/../../dbconfig/db_config.php";

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id > 0) {
    $stmt = $conn->prepare("
        SELECT r.*, 
               e.first_name, e.last_name, e.email,
               d.department_name,
               p.Post_name AS post_name
        FROM reasons r
        LEFT JOIN Employs e ON r.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN Posts p ON e.post_id = p.id
        WHERE r.id = ?
    ");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $output = $result->fetch_assoc();
    echo json_encode($output);
    exit;
}

$result = $conn->query(" 
        SELECT r.*, 
               e.first_name, e.last_name, e.email,
               d.department_name,
               p.Post_name AS post_name
        FROM reasons r
        LEFT JOIN Employs e ON r.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN Posts p ON e.post_id = p.id
        ORDER BY r.id DESC
");

$rows = [];
while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
}
echo json_encode($rows);
?>