<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('index');
});

Route::post('/getLayersMiembro','MainController@getLayersMiembro');

Route::get('/getLayersMiembro','MainController@getLayersMiembro');

Route::post('/getLayersByLayerGroup','MainController@getLayersByLayerGroup');

Route::get('/getLayersByLayerGroup','MainController@getLayersByLayerGroup');