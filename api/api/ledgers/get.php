<?php

include "../../dbconfig/db_config";

$sql = "SELECT * FROM ledgers WHERE status = 'employ_simple' ORDER BY id DESC";
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
