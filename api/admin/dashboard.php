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
    $db = getDB();

    $totalOrders = (int) $db->query('SELECT COUNT(*) FROM orders')->fetchColumn();
    $totalSales  = (float) ($db->query('SELECT SUM(total) FROM orders')->fetchColumn() ?? 0);

    $today = date('Y-m-d');
    $stmt  = $db->prepare("SELECT COUNT(*) FROM orders WHERE created_at LIKE ?");
    $stmt->execute([$today . '%']);
    $todayOrders = (int) $stmt->fetchColumn();

    echo json_encode([
        'ok'    => true,
        'stats' => [
            'totalOrders' => $totalOrders,
            'totalSales'  => $totalSales,
            'todayOrders' => $todayOrders,
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Error al obtener estadísticas']);
}
