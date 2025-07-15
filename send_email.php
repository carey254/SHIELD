<?php
ini_set('display_errors', 1); // Enable for debugging, set to 0 for production
error_reporting(E_ALL);
header('Content-Type: application/json');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Check PHPMailer files exist
if (
    !file_exists(__DIR__ . '/PHPMailer-master/src/PHPMailer.php') ||
    !file_exists(__DIR__ . '/PHPMailer-master/src/Exception.php') ||
    !file_exists(__DIR__ . '/PHPMailer-master/src/SMTP.php')
) {
    echo json_encode(['status' => 'error', 'message' => 'PHPMailer files not found.']);
    exit;
}

require_once __DIR__ . '/PHPMailer-master/src/PHPMailer.php';
require_once __DIR__ . '/PHPMailer-master/src/Exception.php';
require_once __DIR__ . '/PHPMailer-master/src/SMTP.php';

function sendEmail($to, $subject, $body) {
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'shi3ldmaidens@gmail.com';
        $mail->Password   = 'ihpyweddgasxvdxh';  // your app password
        $mail->SMTPSecure = 'tls';
        $mail->Port       = 587;
        $mail->SMTPDebug  = 0; // Disable debugging for production
        $mail->setFrom('shi3ldmaidens@gmail.com', 'ShieldMaidens');
        $mail->addAddress($to);
        $mail->Subject = $subject;
        $mail->Body    = $body;
        $mail->CharSet = 'UTF-8';
        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Mailer Error ({$to}): " . $mail->ErrorInfo);
        return false;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Contact Form
    if (isset($_POST['name'], $_POST['email'], $_POST['message'])) {
        $name    = trim($_POST['name']);
        $email   = trim($_POST['email']);
        $message = trim($_POST['message']);

        if ($name === '' || $email === '' || $message === '') {
            echo json_encode(['status' => 'error', 'message' => 'All contact fields are required.']);
            exit;
        }

        // Save to database (fifteen_letters)
        $mysqli = new mysqli("localhost", "root", "", "shieldmaidens_db", 3308);
        if ($mysqli->connect_error) {
            echo json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $mysqli->connect_error]);
            exit;
        }
        $stmt = $mysqli->prepare("INSERT INTO fifteen_letters (name, email, message) VALUES (?, ?, ?)");
        if (!$stmt) {
            echo json_encode(['status' => 'error', 'message' => 'Prepare failed for fifteen_letters: ' . $mysqli->error]);
            exit;
        }
        $stmt->bind_param("sss", $name, $email, $message);
        if (!$stmt->execute()) {
            echo json_encode(['status' => 'error', 'message' => 'Execute failed for fifteen_letters: ' . $stmt->error]);
            exit;
        }
        $stmt->close();
        $mysqli->close();

        // Send emails
        $user_sent = sendEmail($email, "We've received your message", "Hi {$name},\n\nThank you for reaching out! We'll reply shortly.\n\n– ShieldMaidens Team");
        $admin_sent = sendEmail("shi3ldmaidens@gmail.com", "New Contact Message from {$name}", "🛡️ New message:\n\nName: {$name}\nEmail: {$email}\nMessage:\n{$message}");

        if ($user_sent && $admin_sent) {
            echo json_encode(['status' => 'success', 'message' => 'Thank you for contacting Shieldmaidens! We value inclusivity, empowerment, and safety. Our team will get back to you shortly. 💖']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Message saved but email sending failed. Please try again later.']);
        }
        exit;
    }

    // Mailing List Form
    if (isset($_POST['mailingEmail'])) {
        $email = trim($_POST['mailingEmail']);
        if ($email === '') {
            echo json_encode(['status' => 'error', 'message' => 'Email is required for subscription.']);
            exit;
        }

        // Save to database
        $mysqli = new mysqli("localhost", "root", "", "shieldmaidens_db", 3308);
        if ($mysqli->connect_error) {
            echo json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $mysqli->connect_error]);
            exit;
        }
        $stmt = $mysqli->prepare("INSERT IGNORE INTO mailing_list (email) VALUES (?)");
        if (!$stmt) {
            echo json_encode(['status' => 'error', 'message' => 'Prepare failed: ' . $mysqli->error]);
            exit;
        }
        $stmt->bind_param("s", $email);
        if (!$stmt->execute()) {
            echo json_encode(['status' => 'error', 'message' => 'Execute failed: ' . $stmt->error]);
            exit;
        }
        $stmt->close();
        $mysqli->close();

        $user_sent = sendEmail($email, "Welcome to Our Mailing List", "Thank you for subscribing! We'll keep you updated with our latest news.");
        $admin_sent = sendEmail("shi3ldmaidens@gmail.com", "New Mailing List Subscription", "A new user has subscribed: {$email}");

        if ($user_sent && $admin_sent) {
            echo json_encode(['status' => 'success', 'message' => "Thank you for subscribing to our news, let's get updated! 📰"]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Subscription saved but email sending failed. Please try again later.']);
        }
        exit;
    }

    // Unknown POST
    echo json_encode(['status' => 'error', 'message' => 'Invalid request or missing parameters.']);
    exit;
}

// Invalid request method
echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
exit;
