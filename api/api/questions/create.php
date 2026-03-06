<?php

header("Content-Type: application/json");

    
$id = $_GET['id11'] ?? 0;
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

$servername = "gateway01.eu-central-1.prod.aws.tidbcloud.com";
$port = 4000;
$username = "3AEZrv2kzEmLLGp.root";
$password = "IZS8gZtNqECsqPry";
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
