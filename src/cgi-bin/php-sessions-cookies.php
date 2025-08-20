<?php
session_start();

if (isset($_POST['username'])) {
    $_SESSION['username'] = $_POST['username'];
}

$name = $_SESSION['username'] ?? null;
?>
<!DOCTYPE html>
<html>
<head>
  <title>PHP Sessions</title>
</head>
<body>
  <h1>PHP Sessions Page 1</h1>

  <?php if ($name): ?>
    <p><b>Name:</b> <?= htmlspecialchars($name) ?></p>
  <?php else: ?>
    <p><b>Name:</b> You do not have a name set</p>
  <?php endif; ?>

  <form style="margin-top:30px" action="php-destroy-session.php" method="post">
    <button type="submit">Destroy Session</button>
  </form>

  <a href="php-cgiform.html">Back to Form</a>
</body>
</html>
