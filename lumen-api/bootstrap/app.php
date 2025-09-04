<?php

require_once __DIR__.'/../vendor/autoload.php';

(new Laravel\Lumen\Bootstrap\LoadEnvironmentVariables(
    dirname(__DIR__)
))->bootstrap();

date_default_timezone_set(env('APP_TIMEZONE', 'UTC'));

// Initialize application
$app = new Laravel\Lumen\Application(
    dirname(__DIR__)
);

$app->withFacades();
$app->withEloquent();

// Redis alias is automatically available through the service provider

// Service Container Bindings
$app->singleton(
    Illuminate\Contracts\Debug\ExceptionHandler::class,
    App\Exceptions\Handler::class
);

$app->singleton(
    Illuminate\Contracts\Console\Kernel::class,
    App\Console\Kernel::class
);

// Configuration
$app->configure('app');
$app->configure('auth');
$app->configure('jwt');

// Service Providers
$app->register(Tymon\JWTAuth\Providers\LumenServiceProvider::class);
$app->register(App\Providers\AuthServiceProvider::class);
$app->register(Illuminate\Redis\RedisServiceProvider::class);

// JWT aliases are automatically available through the service provider

$app->middleware([
    App\Http\Middleware\CorsMiddleware::class,
]);

// Route Middleware
$app->routeMiddleware([
    'auth' => App\Http\Middleware\Authenticate::class,
    'jwt'  => Tymon\JWTAuth\Http\Middleware\Authenticate::class,
]);

// Load routes
$app->router->group([
    'namespace' => 'App\Http\Controllers',
], function ($router) {
    require __DIR__.'/../routes/web.php';
});

return $app;
