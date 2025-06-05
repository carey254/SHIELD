<?php
// Database connection settings
$host = 'localhost';
$db   = 'your_database_name';
$user = 'your_db_user';
$pass = 'your_db_password';

// Get POST data safely
$name = trim($_POST['reporterName'] ?? '');
$email = trim($_POST['reporterEmail'] ?? '');
$description = trim($_POST['incidentDescription'] ?? '');
$contactPermission = isset($_POST['contactPermission']) ? 1 : 0;

// Basic validation
if (!$name || !$description) {
    echo json_encode(['status' => 'error', 'message' => 'Name and description are required.']);
    exit;
}

// Connect to database
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed.']);
    exit;
}

// Prepare and execute insert
$stmt = $conn->prepare("INSERT INTO reports (name, email, description, contact_permission) VALUES (?, ?, ?, ?)");
$stmt->bind_param("sssi", $name, $email, $description, $contactPermission);

if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'Your report has been submitted. Our team will reach out within 12 hours if you gave permission.']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to save your report. Please try again.']);
}

$stmt->close();
$conn->close();
?>
