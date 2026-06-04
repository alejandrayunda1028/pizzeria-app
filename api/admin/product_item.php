<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

requireAdmin();

$method    = $_SERVER['REQUEST_METHOD'];
$productId = $routeParam; // inyectado por router.php

if ($method === 'PUT') {
    $body     = jsonBody();
    $category = trim($body['category'] ?? '');
    $name     = trim($body['name']     ?? '');
    $price    = (float) ($body['price'] ?? 0);
    $active   = isset($body['active']) ? (int) $body['active'] : 1;

    try {
        $db = getDB();
        $db->prepare('UPDATE products SET category = ?, name = ?, price = ?, active = ? WHERE id = ?')
           ->execute([$category, $name, $price, $active, $productId]);

        echo json_encode(['ok' => true, 'message' => 'Producto actualizado']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'message' => 'Error al actualizar producto']);
    }

} elseif ($method === 'DELETE') {
    try {
        $db = getDB();
        $db->prepare('DELETE FROM products WHERE id = ?')
           ->execute([$productId]);

        echo json_encode(['ok' => true, 'message' => 'Producto eliminado']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'message' => 'Error al eliminar producto']);
    }

} else {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Método no permitido']);
}
