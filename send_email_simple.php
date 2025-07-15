<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

// Simple email function using PHP's mail() function
function sendSimpleEmail($to, $subject, $body) {
    $headers = "From: shi3ldmaidens@gmail.com\r\n";
    $headers .= "Reply-To: shi3ldmaidens@gmail.com\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    $result = mail($to, $subject, $body, $headers);
    file_put_contents("debug_log.txt", "Simple email to {$to}: " . ($result ? "SUCCESS" : "FAILED") . PHP_EOL, FILE_APPEND);
    return $result;
}

// Handle POST Requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Contact Form
    if (isset($_POST['name'], $_POST['email'], $_POST['message'])) {
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

        // Save to database
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

        // Send emails
        $user_sent = sendSimpleEmail(
            $email,
            "We've received your message",
            "Hi {$name},\n\nThank you for reaching out! We'll reply shortly.\n\n– ShieldMaidens Team"
        );

        $admin_sent = sendSimpleEmail(
            "shi3ldmaidens@gmail.com",
            "New Contact Message from {$name}",
            "🛡️ New message:\n\nName: {$name}\nEmail: {$email}\nMessage:\n{$message}"
        );

        if ($user_sent && $admin_sent) {
            echo json_encode([
                'status'  => 'success',
                'message' => 'Thank you for contacting Shieldmaidens! We value inclusivity, empowerment, and safety. Our team will get back to you shortly. 💖'
            ]);
        } else {
            echo json_encode([
                'status'  => 'error',
                'message' => 'Message saved but email sending failed. Please try again later.'
            ]);
        }
        exit;
    }

    // Mailing List Form
    if (isset($_POST['mailingEmail'])) {
        $email = trim($_POST['mailingEmail']);
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

        $user_sent = sendSimpleEmail($email, "Welcome to Our Mailing List", "Thank you for subscribing! We'll keep you updated with our latest news.");
        $admin_sent = sendSimpleEmail("shi3ldmaidens@gmail.com", "New Mailing List Subscription", "A new user has subscribed: {$email}");

        if ($user_sent && $admin_sent) {
            echo json_encode([
                'status'  => 'success',
                'message' => "Thank you for subscribing to our news, let's get updated! 📰"
            ]);
        } else {
            echo json_encode([
                'status'  => 'error',
                'message' => 'Subscription saved but email sending failed. Please try again later.'
            ]);
        }
        exit;
    }

    // Unknown POST
    echo json_encode([
        'status'  => 'error',
        'message' => 'Invalid request or missing parameters.'
    ]);
    exit;
}

// Invalid request method
echo json_encode([
    'status'  => 'error',
    'message' => 'Invalid request method.'
]);
exit;
?> 