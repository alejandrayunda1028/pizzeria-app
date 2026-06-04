<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

requireAdmin();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $db       = getDB();
        $products = $db->query('SELECT * FROM products ORDER BY category, name')->fetchAll();
        echo json_encode(['ok' => true, 'products' => $products]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'message' => 'Error al obtener productos']);
    }

} elseif ($method === 'POST') {
    $body     = jsonBody();
    $category = trim($body['category'] ?? '');
    $name     = trim($body['name']     ?? '');
    $price    = (float) ($body['price'] ?? 0);
    $active   = isset($body['active']) ? (int) $body['active'] : 1;

    if (!$category || !$name) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'message' => 'Categoría y nombre son obligatorios']);
        exit;
    }

    try {
        $db = getDB();
        $id = _uuid();
        $db->prepare('INSERT INTO products (id, category, name, price, active) VALUES (?, ?, ?, ?, ?)')
           ->execute([$id, $category, $name, $price, $active]);

        echo json_encode([
            'ok'      => true,
            'message' => 'Producto creado',
            'product' => compact('id', 'category', 'name', 'price', 'active'),
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'message' => 'Error al crear producto']);
    }

} else {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Método no permitido']);
}
