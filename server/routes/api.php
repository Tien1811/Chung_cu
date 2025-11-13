<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\PostImageController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{id}', [PostController::class, 'show']);

Route::get('/provinces', [LocationController::class, 'getProvinces']);
Route::get('/districts', [LocationController::class, 'getDistricts']);
Route::get('/wards', [LocationController::class, 'getWards']);

Route::get('/posts/{postId}/images', [PostImageController::class, 'index']);


Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Posts (admin & lessor)
    Route::post('/posts', [PostController::class, 'store']);
    Route::put('/posts/{id}', [PostController::class, 'update']);
    Route::delete('/posts/{id}', [PostController::class, 'destroy']);

    // Post Images (admin & lessor)
    Route::post('/posts/{postId}/images', [PostImageController::class, 'store']);
    Route::put('/posts/images/{id}', [PostImageController::class, 'update']);
    Route::delete('/posts/images/{id}', [PostImageController::class, 'destroy']);

    // Province (admin)
    Route::post('/provinces', [LocationController::class, 'createProvince']);
    Route::put('/provinces/{id}', [LocationController::class, 'updateProvince']);
    Route::delete('/provinces/{id}', [LocationController::class, 'deleteProvince']);

    // District (admin)
    Route::post('/districts', [LocationController::class, 'createDistrict']);
    Route::put('/districts/{id}', [LocationController::class, 'updateDistrict']);
    Route::delete('/districts/{id}', [LocationController::class, 'deleteDistrict']);

    // Ward (admin)
    Route::post('/wards', [LocationController::class, 'createWard']);
    Route::put('/wards/{id}', [LocationController::class, 'updateWard']);
    Route::delete('/wards/{id}', [LocationController::class, 'deleteWard']);
});



