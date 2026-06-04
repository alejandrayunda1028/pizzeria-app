<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Método no permitido']);
    exit;
}

$user   = requireAuth();
$body   = jsonBody();
$pizzas = $body['pizzas'] ?? null;
$total  = $body['total']  ?? 0;

if (!$pizzas || !is_array($pizzas) || count($pizzas) === 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'El carrito está vacío']);
    exit;
}

try {
    $db      = getDB();
    $orderId = _uuid();

    $db->prepare('INSERT INTO orders (id, user_id, pizzas, total) VALUES (?, ?, ?, ?)')
       ->execute([$orderId, $user['id'], json_encode($pizzas), (float) $total]);

    http_response_code(201);
    echo json_encode(['ok' => true, 'message' => 'Pedido realizado con éxito', 'orderId' => $orderId]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Error interno al procesar el pedido']);
}
