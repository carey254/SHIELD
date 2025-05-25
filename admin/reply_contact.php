<?php
include '../send_email.php';

$conn = new mysqli("localhost", "root", "", "contact_db");

$id = $_POST['id'];
$reply = $_POST['reply'];

$row = $conn->query("SELECT name, email FROM contacts WHERE id=$id")->fetch_assoc();
$email = $row['email'];
$name = $row['name'];

// Send email
sendEmail($email, "Reply to your message", "Hi $name,\n\n$reply");

// Update DB
$conn->query("UPDATE contacts SET reply='$reply', replied_at=NOW() WHERE id=$id");

echo "Reply sent!";
?>
<a href="/admin/dashboard.php">← Back to dashboard</a>
