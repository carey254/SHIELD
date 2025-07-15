<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
require 'PHPMailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Get POST data
$name = trim($_POST['reporterName'] ?? '');
$email = trim($_POST['reporterEmail'] ?? '');
$description = trim($_POST['incidentDescription'] ?? '');
$contactPermission = isset($_POST['contactPermission']) ? 'Yes' : 'No';

// Basic validation
if (!$name || !$description) {
    echo json_encode(['status' => 'error', 'message' => 'Name and description are required.']);
    exit;
}

// Compose the email body
$body = "New Incident Report:\n\n";
$body .= "Name: $name\n";
$body .= "Email: $email\n";
$body .= "Contact Permission: $contactPermission\n";
$body .= "Description:\n$description\n";

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'shi3ldmaidens@gmail.com';
    $mail->Password   = 'gntxvcdacaszpuom';  // your app password
    $mail->SMTPSecure = 'tls';
    $mail->Port       = 587;

    $mail->setFrom('shi3ldmaidens@gmail.com', 'Shield Maidens Report');
    $mail->addAddress('shi3ldmaidens@gmail.com'); // Send to yourself

    $mail->isHTML(false);
    $mail->Subject = 'New Incident Report from Website';
    $mail->Body    = $body;

    $mail->send();
    echo json_encode(['status' => 'success', 'message' => 'Your report has been sent. Our team will reach out within 12 hours if you gave permission.']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Mailer Error: ' . $mail->ErrorInfo]);
}
?>