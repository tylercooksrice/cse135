<?php
header("Cache-Control: no-cache");
header("Content-Type: text/html");

echo "<html><head><title>GET query string</title></head>
      <body><h1 align=center>GET query string</h1>
      <hr/>";

echo "Raw query string: " . htmlspecialchars($_SERVER['QUERY_STRING']) . "<br/><br/>";

echo "<table border=1 cellpadding=5> Formatted Query String:";

foreach ($_GET as $key => $value) {
    echo "<tr><td>" . htmlspecialchars($key) . ":</td><td>" . htmlspecialchars($value) . "</td></tr>";
}

echo "</table>";

echo "</body></html>";
?>
