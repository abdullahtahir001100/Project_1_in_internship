<?php

include "../../dbconfig/db_config.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Only POST allowed"]);
    exit;
}

try {

    $input = json_decode(file_get_contents("php://input"), true);

    $employee_id = $input['employee_id'] ?? 0;
    $ratings = $input['ratings'] ?? [];

    if (!$employee_id || empty($ratings)) {
        throw new Exception("Missing employee_id or ratings");
    }

    // 🔁 Remove old ratings (update case)
    $delete = $conn->prepare("DELETE FROM Employee_Ratings WHERE employee_id = ?");
    $delete->bind_param("i", $employee_id);
    $delete->execute();
    $delete->close();

    // Prepare insert
    $stmt = $conn->prepare("
        INSERT INTO Employee_Ratings 
        (employee_id, question_id, sub_question_id, rating) 
        VALUES (?, ?, ?, ?)
    ");

    foreach ($ratings as $key => $value) {

        $rating = (int)$value;

        $question_id = NULL;
        $sub_question_id = NULL;

        // 🔹 If key starts with q_ → main question
        if (strpos($key, 'q_') === 0) {
            $question_id = (int) str_replace('q_', '', $key);
        } else {
            // 🔹 Otherwise → child question
            $sub_question_id = (int)$key;
        }

        $stmt->bind_param(
            "iiii",
            $employee_id,
            $question_id,
            $sub_question_id,
            $rating
        );

        if (!$stmt->execute()) {
            throw new Exception($stmt->error);
        }
    }

    $stmt->close();

    echo json_encode([
        "success" => true,
        "message" => "Ratings saved successfully"
    ]);

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}

$conn->close();
?>
