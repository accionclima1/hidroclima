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
Auth::routes();
Route::get('/', 'TableroController@show');
Route::get('/consultaestaciones','ConsultaEstacionesController@consultas');
Route::post('/getResultsByPCH','TableroController@getResultsByPCH');
Route::get('/estaciones', 'EstacionesController@show');
Route::post('/estaciones','EstacionesController@guardarEstacion');
Route::get('/pchs', 'PchsController@show');
Route::post('/pchs','PchsController@guardarPchs');
Route::post('/getAreasEstacionByPCH','PchsController@getAreasEstacionByPCH');
Route::post('/getParametrosEscorrentiaByPCH','PchsController@getParametrosEscorrentiaByPCH');
Route::post('/getRadarImagesLastHour','ApiController@getRadarImagesLastHour');
Route::get('/getRadarImagesLastHour','ApiController@getRadarImagesLastHour');
Route::post('/getEstacionesMedicion','ApiController@getEstacionesMedicion');
Route::get('/getEstacionesMedicion','ApiController@getEstacionesMedicion');
Route::post('/getMedicionesPorEstacion','ApiController@getMedicionesPorEstacion');
Route::get('/getMedicionesPorEstacion','ApiController@getMedicionesPorEstacion');
Route::post('/getResultadosPCH','ApiController@getResultadosPCH');
Route::get('/getResultadosPCH','ApiController@getResultadosPCH');
Route::post('/getPronosticoPCH','ApiController@getPronosticoPCH');
Route::get('/getPronosticoPCH','ApiController@getPronosticoPCH');
Route::post('/getParametrosTelemetricas','ApiController@getParametrosTelemetricas');
Route::get('/getParametrosTelemetricas','ApiController@getParametrosTelemetricas');
Route::post('/getPCHs','ApiController@getPCHs');
Route::get('/getPCHs','ApiController@getPCHs');
Route::post('/validarUsuario','ApiController@validarUsuario');
Route::post('/validarUsuarioByPhone','ApiController@validarUsuarioByPhone');
Route::get('/getToken','ApiController@getToken');
Route::post('/registrarUsuario','ApiController@registrarUsuario');
Route::post('/registrarUsuario2','ApiController@registrarUsuario2');
Route::post('/updateToken','ApiController@updateToken');
Route::post('/sendMessageToAdmin','ApiController@sendMessageToAdmin');
Route::get('/getMensajes','ApiController@getMensajes');
Route::get('/consultas','ConsultasController@consultas');
Route::post('/consultas','ConsultasController@enviarMensaje');
Route::get('/verificarCorreo','ApiController@verificarCorreo');
