<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/PHPMailer-master/src/PHPMailer.php';
require_once __DIR__ . '/PHPMailer-master/src/Exception.php';
require_once __DIR__ . '/PHPMailer-master/src/SMTP.php';

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

    // Send acknowledgement to user
    sendEmail(
        $email,
        "We've received your message",
        "Hi {$name},\n\nThank you for reaching out! We’ll reply shortly.\n\n– ShieldMaidens Team"
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
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['email'])) {
    $email = trim($_POST['email']);
    if ($email === '') {
        echo json_encode([
            'status'  => 'error',
            'message' => 'Email is required for subscription.'
        ]);
        exit;
    }

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
            'message' => 'Mailer Error: Could not send subscription email.'
        ]);
    }
    exit;
}

// ─── Anything Else: Invalid Request ────────────────────────────────────────────
echo json_encode([
    'status'  => 'error',
    'message' => 'Invalid request or missing parameters.'
]);
