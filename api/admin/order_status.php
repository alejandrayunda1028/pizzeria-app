<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Método no permitido']);
    exit;
}

requireAdmin();

$body    = jsonBody();
$status  = $body['status'] ?? '';
$orderId = $routeParam; // inyectado por router.php

$valid = ['pendiente', 'en preparación', 'en camino', 'entregado'];
if (!in_array($status, $valid, true)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'Estado inválido']);
    exit;
}

try {
    $db = getDB();
    $db->prepare('UPDATE orders SET status = ? WHERE id = ?')
       ->execute([$status, $orderId]);

    echo json_encode(['ok' => true, 'message' => 'Estado actualizado correctamente']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Error al actualizar el pedido']);
}
