<?php
function getDB(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $dataDir = __DIR__ . '/../data';
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0777, true);
    }

    $pdo = new PDO('sqlite:' . $dataDir . '/database.sqlite');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    _initDB($pdo);
    return $pdo;
}

function _initDB(PDO $pdo): void {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id       TEXT PRIMARY KEY,
            name     TEXT NOT NULL,
            email    TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role     TEXT NOT NULL DEFAULT 'user'
        );

        CREATE TABLE IF NOT EXISTS orders (
            id         TEXT PRIMARY KEY,
            user_id    TEXT NOT NULL,
            pizzas     TEXT NOT NULL,
            total      REAL NOT NULL,
            status     TEXT NOT NULL DEFAULT 'pendiente',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS products (
            id       TEXT PRIMARY KEY,
            category TEXT NOT NULL,
            name     TEXT NOT NULL,
            price    REAL DEFAULT 0,
            active   INTEGER DEFAULT 1
        );
    ");

    // Admin por defecto
    $adminEmail = 'administrado@gmail.com';
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$adminEmail]);
    if (!$stmt->fetch()) {
        $pdo->prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)')
            ->execute([
                _uuid(),
                'Administrador',
                $adminEmail,
                password_hash('Admin123*', PASSWORD_BCRYPT, ['cost' => 12]),
                'admin',
            ]);
    }

    // Productos por defecto
    $count = (int) $pdo->query('SELECT COUNT(*) FROM products')->fetchColumn();
    if ($count === 0) {
        $defaults = [
            ['size',    'Personal',     15000],
            ['size',    'Mediana',      30000],
            ['size',    'Grande',       45000],
            ['dough',   'Delgada',          0],
            ['dough',   'Tradicional',      0],
            ['dough',   'Gruesa',           0],
            ['sauce',   'Tomate',           0],
            ['sauce',   'BBQ',              0],
            ['sauce',   'Blanca',           0],
            ['cut',     '4 porciones',      0],
            ['cut',     '6 porciones',      0],
            ['cut',     '8 porciones',      0],
            ['cut',     'Cuadrados',         0],
            ['topping', 'Queso extra',   3500],
            ['topping', 'Pepperoni',     3500],
            ['topping', 'Jamón',        3500],
            ['topping', 'Champiñones', 3500],
            ['topping', 'Cebolla',       3500],
            ['topping', 'Aceitunas',     3500],
        ];
        $stmt = $pdo->prepare('INSERT INTO products (id, category, name, price, active) VALUES (?, ?, ?, ?, 1)');
        foreach ($defaults as [$cat, $name, $price]) {
            $stmt->execute([_uuid(), $cat, $name, $price]);
        }
    }
}

function _uuid(): string {
    $d = random_bytes(16);
    $d[6] = chr(ord($d[6]) & 0x0f | 0x40);
    $d[8] = chr(ord($d[8]) & 0x3f | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($d), 4));
}
