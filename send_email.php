<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/PHPMailer-master/src/PHPMailer.php';
require_once __DIR__ . '/PHPMailer-master/src/Exception.php';
require_once __DIR__ . '/PHPMailer-master/src/SMTP.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

function sendEmail($to, $subject, $body) {
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'shi3ldmaidens@gmail.com';
        $mail->Password   = 'gntxvcdacaszpuom';  // your app password
        $mail->SMTPSecure = 'tls';
        $mail->Port       = 587;

        $mail->setFrom('shi3ldmaidens@gmail.com', 'ShieldMaidens');
        $mail->addAddress($to);

        $mail->Subject = $subject;
        $mail->Body    = $body;

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Mailer Error ({$to}): " . $mail->ErrorInfo);
        return false;
    }
}

// ─── Handle CONTACT FORM Submissions ──────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST'
    && isset($_POST['name'], $_POST['email'], $_POST['message'])
) {
    $name    = trim($_POST['name']);
    $email   = trim($_POST['email']);
    $message = trim($_POST['message']);

    if ($name === '' || $email === '' || $message === '') {
        echo json_encode([
            'status'  => 'error',
            'message' => 'All contact fields are required.'
        ]);
        exit;
    }

    // After validating $name, $email, $message
    $mysqli = new mysqli("localhost", "root", "", "shieldmaidens_db", 3308);
    if ($mysqli->connect_error) {
        echo json_encode([
            'status'  => 'error',
            'message' => 'Database connection failed: ' . $mysqli->connect_error
        ]);
        exit;
    }
    $stmt = $mysqli->prepare("INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $name, $email, $message);
    $stmt->execute();
    $stmt->close();
    $mysqli->close();

    // Send acknowledgement to user
    sendEmail(
        $email,
        "We've received your message",
        "Hi {$name},\n\nThank you for reaching out! We'll reply shortly.\n\n– ShieldMaidens Team"
    );

    // Send copy to admin
    sendEmail(
        "shi3ldmaidens@gmail.com",
        "New Contact Message from {$name}",
        "🛡️ New message:\n\nName: {$name}\nEmail: {$email}\nMessage:\n{$message}"
    );

    echo json_encode([
        'status'  => 'success',
        'message' => 'Contact message sent successfully.'
    ]);
    exit;
}

// ─── Handle MAILING-LIST Sign-ups ──────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && (isset($_POST['email']) || isset($_POST['mailingEmail']))) {
    $email = isset($_POST['email']) ? trim($_POST['email']) : trim($_POST['mailingEmail']);
    if ($email === '') {
        echo json_encode([
            'status'  => 'error',
            'message' => 'Email is required for subscription.'
        ]);
        exit;
    }

    // Save to database
    $mysqli = new mysqli("localhost", "root", "", "shieldmaidens_db", 3308);
    if ($mysqli->connect_error) {
        echo json_encode([
            'status'  => 'error',
            'message' => 'Database connection failed: ' . $mysqli->connect_error
        ]);
        exit;
    }
    $stmt = $mysqli->prepare("INSERT IGNORE INTO mailing_list (email) VALUES (?)");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->close();
    $mysqli->close();

    $subject = "Welcome to Our Mailing List";
    $body    = "Thank you for subscribing! We'll keep you updated with our latest news.";

    if (sendEmail($email, $subject, $body)) {
        echo json_encode([
            'status'  => 'success',
            'message' => "Thank you for subscribing! We'll keep you updated."
        ]);
    } else {
        echo json_encode([
            'status'  => 'error',
            'message' => 'Mailer Error: ' . $mail->ErrorInfo
        ]);
    }
    exit;
}

// ─── Anything Else: Invalid Request ────────────────────────────────────────────
echo json_encode([
    'status'  => 'error',
    'message' => 'Invalid request or missing parameters.'
]);
