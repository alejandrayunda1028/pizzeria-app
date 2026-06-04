<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Método no permitido']);
    exit;
}

requireAdmin();

try {
    $db     = getDB();
    $orders = $db->query('
        SELECT o.id, o.pizzas, o.total, o.status, o.created_at,
               u.name  AS user_name,
               u.email AS user_email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
    ')->fetchAll();

    echo json_encode(['ok' => true, 'orders' => $orders]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Error al obtener pedidos']);
}
