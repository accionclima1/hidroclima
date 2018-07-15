<?php

namespace App\Http\Controllers;

use DB;
use App\User;
use App\Pchs;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PchsController extends Controller
{
    public function __construct()
    {
      $this->middleware('auth');
    }
    
    public function show()
    {
        $estaciones = DB::select("select * from estaciones where tipo='pronostico' order by idestacion");
        $pchs = DB::select("select * from pchs order by idpch");
        return view('pchs',['estaciones_areas'=>$estaciones,'pchs'=>$pchs]);
    }

    public function guardarPchs(Request $request)
    {
      if($request->accion=="nuevo")
      {
        $pch = new Pchs();
        $pch->nombre_pch = $request->nombrepch;
        $pch->qecologico = $request->qecologico;
        $pch->qdiseno = $request->qdiseno;
        $pch->area_influencia = $request->area_influencia;
        $pch->altura_neta = $request->altura_neta;
        $pch->latitud = $request->latitud;
        $pch->longitud = $request->longitud;
        $pch->save();

        $estaciones = DB::select("select * from estaciones where tipo='pronostico' order by idestacion");

        foreach($estaciones as $estacion)
        {
            DB::insert("insert into pch_area_estacion (idpch,idestacion,area_influencia,porcentaje) values (?,?,?,?)",
                      [$pch->idpch,$estacion->idestacion,$request->estacion_area[$estacion->idestacion],$request->estacion_porcentaje[$estacion->idestacion]]);
        }
      }

      if($request->accion=="editar")
      {
        $pch = Pchs::find($request->idpch);
        $pch->nombre_pch = $request->nombrepch;
        $pch->save();

        $estaciones = DB::select("select * from estaciones where tipo='pronostico' order by idestacion");

        foreach($estaciones as $estacion)
        {
            DB::update("update pch_area_estacion set area_influencia = ?, porcentaje = ? where idpch = ? and idestacion = ?",
                      [$request->estacion_area[$estacion->idestacion],$request->estacion_porcentaje[$estacion->idestacion],$request->idpch,$estacion->idestacion]);
        }
      }

      if($request->accion=="eliminar")
      {
          $registros = DB::select("select * from pchs_pronostico where idpch = ? limit 10",[$request->idpch]);
          if(count($registros)<1)
          {
            DB::delete("delete from pch_area_estacion where idpch = ?",[$request->idpch]);
            DB::delete("delete from parametros_escorrentia_q where idpch = ?",[$request->idpch]);
            Pchs::destroy($request->idpch);
          }
      }

      if(isset($request->accion_) && $request->accion_ == "editar_parametros")
      {
        DB::delete("delete from parametros_escorrentia_q where idpch = ?",[$request->idpch_]);
        for($i=1;$i<13;$i++)
        {
          DB::insert("insert into parametros_escorrentia_q (idpch,parametro,mes,valor) values (?,?,?,?)",
                    [$request->idpch_,'coeficiente',$i,$request->coeficiente[$i]]);
          DB::insert("insert into parametros_escorrentia_q (idpch,parametro,mes,valor) values (?,?,?,?)",
                    [$request->idpch_,'qminimo',$i,$request->qminimo[$i]]);
          DB::insert("insert into parametros_escorrentia_q (idpch,parametro,mes,valor) values (?,?,?,?)",
                    [$request->idpch_,'qmaximo',$i,$request->qmaximo[$i]]);          
        }
      }

      $estaciones = DB::select("select * from estaciones where tipo='pronostico' order by idestacion");
      $pchs = DB::select("select * from pchs order by idpch");
      return view('pchs',['estaciones_areas'=>$estaciones,'pchs'=>$pchs]);
    }

    public function getAreasEstacionByPCH(Request $request)
    {
      $areas = DB::select("select * from pch_area_estacion where idpch = ?",[$request->idpch]);
      return response()->json($areas);
    }

    public function getParametrosEscorrentiaByPCH(Request $request)
    {
      $parametros = DB::select("select * from parametros_escorrentia_q where idpch = ?
                               order by parametro, mes",[$request->idpch]);
      return response()->json($parametros);
    }
}
