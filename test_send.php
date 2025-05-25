<?php
$conn = new mysqli("localhost", "root", "", "contact_db", 3308);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "✅ Connected to MySQL!";
$conn->close();
?>
