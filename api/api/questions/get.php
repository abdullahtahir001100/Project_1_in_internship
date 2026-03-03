<?php

include "../../dbconfig/db_config.php";
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
