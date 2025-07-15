<?php
include __DIR__ . '/send_email.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Sanitize input data
    $name = trim($_POST['name'] ?? 'User');
    $email = trim($_POST['email'] ?? '');
    $message = trim($_POST['message'] ?? '');

    // Log the incoming data for debugging purposes
    file_put_contents("debug_log.txt", "Received data: Name: $name, Email: $email, Message: $message" . PHP_EOL, FILE_APPEND);

    if (empty($email) || empty($message)) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid request or missing email/message.']);
        exit;
    }

    // Send confirmation to user
    $user_sent = sendEmail($email, "We've received your message", 
        "Hi $name,\n\nThanks for reaching out to us. We'll get back to you shortly!\n\nStay safe online 💙\n- ShieldMaidens Team");

    // Send copy to your team
    $team_sent = sendEmail("shi3ldmaidens@gmail.com", "New Contact Message from $name", 
        "🛡️ New message received:\n\nName: $name\nEmail: $email\nMessage:\n$message");

    // Log email sending status for debugging
    if ($user_sent) {
        file_put_contents("debug_log.txt", "Confirmation email sent to: $email" . PHP_EOL, FILE_APPEND);
    } else {
        file_put_contents("debug_log.txt", "Failed to send confirmation email to: $email" . PHP_EOL, FILE_APPEND);
    }

    if ($team_sent) {
        file_put_contents("debug_log.txt", "Team email sent to: shi3ldmaidens@gmail.com" . PHP_EOL, FILE_APPEND);
    } else {
        file_put_contents("debug_log.txt", "Failed to send team email to: shi3ldmaidens@gmail.com" . PHP_EOL, FILE_APPEND);
    }

    // Send the response back
    if ($user_sent && $team_sent) {
        echo json_encode(['status' => 'success', 'message' => 'Emails sent']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to send emails']);
    }

} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
?>
