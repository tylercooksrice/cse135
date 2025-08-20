<?php
ini_set("session.use_cookies", 0);
ini_set("session.use_only_cookies", 0);
ini_set("session.use_trans_sid", 1);

session_start();

if (isset($_POST['username'])) {
    $_SESSION['username'] = $_POST['username'];
}

$name = $_SESSION['username'] ?? null;
?>
<!DOCTYPE html>
<html>
<head>
  <title>PHP Sessions (URL)</title>
</head>
<body>
  <h1>PHP Sessions (URL)</h1>

  <?php if ($name): ?>
    <p><b>Name:</b> <?= htmlspecialchars($name) ?></p>
  <?php else: ?>
    <p><b>Name:</b> You do not have a name set</p>
  <?php endif; ?>

  <form style="margin-top:30px" action="php-destroy-session.php?<?= htmlspecialchars(SID) ?>" method="post">
    <button type="submit">Destroy Session</button>
  </form>

  <a href="php-cgiform.html?<?= htmlspecialchars(SID) ?>">Back to Form</a>
</body>
</html>
