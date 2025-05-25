<?php
header('Content-Type: application/json');
require_once __DIR__ . '/send_email.php';

// 1) Connect to database
$conn = new mysqli("localhost", "root", "", "contact_db", 3308);
if ($conn->connect_error) {
    file_put_contents("debug_log.txt", "DB Conn Error: " . $conn->connect_error . "\n", FILE_APPEND);
    echo json_encode(['status'=>'error','message'=>'Database connection failed']);
    exit;
}

// 2) Sanitize + validate inputs
$name    = trim($_POST['name']    ?? '');
$email   = trim($_POST['email']   ?? '');
$message = trim($_POST['message'] ?? '');

file_put_contents("debug_log.txt", "SUBMIT: name={$name}, email={$email}, message={$message}\n", FILE_APPEND);

if (!$name || !$email || !$message) {
    echo json_encode(['status'=>'error','message'=>'All fields are required']);
    exit;
}

// 3) Save to DB
$stmt = $conn->prepare("INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)");
if (! $stmt) {
    file_put_contents("debug_log.txt", "Prepare Error: " . $conn->error . "\n", FILE_APPEND);
    echo json_encode(['status'=>'error','message'=>'Database error (prepare)']);
    exit;
}
$stmt->bind_param("sss", $name, $email, $message);

if (! $stmt->execute()) {
    file_put_contents("debug_log.txt", "Execute Error: " . $stmt->error . "\n", FILE_APPEND);
    echo json_encode(['status'=>'error','message'=>'Database error (execute)']);
    $stmt->close();
    $conn->close();
    exit;
}

$insert_id = $stmt->insert_id;
file_put_contents("debug_log.txt", "DB Insert OK: ID {$insert_id}\n", FILE_APPEND);

$stmt->close();

// 4) Send emails
$user_ok = sendEmail(
    $email,
    "We've received your message",
    "Hi {$name},\n\nThanks for reaching out! We’ll get back to you shortly.\n\n– ShieldMaidens Team"
);
file_put_contents("debug_log.txt", "User email to {$email}: " . ($user_ok ? "OK":"FAIL") . "\n", FILE_APPEND);

$team_ok = sendEmail(
    "shi3ldmaidens@gmail.com",
    "New Contact Message from {$name}",
    "🛡️ New message:\nName: {$name}\nEmail: {$email}\nMessage:\n{$message}"
);
file_put_contents("debug_log.txt", "Team email to shi3ldmaidens@gmail.com: " . ($team_ok ? "OK":"FAIL") . "\n", FILE_APPEND);

// 5) Return final response
if ($user_ok && $team_ok) {
    echo json_encode(['status'=>'success','message'=>'Message saved and emails sent!', 'db_id' => $insert_id]);
} else {
    echo json_encode([
        'status'=>'error',
        'message'=>'Message saved but email failed.',
        'db_id' => $insert_id
    ]);
}

$conn->close();
