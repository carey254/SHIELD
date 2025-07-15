<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid request method: ' . $_SERVER['REQUEST_METHOD']
    ]);
    exit;
}

if (!isset($_POST['mailingEmail']) || empty($_POST['mailingEmail'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Email is required.'
    ]);
    exit;
}

$mysqli = new mysqli("localhost", "root", "", "shieldmaidens_db", 3308);

if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

$email = $_POST['mailingEmail'];

// Insert into database
$stmt = $mysqli->prepare("INSERT IGNORE INTO mailing_list (email) VALUES (?)");
$stmt->bind_param("s", $email);
$stmt->execute();

// Comment out mail() lines for now (XAMPP mail doesn't work by default)
// $admin_email = "shi3ldmaidens@gmail.com";
// $subject = "New Mailing List Subscription";
// $body = "A new user has subscribed to your mailing list:\n\nEmail: $email";
// mail($admin_email, $subject, $body);

// $user_subject = "Thank you for subscribing to Shieldmaidens News!";
// $user_body = "Thank you for subscribing to our news! Let's get updated! 📰\n\nWith love, 💖\nShieldmaidens Team";
// mail($email, $user_subject, $user_body);

$stmt->close();
$mysqli->close();

echo json_encode([
    'status' => 'success',
    'message' => 'Subscription successful!'
]);
?>