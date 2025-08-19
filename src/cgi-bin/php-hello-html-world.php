<!DOCTYPE html>
<html>

<body>
    <?php
    print "<h1>Hello, PHP!</h1>";
    print "<p>This page was generated with php!</p>";
    
    $datestring = date("D M d H:i:s Y");
    print "<p>Current Time: $datestring\n</p>";
    $ipaddress = getenv("REMOTE_ADDR");
    print "<p>your IP address is: $ipaddress\n</p>";
    ?>
</body>

</html>