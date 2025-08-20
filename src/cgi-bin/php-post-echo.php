<?php
header("Cache-Control: no-cache");
header("Content-Type: text/html");

echo "<html><head><title>POST Message Body</title></head>
      <body><h1 align=center>POST Message Body</h1>
      <hr/>";

$raw = file_get_contents("php://input");
echo "<b>Message Body:</b><br/>";
parse_str($raw, $post_vars);
if (!empty($post_vars)) {
    echo "<ul>";
    foreach ($post_vars as $key => $value) {
        echo "<li>" . htmlspecialchars($key) . " = " . htmlspecialchars($value) . "</li>";
    }
    echo "</ul>";
} else {
    echo "<pre>" . htmlspecialchars($raw) . "</pre>";
}
echo "</body></html>";
?>