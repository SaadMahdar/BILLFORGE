<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InvoiceController as ApiInvoiceController ;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/invoices', [ApiInvoiceController::class, 'index']); // Read All
    Route::get('/invoices/{invoice}', [ApiInvoiceController::class, 'show']); // Read One
    Route::post('/invoices', [ApiInvoiceController::class, 'store']); // Create
    Route::patch('/invoices/{invoice}/status', [ApiInvoiceController::class, 'updateStatus']); // Patch Status
    Route::delete('/invoices/{invoice}', [ApiInvoiceController::class, 'destroy']); // Delete
    Route::get('/invoices/{id}/pdf', [InvoiceController::class, 'downloadPdf']);
});


Route::post('/login', [AuthController::class, 'login']);

