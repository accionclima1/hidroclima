<?php

namespace App\Http\Controllers;

use DB;
use App\User;
use App\PuntosNivel;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PuntosNivelController extends Controller
{
    public function __construct()
    {
      $this->middleware('auth');
    }

    public function main()
    {
        $puntos = DB::select("select * from puntos_nivel order by puntoid");

        foreach($puntos as $punto)
        {
            $punto->coeficientes = json_decode($punto->coeficientes);
        }

        return view('puntosnivel',['puntos'=>$puntos]);
    }

    public function guardar(Request $request)
    {
        if($request->accion=="nuevo")
        {
            if($request->coeficiente_A==null) $request->coeficiente_A = 0;
            if($request->coeficiente_B==null) $request->coeficiente_B = 0;
            if($request->coeficiente_C==null) $request->coeficiente_C = 0;

            $punto = new PuntosNivel();
            $punto->nombre = $request->nombre;
            $punto->latitud = $request->latitud;
            $punto->longitud = $request->longitud;
            $punto->coeficientes = json_encode([$request->coeficiente_A, $request->coeficiente_B, $request->coeficiente_C]);
            $punto->save();
        }

        if($request->accion=="editar")
        {
            if($request->coeficiente_A==null) $request->coeficiente_A = 0;
            if($request->coeficiente_B==null) $request->coeficiente_B = 0;
            if($request->coeficiente_C==null) $request->coeficiente_C = 0;
            
            $punto = PuntosNivel::find($request->puntoid);
            $punto->nombre = $request->nombre;
            $punto->latitud = $request->latitud;
            $punto->longitud = $request->longitud;
            $punto->coeficientes = json_encode([$request->coeficiente_A, $request->coeficiente_B, $request->coeficiente_C]);
            $punto->save();
        }

        if($request->accion=="eliminar")
        {
            Estaciones::destroy($request->idestacion);
        }

        $puntos = DB::select("select * from puntos_nivel order by puntoid");

        foreach($puntos as $punto)
        {
            $punto->coeficientes = json_decode($punto->coeficientes);
        }

        return view('puntosnivel',['puntos'=>$puntos]);
    }
}
