<?php
$myObj = new stdClass();
$myObj->message = "Hello World from PHP!";
$myObj->date = date(" D M d H:i:s Y");
$myObj->ipAddress = getenv("REMOTE_ADDR");

$myJSON = json_encode($myObj);
echo $myJSON;
?>