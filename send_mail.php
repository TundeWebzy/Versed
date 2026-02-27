<?php
// send_mail.php

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // 1. Get form fields
    $name     = isset($_POST["name"]) ? trim($_POST["name"]) : "";
    $email    = isset($_POST["email"]) ? trim($_POST["email"]) : "";
    $org      = isset($_POST["organisation"]) ? trim($_POST["organisation"]) : "";
    $interest = isset($_POST["interest"]) ? trim($_POST["interest"]) : "";
    $message  = isset($_POST["message"]) ? trim($_POST["message"]) : "";

    // 2. Basic validation
    if ($name === "" || $email === "" || $message === "") {
        header("Location: contact.html?error=missing");
        exit;
    }

    // 3. Build email
    $to      = "info@versedglobal.com"; // Microsoft-hosted mailbox
    $subject = "New Contact Form Submission - Versed Global";

    $body  = "You have a new contact form submission:\r\n\r\n";
    $body .= "Name: " . $name . "\r\n";
    $body .= "Email: " . $email . "\r\n";
    $body .= "Organisation: " . $org . "\r\n";
    $body .= "Interest: " . $interest . "\r\n\r\n";
    $body .= "Message:\r\n" . $message . "\r\n";

    // 4. Headers
    // From should be a valid address on your domain to avoid spam issues
    $headers  = "From: Versed Global Website <info@versedglobal.com>\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    // 5. Send and redirect
    if (mail($to, $subject, $body, $headers)) {
        header("Location: contact.html?submitted");
        exit;
    } else {
        header("Location: contact.html?error=send");
        exit;
    }
} else {
    header("Location: contact.html");
    exit;
}
