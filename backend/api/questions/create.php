<?php


include "../../dbconfig/db_config.php";





try {

    // Decode JSON body
    $input = json_decode(file_get_contents("php://input"), true);

 

    $departmentId = (int)($input['department_id'] ?? 0);
    $postId       = (int)($input['post_id'] ?? 0);
    $questions    = $input['questions'] ?? [];
    $is_update    = $input['is_update'];

    if (empty($questions)) {
        throw new Exception("No questions provided");
    }


    if ((int)$is_update === 1) {
     
        $stmtDeleteMain = $conn->prepare("DELETE FROM Main_Question WHERE parent_id = ?");
        $stmtDeleteMain->bind_param("i", $postId);
        if (!$stmtDeleteMain->execute()) {
            throw new Exception($stmtDeleteMain->error);
        }
        $stmtDeleteMain->close();
    }
  
    foreach ($questions as $question) {

        $questionText = $question['text'] ?? '';
        $rating       = (int)($question['rating'] ?? 0);

     

        /* =============================
           INSERT MAIN QUESTION
        ============================== */

        // Insert with parent_id as post_id
        $stmtMain = $conn->prepare("
            INSERT INTO Main_Question 
            (question_name, Rating, parent_id) 
            VALUES (?, ?, ?)
        ");

     
        $stmtMain->bind_param("sii", $questionText, $rating, $postId);

        if (!$stmtMain->execute()) {
            throw new Exception($stmtMain->error);
        }

        $mainQuestionId = $stmtMain->insert_id;
        $stmtMain->close();

        /* =============================
           INSERT SUB QUESTIONS
        ============================== */

        $subQuestions = $question['subQuestions'] ?? [];

        foreach ($subQuestions as $sub) {

            $subText   = $sub['text'] ?? '';
            $subRating = (int)($sub['rating'] ?? 0);

         

            $stmtSub = $conn->prepare("
                INSERT INTO Child_Question 
                (Child_question_name, parent_id_question, rating) 
                VALUES (?, ?, ?)
            ");

          

            $stmtSub->bind_param("sii", $subText, $mainQuestionId, $subRating);

            if (!$stmtSub->execute()) {
                throw new Exception($stmtSub->error);
            }

            $stmtSub->close();
        }
    }
    

   

    echo json_encode([
        "success" => true,
        "message" => "All questions inserted successfully"
    ]);

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}

$conn->close();
?>
