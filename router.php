<?php
/**
 * router.php — Enrutador principal para el servidor PHP integrado.
 * Uso: php -S 0.0.0.0:10000 router.php
 */

if (session_status() === PHP_SESSION_NONE) {
    session_name('pizzeria_session');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'secure'   => isset($_SERVER['HTTPS']),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// ─── Archivos estáticos desde public/ ────────────────────────────────────────
if ($uri !== '/') {
    $publicFile = __DIR__ . '/public' . $uri;
    if (file_exists($publicFile) && !is_dir($publicFile)) {
        $ext = strtolower(pathinfo($publicFile, PATHINFO_EXTENSION));
        $mimes = [
            'html'  => 'text/html; charset=utf-8',
            'css'   => 'text/css',
            'js'    => 'application/javascript',
            'png'   => 'image/png',
            'jpg'   => 'image/jpeg',
            'jpeg'  => 'image/jpeg',
            'gif'   => 'image/gif',
            'ico'   => 'image/x-icon',
            'svg'   => 'image/svg+xml',
            'woff'  => 'font/woff',
            'woff2' => 'font/woff2',
        ];
        if (isset($mimes[$ext])) {
            header('Content-Type: ' . $mimes[$ext]);
        }
        readfile($publicFile);
        return;
    }
}

// ─── Rutas de la API ──────────────────────────────────────────────────────────
if (strpos($uri, '/api/') === 0) {
    header('Content-Type: application/json; charset=utf-8');

    // Auth
    if ($uri === '/api/auth/login')    { include __DIR__ . '/api/auth/login.php';    return; }
    if ($uri === '/api/auth/register') { include __DIR__ . '/api/auth/register.php'; return; }
    if ($uri === '/api/auth/logout')   { include __DIR__ . '/api/auth/logout.php';   return; }
    if ($uri === '/api/auth/me')       { include __DIR__ . '/api/auth/me.php';       return; }

    // Pizza
    if ($uri === '/api/pizza/options') { include __DIR__ . '/api/pizza/options.php'; return; }

    // Orders
    if ($uri === '/api/orders' || $uri === '/api/orders/') {
        include __DIR__ . '/api/orders/index.php';
        return;
    }
    if ($uri === '/api/orders/my-orders') {
        include __DIR__ . '/api/orders/my_orders.php';
        return;
    }

    // Admin — rutas fijas
    if ($uri === '/api/admin/dashboard') { include __DIR__ . '/api/admin/dashboard.php'; return; }
    if ($uri === '/api/admin/orders')    { include __DIR__ . '/api/admin/orders.php';    return; }
    if ($uri === '/api/admin/products')  { include __DIR__ . '/api/admin/products.php';  return; }

    // Admin — rutas dinámicas
    if (preg_match('#^/api/admin/orders/([^/]+)/status$#', $uri, $m)) {
        $routeParam = $m[1];
        include __DIR__ . '/api/admin/order_status.php';
        return;
    }
    if (preg_match('#^/api/admin/products/([^/]+)$#', $uri, $m)) {
        $routeParam = $m[1];
        include __DIR__ . '/api/admin/product_item.php';
        return;
    }

    http_response_code(404);
    echo json_encode(['ok' => false, 'message' => 'Ruta no encontrada']);
    return;
}

// ─── Páginas HTML ─────────────────────────────────────────────────────────────
$pages = [
    '/login'    => '/login.html',
    '/register' => '/register.html',
    '/builder'  => '/builder.html',
    '/admin'    => '/admin.html',
];

if (isset($pages[$uri])) {
    header('Content-Type: text/html; charset=utf-8');
    readfile(__DIR__ . '/public' . $pages[$uri]);
    return;
}

// Por defecto: index.html
header('Content-Type: text/html; charset=utf-8');
readfile(__DIR__ . '/public/index.html');
