<?php
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Método no permitido']);
    exit;
}

if (empty($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'message' => 'No hay sesión activa']);
    exit;
}

echo json_encode(['ok' => true, 'user' => $_SESSION['user']]);
