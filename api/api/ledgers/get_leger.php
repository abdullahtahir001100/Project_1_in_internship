<?php

include "../../dbconfig/db_config.php";

$sql = "SELECT * FROM ledgers WHERE status = 'vendor' OR status = 'customer' ORDER BY id DESC";
$result = $conn->query($sql);

$ledgers = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $ledgers[] = $row;
    }
}

echo json_encode($ledgers);

$conn->close();
?>
