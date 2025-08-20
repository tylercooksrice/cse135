<?php
header("Cache-Control: no-cache");
header("Content-Type: text/html");

echo "<!DOCTYPE html>
<html><head><title>General Request Echo</title></head>
<body><h1 align=\"center\">General Request Echo</h1>
<hr>";

$protocol = $_SERVER["SERVER_PROTOCOL"] ?? "";
$method   = $_SERVER["REQUEST_METHOD"] ?? "";
$query    = $_SERVER["QUERY_STRING"] ?? "";

$body = file_get_contents("php://input");

echo "<p><b>HTTP Protocol:</b> " . htmlspecialchars($protocol) . "</p>";
echo "<p><b>HTTP Method:</b> " . htmlspecialchars($method) . "</p>";
echo "<p><b>Query String:</b> " . htmlspecialchars($query) . "</p>";
echo "<p><b>Message Body:</b> " . htmlspecialchars($body) . "</p>";

echo "</body></html>";
?>
