<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Método no permitido']);
    exit;
}

session_unset();
session_destroy();

echo json_encode(['ok' => true, 'message' => 'Sesión cerrada']);
