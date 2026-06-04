<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Método no permitido']);
    exit;
}

$body     = jsonBody();
$email    = strtolower(trim($body['email'] ?? ''));
$password = $body['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'Credenciales inválidas']);
    exit;
}

try {
    $db   = getDB();
    $stmt = $db->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'message' => 'Credenciales inválidas']);
        exit;
    }

    $_SESSION['user'] = [
        'id'    => $user['id'],
        'name'  => $user['name'],
        'email' => $user['email'],
        'role'  => $user['role'],
    ];

    echo json_encode([
        'ok'      => true,
        'message' => 'Inicio de sesión correcto',
        'user'    => $_SESSION['user'],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Error interno del servidor']);
}
