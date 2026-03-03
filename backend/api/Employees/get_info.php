<?php

include "../../dbconfig/db_config.php";

$sql = "SELECT 
  d.id AS department_id,
  d.department_name,
  d.created_at AS department_created_at,
  p.id AS post_id,
  p.Post_name,
  p.created_at AS post_created_at
FROM departments d
LEFT JOIN Posts p ON d.id = p.department_id
ORDER BY d.id
";

$result = $conn->query($sql);

$departments = [];

while ($row = $result->fetch_assoc()) {
    $deptId = $row['department_id'];

  
    if (!isset($departments[$deptId])) {
        $departments[$deptId] = [
            "department_id" => $deptId,
            "department_name" => $row['department_name'],
            "created_at" => $row['department_created_at'],
            "posts" => []
        ];
    }

    // agar post exist karti hai
    if ($row['post_id']) {
        $departments[$deptId]['posts'][] = [
            "id" => $row['post_id'],
            "Post_name" => $row['Post_name'],
            "created_at" => $row['post_created_at']
        ];
    }
}

// re-index array
echo json_encode(array_values($departments));
?>
