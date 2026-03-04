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
$department_id = isset($_GET['department_id']) ? (int)$_GET['department_id'] : 0;
$departments = [];
$department_id ? ($sql = "SELECT d.id as department_id, d.department_name, p.id as post_id, p.Post_name, q.id as question_id, q.question_name, q.Rating as question_rating, c.id as child_id, c.Child_question_name, c.rating as child_rating
        FROM departments d
        LEFT JOIN Posts p ON p.department_id = d.id
        LEFT JOIN Main_Question q ON q.parent_id = p.id
        LEFT JOIN Child_Question c ON c.parent_id_question = q.id
        WHERE d.id = $department_id
        ORDER BY d.id, p.id, q.id, c.id")
        :
($sql = "SELECT d.id as department_id, d.department_name, p.id as post_id, p.Post_name, q.id as question_id, q.question_name, q.Rating as question_rating, c.id as child_id, c.Child_question_name, c.rating as child_rating
        FROM departments d
        LEFT JOIN Posts p ON p.department_id = d.id
        LEFT JOIN Main_Question q ON q.parent_id = p.id
        LEFT JOIN Child_Question c ON c.parent_id_question = q.id
        ORDER BY d.id, p.id, q.id, c.id");

$result = $conn->query($sql);

while ($row = $result->fetch_assoc()) {
    $deptId = $row['department_id'];
    $postId = $row['post_id'];
    $questionId = $row['question_id'];
    $childId = $row['child_id'];

    if (!isset($departments[$deptId])) {
        $departments[$deptId] = [
            'department_id' => $deptId,
            'department_name' => $row['department_name'],
            'posts' => []
        ];
    }
    if ($postId && !isset($departments[$deptId]['posts'][$postId])) {
        $departments[$deptId]['posts'][$postId] = [
            'post_id' => $postId,
            'post_name' => $row['Post_name'],

            'questions' => []
        ];
    }
    if ($postId && $questionId && !isset($departments[$deptId]['posts'][$postId]['questions'][$questionId])) {
        $departments[$deptId]['posts'][$postId]['questions'][$questionId] = [
            'question_id' => $questionId,
            'question_name' => $row['question_name'],
            'question_rating' => $row['question_rating'],
            'child_questions' => []
        ];
    }
    if ($postId && $questionId && $childId) {
        $departments[$deptId]['posts'][$postId]['questions'][$questionId]['child_questions'][$childId] = [
            'child_id' => $childId,
            'child_question_name' => $row['Child_question_name'],
            'child_rating' => $row['child_rating']
        ];
    }
}


$output = [];
foreach ($departments as $dept) {
    $posts = [];
    foreach ($dept['posts'] as $post) {
        $questions = [];
        foreach ($post['questions'] as $question) {
            $question['child_questions'] = array_values($question['child_questions']);
            $questions[] = $question;
        }
        $post['questions'] = $questions;
        $posts[] = $post;
    }
    $dept['posts'] = $posts;
    $output[] = $dept;
}

echo json_encode($output);

?>
