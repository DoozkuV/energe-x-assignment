<?php

/** @var \Laravel\Lumen\Routing\Router $router */

$router->post('/api/register', 'AuthController@register');
$router->post('/api/login', 'AuthController@login');

$router->group(['middleware' => 'jwt'], function () use ($router) {
    $router->get('/api/posts', 'PostController@index');
    $router->post('/api/posts', 'PostController@store');
    $router->get('/api/posts/{id}', 'PostController@show');
});
