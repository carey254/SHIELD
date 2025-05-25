<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Attempt connection
$conn = new mysqli("localhost", "root", "", "contact_db", 3308);

// Log file
$logFile = "debug_log.txt";

// Check connection
if ($conn->connect_error) {
    file_put_contents($logFile, date("[Y-m-d H:i:s] ") . "DB Connection Error: " . $conn->connect_error . "\n", FILE_APPEND);
    die("Connection failed: " . $conn->connect_error);
} else {
    file_put_contents($logFile, date("[Y-m-d H:i:s] ") . "DB Connection Success\n", FILE_APPEND);
    echo "Database connection successful!<br>";
}

// Try a test query (you need a table first)
$table = "donations"; // make sure the table 'donations' exists
$result = $conn->query("SELECT * FROM $table");

if ($result) {
    file_put_contents($logFile, date("[Y-m-d H:i:s] ") . "Query Success on table '$table'\n", FILE_APPEND);
    echo "Query success! Rows found: " . $result->num_rows;
} else {
    file_put_contents($logFile, date("[Y-m-d H:i:s] ") . "Query Failed on table '$table': " . $conn->error . "\n", FILE_APPEND);
    echo "Query failed: " . $conn->error;
}

$conn->close();
?>
