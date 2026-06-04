<?php
require_once __DIR__ . '/../../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Método no permitido']);
    exit;
}

try {
    $db       = getDB();
    $products = $db->query('SELECT category, name, price FROM products WHERE active = 1')->fetchAll();

    $sizes          = [];
    $doughs         = [];
    $sauces         = [];
    $toppings       = [];
    $cuts           = [];
    $pricingSizes   = [];
    $pricingToppings = [];

    foreach ($products as $p) {
        switch ($p['category']) {
            case 'size':
                $sizes[]                    = $p['name'];
                $pricingSizes[$p['name']]   = (float) $p['price'];
                break;
            case 'dough':
                $doughs[] = $p['name'];
                break;
            case 'sauce':
                $sauces[] = $p['name'];
                break;
            case 'topping':
                $toppings[]                    = $p['name'];
                $pricingToppings[$p['name']]   = (float) $p['price'];
                break;
            case 'cut':
                $cuts[] = $p['name'];
                break;
        }
    }

    echo json_encode([
        'ok'      => true,
        'options' => [
            'sizes'    => $sizes,
            'doughs'   => $doughs,
            'sauces'   => $sauces,
            'toppings' => $toppings,
            'cuts'     => $cuts,
            'pricing'  => [
                'sizes'    => $pricingSizes,
                'toppings' => $pricingToppings,
            ],
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Error interno al cargar opciones']);
}
