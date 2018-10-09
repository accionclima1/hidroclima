<?php

namespace App\Http\Controllers;

use DB;
use App\User;
use App\Estaciones;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TableroController extends Controller
{
    public function __construct()
    {
      $this->middleware('auth');
    }

    public function show()
    {
        $pchs = DB::select("select * from pchs order by idpch");
        $fecha = DB::select("select max(fecha) as last from pchs_caudal_potencia")[0];
        $pronosticos = null;
        $resultados = null;
        foreach($pchs as $pch)
        {
          $pronostico_pch = DB::select("select
                              a.nombre_pch,
                              c.nombre_estacion,
                              sum(case when b.tiempo = '24H' and b.variable='pronostico' then b.valor else 0 end) as p24H,
                              sum(case when b.tiempo = '48H' and b.variable='pronostico' then b.valor else 0 end) as p48H,
                              sum(case when b.tiempo = '72H' and b.variable='pronostico' then b.valor else 0 end) as p72H,
                              sum(case when b.tiempo = '24H' and b.variable='ppmedia' then b.valor else 0 end) as pm24H,
                              sum(case when b.tiempo = '48H' and b.variable='ppmedia' then b.valor else 0 end) as pm48H,
                              sum(case when b.tiempo = '72H' and b.variable='ppmedia' then b.valor else 0 end) as pm72H,
                              sum(case when b.tiempo = '24H' and b.variable='qbruto' then b.valor else 0 end) as qb24H,
                              sum(case when b.tiempo = '48H' and b.variable='qbruto' then b.valor else 0 end) as qb48H,
                              sum(case when b.tiempo = '72H' and b.variable='qbruto' then b.valor else 0 end) as qb72H
                            from pchs a inner join pchs_pronostico b on a.idpch = b.idpch inner join estaciones c
                              on b.idestacion = c.idestacion
                            where fecha = '" . $fecha->last . "' and a.idpch = " . $pch->idpch . "
                            group by a.nombre_pch, c.nombre_estacion
                            order by a.nombre_pch, c.nombre_estacion");

          $total_pch = DB::select("select
                            a.nombre_pch,
                            sum(case when b.tiempo = '24H' and b.variable='ppmedia' then b.valor else 0 end) as pm24H,
                            sum(case when b.tiempo = '48H' and b.variable='ppmedia' then b.valor else 0 end) as pm48H,
                            sum(case when b.tiempo = '72H' and b.variable='ppmedia' then b.valor else 0 end) as pm72H,
                            sum(case when b.tiempo = '24H' and b.variable='qbruto' then b.valor else 0 end) as qb24H,
                            sum(case when b.tiempo = '48H' and b.variable='qbruto' then b.valor else 0 end) as qb48H,
                            sum(case when b.tiempo = '72H' and b.variable='qbruto' then b.valor else 0 end) as qb72H
                            from pchs a inner join pchs_pronostico b on a.idpch = b.idpch inner join estaciones c
                            on b.idestacion = c.idestacion
                            where fecha = '" . $fecha->last . "' and a.idpch = " . $pch->idpch . "
                            group by a.nombre_pch
                            order by a.nombre_pch");

          $pronosticos[] = [$pch->nombre_pch,$pronostico_pch,$total_pch];

          $valores = DB::select("select a.idpch, b.nombre_pch, a.tiempo,a.ppmedia, a.qentrada, a.qturbina, a.potencia from
                            pchs_caudal_potencia a inner join pchs b on a.idpch = b.idpch
                            where a.fecha = '" . $fecha->last . "' and a.idpch = " . $pch->idpch . "
                            order by a.idpch, b.nombre_pch, a.tiempo");
          $ppmedia = null;
          $qentrada = null;
          $qturbina = null;
          $potencia = null;
          foreach($valores as $row)
          {
            $ppmedia[] = $row->ppmedia;
            $qentrada[] = $row->qentrada;
            $qturbina[] = $row->qturbina;
            $potencia[] = $row->potencia;
          }

          $resultados[] = [$pch->nombre_pch,$ppmedia,$qentrada,$qturbina,$potencia];
        }
        #return response()->json($pronosticos);
        return view('index',['pronosticos'=>$pronosticos,'resultados'=>$resultados,'fecha'=>$fecha->last,'pchs'=>$pchs]);
    }
    
    public function getResultsByPCH(Request $request)
    {
        $pchs = DB::select("select * from pchs where idpch = ?",[$request->idpch]);
        $fecha = $request->fecha;

        foreach($pchs as $pch)
        {
          $pronostico_pch = DB::select("select
                              a.nombre_pch,
                              c.nombre_estacion,
                              sum(case when b.tiempo = '24H' and b.variable='pronostico' then b.valor else 0 end) as p24H,
                              sum(case when b.tiempo = '48H' and b.variable='pronostico' then b.valor else 0 end) as p48H,
                              sum(case when b.tiempo = '72H' and b.variable='pronostico' then b.valor else 0 end) as p72H,
                              sum(case when b.tiempo = '24H' and b.variable='ppmedia' then b.valor else 0 end) as pm24H,
                              sum(case when b.tiempo = '48H' and b.variable='ppmedia' then b.valor else 0 end) as pm48H,
                              sum(case when b.tiempo = '72H' and b.variable='ppmedia' then b.valor else 0 end) as pm72H,
                              sum(case when b.tiempo = '24H' and b.variable='qbruto' then b.valor else 0 end) as qb24H,
                              sum(case when b.tiempo = '48H' and b.variable='qbruto' then b.valor else 0 end) as qb48H,
                              sum(case when b.tiempo = '72H' and b.variable='qbruto' then b.valor else 0 end) as qb72H
                            from pchs a inner join pchs_pronostico b on a.idpch = b.idpch inner join estaciones c
                              on b.idestacion = c.idestacion
                            where fecha = '" . $fecha . "' and a.idpch = " . $pch->idpch . "
                            group by a.nombre_pch, c.nombre_estacion
                            order by a.nombre_pch, c.nombre_estacion");

          $total_pch = DB::select("select
                            a.nombre_pch,
                            sum(case when b.tiempo = '24H' and b.variable='ppmedia' then b.valor else 0 end) as pm24H,
                            sum(case when b.tiempo = '48H' and b.variable='ppmedia' then b.valor else 0 end) as pm48H,
                            sum(case when b.tiempo = '72H' and b.variable='ppmedia' then b.valor else 0 end) as pm72H,
                            sum(case when b.tiempo = '24H' and b.variable='qbruto' then b.valor else 0 end) as qb24H,
                            sum(case when b.tiempo = '48H' and b.variable='qbruto' then b.valor else 0 end) as qb48H,
                            sum(case when b.tiempo = '72H' and b.variable='qbruto' then b.valor else 0 end) as qb72H
                            from pchs a inner join pchs_pronostico b on a.idpch = b.idpch inner join estaciones c
                            on b.idestacion = c.idestacion
                            where fecha = '" . $fecha . "' and a.idpch = " . $pch->idpch . "
                            group by a.nombre_pch
                            order by a.nombre_pch");

          $pronosticos[] = [$pch->nombre_pch,$pronostico_pch,$total_pch];

          $valores = DB::select("select a.idpch, b.nombre_pch, a.tiempo,a.ppmedia, a.qentrada, a.qturbina, a.potencia from
                            pchs_caudal_potencia a inner join pchs b on a.idpch = b.idpch
                            where a.fecha = '" . $fecha . "' and a.idpch = " . $pch->idpch . "
                            order by a.idpch, b.nombre_pch, a.tiempo");
          $ppmedia = null;
          $qentrada = null;
          $qturbina = null;
          $potencia = null;
          foreach($valores as $row)
          {
            $ppmedia[] = $row->ppmedia;
            $qentrada[] = $row->qentrada;
            $qturbina[] = $row->qturbina;
            $potencia[] = $row->potencia;
          }

          $resultados[] = [$pch->nombre_pch,$ppmedia,$qentrada,$qturbina,$potencia];
        }
        #return response()->json($pronosticos);
        return response()->json(['pronosticos'=>$pronosticos,'resultados'=>$resultados,'fecha'=>$fecha,'pchs'=>$pchs]);
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

      $estaciones = DB::select("select * from estaciones order by idestacion");
      return view('estaciones',['estaciones'=>$estaciones]);
    }
}
