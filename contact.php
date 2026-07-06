<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');

$recipientEmail = 'hello@kitchora.com';
$siteName = 'Kitchora';
$companyName = 'Kitchora Matching Group LLC';

function jsonResponse(bool $success, string $message, int $statusCode = 200, array $extra = []): void
{
    http_response_code($statusCode);

    echo json_encode(
        array_merge(
            [
                'success' => $success,
                'message' => $message,
            ],
            $extra
        ),
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );

    exit;
}

function postValue(string $key): string
{
    return isset($_POST[$key]) ? trim((string) $_POST[$key]) : '';
}

function cleanText(string $value, int $maxLength = 1000): string
{
    $value = strip_tags($value);
    $value = preg_replace('/[ \t]+/', ' ', $value) ?? $value;
    $value = preg_replace('/\R{3,}/', "\n\n", $value) ?? $value;
    $value = trim($value);

    if (mb_strlen($value, 'UTF-8') > $maxLength) {
        $value = mb_substr($value, 0, $maxLength, 'UTF-8');
    }

    return $value;
}

function cleanHeaderValue(string $value, int $maxLength = 160): string
{
    $value = str_replace(["\r", "\n"], '', $value);
    $value = trim(strip_tags($value));

    if (mb_strlen($value, 'UTF-8') > $maxLength) {
        $value = mb_substr($value, 0, $maxLength, 'UTF-8');
    }

    return $value;
}

function isValidConsent(string $value): bool
{
    $acceptedValues = ['1', 'true', 'yes', 'on', 'accepted', 'agree', 'agreed'];
    return in_array(strtolower(trim($value)), $acceptedValues, true);
}

function getClientIp(): string
{
    $keys = [
        'HTTP_CF_CONNECTING_IP',
        'HTTP_X_REAL_IP',
        'HTTP_X_FORWARDED_FOR',
        'REMOTE_ADDR',
    ];

    foreach ($keys as $key) {
        if (empty($_SERVER[$key])) {
            continue;
        }

        $value = (string) $_SERVER[$key];
        $parts = explode(',', $value);
        $ip = trim($parts[0]);

        if (filter_var($ip, FILTER_VALIDATE_IP)) {
            return $ip;
        }
    }

    return 'Unavailable';
}

function formatEmailBody(array $data, string $siteName, string $companyName): string
{
    $lines = [];

    $lines[] = "New kitchen request submitted from {$siteName}";
    $lines[] = str_repeat('=', 52);
    $lines[] = "";
    $lines[] = "Platform: {$siteName}";
    $lines[] = "Company: {$companyName}";
    $lines[] = "";
    $lines[] = "Homeowner details";
    $lines[] = "Name: {$data['name']}";
    $lines[] = "Email: {$data['email']}";
    $lines[] = "Phone: {$data['phone']}";
    $lines[] = "";
    $lines[] = "Request details";
    $lines[] = "Kitchen category: {$data['service']}";
    $lines[] = "Preferred timeline: {$data['timeline']}";
    $lines[] = "Project location: {$data['location']}";
    $lines[] = "Source page: {$data['source_page']}";
    $lines[] = "";
    $lines[] = "Message";
    $lines[] = $data['message'];
    $lines[] = "";
    $lines[] = "Consent";
    $lines[] = "User confirmed consent: {$data['consent_label']}";
    $lines[] = "";
    $lines[] = "Technical details";
    $lines[] = "Submitted: " . gmdate('Y-m-d H:i:s') . " UTC";
    $lines[] = "IP address: " . getClientIp();
    $lines[] = "User agent: " . cleanText((string) ($_SERVER['HTTP_USER_AGENT'] ?? 'Unavailable'), 260);
    $lines[] = "";
    $lines[] = "Important platform note";
    $lines[] = "{$siteName} is an independent provider-matching platform. This submission does not create a contractor-client relationship with {$siteName}. Provider availability, pricing, scheduling, licensing, insurance, warranties, and service terms are determined by participating providers.";

    return implode("\n", $lines);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Only POST requests are allowed.', 405);
}

$honeypot = postValue('website') ?: postValue('company_website');

if ($honeypot !== '') {
    jsonResponse(false, 'Submission could not be processed.', 400);
}

$name = cleanText(postValue('name'), 120);
$email = cleanText(postValue('email'), 180);
$phone = cleanText(postValue('phone'), 80);
$service = cleanText(postValue('service') ?: postValue('project_type') ?: postValue('category'), 160);
$timeline = cleanText(postValue('timeline'), 140);
$location = cleanText(postValue('location') ?: postValue('city') ?: postValue('project_location'), 180);
$message = cleanText(postValue('message') ?: postValue('project_message') ?: postValue('details'), 2600);
$sourcePage = cleanText(postValue('source_page'), 180);
$siteBrand = cleanText(postValue('site_brand'), 120);
$consent = postValue('consent') ?: postValue('privacy_consent') ?: postValue('agreement');

if ($siteBrand !== '') {
    $siteName = $siteBrand;
}

$errors = [];

if ($name === '') {
    $errors['name'] = 'Name is required.';
}

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'A valid email address is required.';
}

$phoneDigits = preg_replace('/[^\d+]/', '', $phone) ?? '';

if ($phone === '' || strlen($phoneDigits) < 7) {
    $errors['phone'] = 'A valid phone number is required.';
}

if ($service === '') {
    $errors['service'] = 'Kitchen category is required.';
}

if ($message === '') {
    $errors['message'] = 'Project details are required.';
}

if (!isValidConsent($consent)) {
    $errors['consent'] = 'Consent is required.';
}

if (!empty($errors)) {
    jsonResponse(
        false,
        'Please complete the required fields before submitting.',
        422,
        ['errors' => $errors]
    );
}

if ($timeline === '') {
    $timeline = 'Not specified';
}

if ($location === '') {
    $location = 'Not specified';
}

if ($sourcePage === '') {
    $sourcePage = 'Contact page';
}

$data = [
    'name' => $name,
    'email' => $email,
    'phone' => $phone,
    'service' => $service,
    'timeline' => $timeline,
    'location' => $location,
    'message' => $message,
    'source_page' => $sourcePage,
    'consent_label' => 'Yes',
];

$safeService = cleanHeaderValue($service, 90);
$safeName = cleanHeaderValue($name, 90);
$safeEmail = cleanHeaderValue($email, 180);

$subject = "New {$siteName} kitchen request";
if ($safeService !== '') {
    $subject .= " - {$safeService}";
}

$emailBody = formatEmailBody($data, $siteName, $companyName);

$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$host = preg_replace('/[^a-zA-Z0-9.\-]/', '', (string) $host);
$fromEmail = 'noreply@' . ($host !== '' ? $host : 'localhost');

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: ' . cleanHeaderValue($siteName) . ' <' . $fromEmail . '>',
    'Reply-To: ' . $safeName . ' <' . $safeEmail . '>',
    'X-Mailer: PHP/' . phpversion(),
];

$mailSent = false;

try {
    $mailSent = mail(
        $recipientEmail,
        '=?UTF-8?B?' . base64_encode($subject) . '?=',
        $emailBody,
        implode("\r\n", $headers)
    );
} catch (Throwable $exception) {
    $mailSent = false;
}

if (!$mailSent) {
    jsonResponse(
        false,
        'The request could not be sent right now. Please try again or contact us directly by email.',
        500
    );
}

jsonResponse(
    true,
    'Thank you. Your request has been received. Kitchora may use your submitted details to help organize provider-matching options where available.'
);
