<?php
// db.php

error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = 'localhost';
$dbname = 'contact_db'; // Make sure this database exists
$username = 'root';
$password = '';
$port = 3308; // XAMPP sometimes uses 3308 for MySQL

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Connected successfully
    echo "Database connected successfully!";
} catch (PDOException $e) {
    die("Database Connection Failed: " . $e->getMessage());
}
?>
