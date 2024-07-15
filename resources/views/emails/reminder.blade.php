<!DOCTYPE html>
<html>

<head>
    <title>Reminder: Document Expiration</title>
</head>

<body>
    <h1>Hello {{ $user }},</h1>
    <p>This is a reminder that your document titled "{{ $title }}" of type "{{ $type }}" is expiring in {{ $days_to_expire }} days.</p>
    <p><strong>Expiration Date:</strong> {{ $expiration_date }}</p>
    <p><strong>Status:</strong> {{ $status }}</p>
    <p>Please take the necessary actions.</p>
    <p>Thank you,</p>
    <p>Document Management System</p>
</body>

</html>