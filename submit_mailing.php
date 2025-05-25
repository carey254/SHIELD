<?php 
// Include the email sending function
require_once __DIR__ . "/send_email.php";

// Database connection
$conn = new mysqli("localhost", "root", "", "contact_db");

// Check connection
if ($conn->connect_error) {
    // If connection fails, output error and exit
    echo json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $conn->connect_error]);
    exit();
}

// Sanitize and validate the email input
$email = filter_var($_POST['mailingEmail'], FILTER_SANITIZE_EMAIL);

// Response array to hold output
$response = [];

if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
    // Prepare and execute the insert query
    $stmt = $conn->prepare("INSERT INTO mailing_list (email) VALUES (?)");

    if ($stmt) {
        $stmt->bind_param("s", $email);
        if ($stmt->execute()) {
            // Send confirmation email
            sendEmail(
                $email,
                "Welcome to Our Mailing List",
                "Thank you for subscribing! We’ll notify you about events and updates."
            );
            // Success: Send success response
            $response['status'] = 'success';
            $response['message'] = '✅ Subscribed successfully!';
        } else {
            // Failure: Send error message
            $response['status'] = 'error';
            $response['message'] = '❌ Failed to insert email: ' . $stmt->error;
        }
        $stmt->close();
    } else {
        // Statement preparation failed
        $response['status'] = 'error';
        $response['message'] = '❌ Statement preparation failed: ' . $conn->error;
    }
} else {
    // Invalid email address
    $response['status'] = 'error';
    $response['message'] = '⚠️ Invalid email address.';
}

// Close the database connection
$conn->close();

// Return the response as JSON
echo json_encode($response);
?>
