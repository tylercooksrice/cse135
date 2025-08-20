<?php
session_start();
session_unset();
session_destroy();
?>
<!DOCTYPE html>
<html>
<head>
  <title>PHP Session Destroyed</title>
</head>
<body>
  <h1>Session Destroyed</h1>
  <a href="/src/php-cgiform.html?<?= htmlspecialchars(SID) ?>">Back to Form</a><br>
  <a href="/src/cgi-bin/php-sessions-cookies.php">Back to Cookie Session Page</a><br>
  <a href="/src/cgi-bin/php-sessions-url.php?<?= htmlspecialchars(SID) ?>">Back to URL Session Page</a>
</body>
</html>
