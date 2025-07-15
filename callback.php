<?php
require_once __DIR__ ."/db.php";

$callbackJSONData = file_get_contents('php://input');
$callbackData = json_decode($callbackJSONData, true);

if (isset($callbackData['Body']['stkCallback'])) {
    $stkCallback = $callbackData['Body']['stkCallback'];
    $checkoutRequestID = $stkCallback['CheckoutRequestID'];
    $resultCode = $stkCallback['ResultCode'];

    if ($resultCode == 0) {
        $amount = $stkCallback['CallbackMetadata']['Item'][0]['Value'];
        $mpesaReceiptNumber = $stkCallback['CallbackMetadata']['Item'][1]['Value'];
        $phone = $stkCallback['CallbackMetadata']['Item'][2]['Value'];

        $stmt = $pdo->prepare("UPDATE donations SET status = 'COMPLETED', paid_amount = ?, mpesa_receipt = ? WHERE checkout_request_id = ?");
        $stmt->execute([$amount, $mpesaReceiptNumber, $checkoutRequestID]);
    } else {
        $stmt = $pdo->prepare("UPDATE donations SET status = 'FAILED' WHERE checkout_request_id = ?");
        $stmt->execute([$checkoutRequestID]);
    }
}
?>
