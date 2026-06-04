<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Método no permitido']);
    exit;
}

$user = requireAuth();

try {
    $db   = getDB();
    $stmt = $db->prepare(
        'SELECT id, total, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC'
    );
    $stmt->execute([$user['id']]);
    $orders = $stmt->fetchAll();

    echo json_encode(['ok' => true, 'orders' => $orders]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Error interno al obtener pedidos']);
}
