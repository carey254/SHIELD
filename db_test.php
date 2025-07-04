<?php
$mysqli = new mysqli("localhost", "root", "", "shieldmaidens_db", 3308);
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}
$result = $mysqli->query("SHOW TABLES");
if (!$result) {
    die("Query failed: " . $mysqli->error);
}
echo "Tables in shieldmaidens_db:<br>";
while ($row = $result->fetch_array()) {
    echo $row[0] . "<br>";
}
$mysqli->close();
?>