<?php
require_once __DIR__ ."/db.php"; // Secure PDO connection
require_once __DIR__ ."/donate.php";
var_dump($_POST); // Check if the form is sending the data

// Safaricom credentials (use .env file in production!)
// You should not hardcode these values in production. Use environment variables.
$consumerKey = 'YOUR_CONSUMER_KEY';
$consumerSecret = 'YOUR_CONSUMER_SECRET';
$BusinessShortCode = 'YOUR_SHORTCODE';
$Passkey = 'YOUR_PASSKEY';

// 1. Get user input
$phone = $_POST['phone'] ?? '';
$amount = $_POST['amount'] ?? '';
$first_name = $_POST['first_name'] ?? '';
$last_name = $_POST['last_name'] ?? '';
$email = $_POST['email'] ?? '';
$message = $_POST['message'] ?? '';

// Sanitize phone number: Remove leading '+' if exists
$phone = ltrim($phone, '+');

// 2. Validate input
if (empty($phone)) {
    echo json_encode(['success' => false, 'message' => 'Phone number is required']);
    exit;
}
if (empty($amount)) {
    echo json_encode(['success' => false, 'message' => 'Donation amount is required']);
    exit;
}
if (!preg_match('/^2547\d{8}$/', $phone)) {
    echo json_encode(['success' => false, 'message' => 'Invalid phone number format']);
    exit;
}
if (!is_numeric($amount) || $amount <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid donation amount']);
    exit;
}

// 3. Generate Access Token from Safaricom API
$credentials = base64_encode($consumerKey . ':' . $consumerSecret);
$token_url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, $token_url);
curl_setopt($curl, CURLOPT_HTTPHEADER, [
    'Authorization: Basic ' . $credentials
]);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false); // DEV only, remove in production
$token_response = curl_exec($curl);

if ($token_response === false) {
    echo json_encode(['success' => false, 'message' => 'Network error during token generation']);
    exit;
}
curl_close($curl);

$token_result = json_decode($token_response);
if (!isset($token_result->access_token)) {
    echo json_encode(['success' => false, 'message' => 'Failed to generate access token']);
    exit;
}

$access_token = $token_result->access_token;

// 4. Initiate STK Push
$timestamp = date('YmdHis');
$password = base64_encode($BusinessShortCode . $Passkey . $timestamp);
$stkPushUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
$callbackURL = 'https://yourdomain.com/callback.php'; // Replace with your actual callback URL in production

$stkPushData = [
    'BusinessShortCode' => $BusinessShortCode,
    'Password' => $password,
    'Timestamp' => $timestamp,
    'TransactionType' => 'CustomerPayBillOnline',
    'Amount' => $amount,
    'PartyA' => $phone,
    'PartyB' => $BusinessShortCode,
    'PhoneNumber' => $phone,
    'CallBackURL' => $callbackURL,
    'AccountReference' => 'Donation',
    'TransactionDesc' => 'Donation Payment'
];

$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, $stkPushUrl);
curl_setopt($curl, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $access_token
]);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($stkPushData));
curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false); // DEV only, remove in production

$stk_response = curl_exec($curl);
if ($stk_response === false) {
    $error_message = curl_error($curl);
    echo json_encode(['success' => false, 'message' => 'Network error: ' . $error_message]);
    exit;
}
curl_close($curl);

$stk_result = json_decode($stk_response, true);

// 5. Save transaction to database
if (isset($stk_result['CheckoutRequestID'])) {
    $checkoutRequestID = $stk_result['CheckoutRequestID'];

    try {
        // Save the donation details to the database (including user details)
        $stmt = $pdo->prepare("INSERT INTO donations (phone, amount, first_name, last_name, email, message, checkout_request_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$phone, $amount, $first_name, $last_name, $email, $message, $checkoutRequestID, 'PENDING']);

        echo json_encode([
            'success' => true,
            'message' => 'STK Push initiated. Awaiting customer confirmation.',
            'CheckoutRequestID' => $checkoutRequestID
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
} else {
    // Handle failure to initiate STK Push
    $errorMessage = $stk_result['errorMessage'] ?? 'Failed to initiate STK Push';
    echo json_encode([
        'success' => false,
        'message' => $errorMessage
    ]);
}
?>
