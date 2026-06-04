<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Método no permitido']);
    exit;
}

$body     = jsonBody();
$name     = trim($body['name'] ?? '');
$email    = strtolower(trim($body['email'] ?? ''));
$password = $body['password'] ?? '';

if (!$name || !$email || !$password) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'Todos los campos son obligatorios']);
    exit;
}

if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/', $password)) {
    http_response_code(400);
    echo json_encode([
        'ok'      => false,
        'message' => 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.',
    ]);
    exit;
}

try {
    $db   = getDB();
    $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'message' => 'El correo ya está registrado']);
        exit;
    }

    $id = (string) time() . rand(100, 999);
    $db->prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)')
       ->execute([
           $id,
           $name,
           $email,
           password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]),
           'user',
       ]);

    http_response_code(201);
    echo json_encode(['ok' => true, 'message' => 'Usuario registrado correctamente. Por favor inicia sesión.']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'Ocurrió un error al procesar el registro. Intenta más tarde.']);
}
