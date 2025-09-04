<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;
use Laravel\Lumen\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * Report or log an exception.
     */
    public function report(Throwable $e): void
    {
        parent::report($e);
    }

    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $e)
    {
        // Validation errors
        if ($e instanceof \Illuminate\Validation\ValidationException) {
            return response()->json([
                'error'   => 'Validation failed',
                'details' => $e->errors(),
            ], 422);
        }

        // Authentication errors
        if ($e instanceof \Illuminate\Auth\AuthenticationException) {
            return response()->json([
                'error' => 'Unauthorized',
            ], 401);
        }

        // HTTP exceptions (like 404, 405, etc.)
        if ($this->isHttpException($e)) {
            return response()->json([
                'error' => $e->getMessage() ?: 'HTTP Error',
            ], $e->getStatusCode());
        }

        // Generic errors
        return response()->json([
            'error' => $e->getMessage(),
            'type'  => class_basename($e),
        ], 500);
    }
}
