<?php
// database connection
require_once __DIR__ ."/db.php";
require_once __DIR__ ."/donate.php";

// M-Pesa credentials
$consumerKey = 'YOUR_CONSUMER_KEY';
$consumerSecret = 'YOUR_CONSUMER_SECRET';
$BusinessShortCode = 'YOUR_SHORTCODE';
$Passkey = 'YOUR_PASSKEY';

// 1. Capture form data
$firstName = $_POST['first_name'] ?? '';
$lastName = $_POST['last_name'] ?? '';
$email = $_POST['email'] ?? '';
$phone = $_POST['phone'] ?? '';
$amount = $_POST['amount'] ?? '';
$frequency = $_POST['frequency'] ?? 'one-time';
$message = $_POST['message'] ?? '';

// Validate form fields
if (empty($firstName) || empty($lastName) || empty($email) || empty($phone) || empty($amount)) {
    die('Please fill in all required fields.');
}
if (!preg_match('/^2547\d{8}$/', $phone)) {
    die('Phone number must start with 2547...');
}
if (!is_numeric($amount) || $amount <= 0) {
    die('Invalid donation amount.');
}

// 2. Save to donations table (FULL FORM DATA)
$stmt = $pdo->prepare("INSERT INTO donations (frequency, amount, first_name, last_name, email, phone, message, donated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
$stmt->execute([$frequency, $amount, $firstName, $lastName, $email, $phone, $message]);

// 3. Initiate M-Pesa payment
// 3.1 Get Access Token
$credentials = base64_encode($consumerKey . ':' . $consumerSecret);
$token_url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, $token_url);
curl_setopt($curl, CURLOPT_HTTPHEADER, ['Authorization: Basic ' . $credentials]);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
$token_response = curl_exec($curl);
curl_close($curl);

$token_result = json_decode($token_response);
$access_token = $token_result->access_token;

// 3.2 STK Push request
$timestamp = date('YmdHis');
$password = base64_encode($BusinessShortCode . $Passkey . $timestamp);

$stkPushUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
$callbackURL = 'https://yourdomain.com/callback.php'; // Change to your real callback URL

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
$stk_response = curl_exec($curl);
curl_close($curl);

$stk_result = json_decode($stk_response, true);

// 4. Save to donate table (only phone, amount, checkout ID, status)
if (isset($stk_result['CheckoutRequestID'])) {
    $checkoutRequestID = $stk_result['CheckoutRequestID'];

    $stmt = $pdo->prepare("INSERT INTO donate (phone, amount, checkout_request_id, status, created_at) VALUES (?, ?, ?, ?, NOW())");
    $stmt->execute([$phone, $amount, $checkoutRequestID, 'PENDING']);

    echo "Thank you $firstName! Please complete payment on your phone.";
} else {
    echo "Error: " . ($stk_result['errorMessage'] ?? 'Unable to initiate M-Pesa payment.');
}
?>
