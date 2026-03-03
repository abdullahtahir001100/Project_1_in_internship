<?php 

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
include "dbconfig/db_config.php";
include "scheema/departments.php";
include "scheema/Posts.php";
include "scheema/Employs.php";
include "scheema/questions.php";
include "scheema/child_question.php";
include "scheema/rating_table.php";
include "scheema/bonus.php";
include "scheema/deduction.php";
include "scheema/bonus_employ.php";
include "scheema/deduction_employ.php";
include "scheema/bonusmain.php";
include "scheema/bonuschild.php";
include "scheema/payroll.php";
include "scheema/reasons.php";
include "scheema/ledgers.php";
include "scheema/vouchers.php";
include "scheema/leave_records.php";
include "scheema/voucher_entries.php";

?>