<?php
session_start();

require_once __DIR__ . '/config/Settings.php';
require_once __DIR__ . '/config/Database.php';

require_once __DIR__ . '/Models/Log.php';
require_once __DIR__ . '/Models/License.php';
require_once __DIR__ . '/Models/Device.php';
require_once __DIR__ . '/Models/Admin.php';

require_once __DIR__ . '/Controllers/AuthController.php';
require_once __DIR__ . '/Controllers/AdminController.php';
require_once __DIR__ . '/Controllers/ApiController.php';

$route = isset($_GET['route']) ? $_GET['route'] : '';
$routeParts = explode('/', trim($route, '/'));
$base = $routeParts[0] ?? '';
$action = $routeParts[1] ?? '';

if (empty($base)) {
    header("Location: /admin/dashboard");
    exit;
}

if ($base === 'admin') {
    (new AdminController())->handleRequest($base, $action);
} elseif ($base === 'api') {
    (new ApiController())->handleRequest($routeParts[2] ?? $action);
} else {
    header("HTTP/1.0 404 Not Found");
    echo "404 Not Found";
}
