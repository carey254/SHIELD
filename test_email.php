<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/PHPMailer-master/src/PHPMailer.php';
require_once __DIR__ . '/PHPMailer-master/src/Exception.php';
require_once __DIR__ . '/PHPMailer-master/src/SMTP.php';

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'shi3ldmaidens@gmail.com';
    $mail->Password   = 'gntxvcdacaszpuom';
    $mail->SMTPSecure = 'tls';
    $mail->Port       = 587;

    $mail->setFrom('shi3ldmaidens@gmail.com', 'ShieldMaidens');
    $mail->addAddress('shi3ldmaidens@gmail.com');
    $mail->Subject = 'Test Email';
    $mail->Body    = 'This is a test email from PHPMailer!';

    $mail->send();
    echo 'Message has been sent';
} catch (Exception $e) {
    echo "Mailer Error: " . $mail->ErrorInfo;
}
