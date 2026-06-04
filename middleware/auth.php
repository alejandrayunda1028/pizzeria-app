<?php
function requireAuth(): array {
    if (empty($_SESSION['user'])) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'message' => 'No autenticado']);
        exit;
    }
    return $_SESSION['user'];
}

function requireAdmin(): array {
    $user = requireAuth();
    if (($user['role'] ?? '') !== 'admin') {
        http_response_code(403);
        echo json_encode(['ok' => false, 'message' => 'Acceso denegado']);
        exit;
    }
    return $user;
}

// Lee el cuerpo JSON de la petición
function jsonBody(): array {
    static $body = null;
    if ($body !== null) return $body;
    $raw  = file_get_contents('php://input');
    $body = json_decode($raw, true) ?? [];
    return $body;
}
