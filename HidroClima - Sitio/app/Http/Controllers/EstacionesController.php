<?php

namespace App\Http\Controllers;

use DB;
use App\User;
use App\Estaciones;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class EstacionesController extends Controller
{
    public function __construct()
    {
      $this->middleware('auth');
    }

    public function show()
    {
        $estaciones = DB::select("select * from estaciones order by tipo, idestacion");
        return view('estaciones',['estaciones'=>$estaciones]);
    }

    public function guardarEstacion(Request $request)
    {
      if($request->accion=="nuevo")
      {
        $estacion = new Estaciones();
        $estacion->idestacion = $request->idestacion;
        $estacion->tipo = $request->tipo;
        $estacion->nombre_estacion = $request->nombreestacion;
        $estacion->latitud = $request->latitud;
        $estacion->longitud = $request->longitud;
        $estacion->elevacion = $request->elevacion;
        $estacion->save();
      }

      if($request->accion=="editar")
      {
        $estacion = Estaciones::find($request->idestacion);
        $estacion->tipo = $request->tipo;
        $estacion->nombre_estacion = $request->nombreestacion;
        $estacion->latitud = $request->latitud;
        $estacion->longitud = $request->longitud;
        $estacion->elevacion = $request->elevacion;
        $estacion->save();
      }

      if($request->accion=="eliminar")
      {
          Estaciones::destroy($request->idestacion);
      }

      $estaciones = DB::select("select * from estaciones order by tipo, idestacion");
      return view('estaciones',['estaciones'=>$estaciones]);
    }
}
