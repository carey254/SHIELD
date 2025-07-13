<?php
// Database connection
$mysqli = new mysqli("localhost", "root", "", "shieldmaidens_db", 3308); // 3308 is your port

if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

// Get form data
$name = $_POST['name'];
$email = $_POST['email'];
$message = $_POST['message'];

// Insert into database
$stmt = $mysqli->prepare("INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $name, $email, $message);
$stmt->execute();

// Send email to admin
$admin_email = "shi3ldmaidens@gmail.com";
$subject = "New Contact Message from $name";
$body = "You have received a new message from your website contact form:\n\nName: $name\nEmail: $email\nMessage:\n$message";
mail($admin_email, $subject, $body);

// Send confirmation email to user
$user_subject = "Thank you for contacting Shieldmaidens!";
$user_body = "Thank you for contacting Shieldmaidens, where we value inclusivity, empowerment, and safety. Our team will get back to you shortly.\n\nWith love, 💖\nShieldmaidens Team";
mail($email, $user_subject, $user_body);

$stmt->close();
$mysqli->close();

echo "success";
?>