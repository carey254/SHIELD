<?php
header('Content-Type: application/json');
require_once __DIR__ ."/db.php"; // Use PDO connection
require_once __DIR__ ."/process_donation.php";


// Get inputs
$frequency  = trim($_POST['frequency'] ?? '');
$amount     = (int)($_POST['amount'] ?? 0);
$first_name = trim($_POST['first_name'] ?? '');
$last_name  = trim($_POST['last_name'] ?? '');
$email      = trim($_POST['email'] ?? '');
$phone      = trim($_POST['phone'] ?? '');
$message    = trim($_POST['message'] ?? '');

// Format phone (remove + if it exists)
$phone = ltrim($phone, '+');

// Validate
if (!$frequency || !$amount || !$first_name || !$last_name || !$email || !$phone) {
    echo json_encode(['status' => 'error', 'message' => 'All required fields must be filled']);
    exit;
}

// Safaricom credentials
$consumerKey = 'YOUR_CONSUMER_KEY';
$consumerSecret = 'YOUR_CONSUMER_SECRET';
$BusinessShortCode = 'YOUR_SHORTCODE';
$Passkey = 'YOUR_PASSKEY';

// 1. Generate Access Token
$credentials = base64_encode($consumerKey . ':' . $consumerSecret);
$url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, $url);
curl_setopt($curl, CURLOPT_HTTPHEADER, array(
    'Authorization: Basic ' . $credentials
));
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($curl);
curl_close($curl);

$result = json_decode($response);
if (!isset($result->access_token)) {
    echo json_encode(['status' => 'error', 'message' => 'Failed to get access token']);
    exit;
}
$access_token = $result->access_token;

// 2. Initiate STK Push
$timestamp = date('YmdHis');
$password = base64_encode($BusinessShortCode . $Passkey . $timestamp);

$stkPushUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

$callbackURL = 'https://yourdomain.com/callback.php'; // UPDATE this to your real callback URL

$stk_data = [
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
curl_setopt($curl, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',
    'Authorization: Bearer ' . $access_token
));
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($stk_data));

$stk_response = curl_exec($curl);
curl_close($curl);

$res = json_decode($stk_response, true);

if (!isset($res['CheckoutRequestID'])) {
    echo json_encode(['status' => 'error', 'message' => 'STK push failed']);
    exit;
}

$checkoutRequestID = $res['CheckoutRequestID'];

// 3. Save donation details + checkoutRequestID
$stmt = $pdo->prepare("INSERT INTO donations (frequency, amount, first_name, last_name, email, phone, message, checkout_request_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->execute([
    $frequency, $amount, $first_name, $last_name, $email, $phone, $message, $checkoutRequestID, 'PENDING'
]);
$insert_id = $pdo->lastInsertId();

// 4. (Optional) Send email
sendEmail($email, "Thank you for your donation", "Hi {$first_name},\n\nWe received your donation request of KES {$amount}. Kindly complete payment via M-PESA prompt.\n\n– ShieldMaidens Team");

// 5. Respond
echo json_encode(['status' => 'success', 'message' => 'Donation initiated. Complete payment via MPESA prompt!', 'db_id' => $insert_id]);
?>
