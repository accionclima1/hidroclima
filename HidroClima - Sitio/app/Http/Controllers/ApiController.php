<?php

namespace App\Http\Controllers;

#include("/home/hidroclima/aguaclima/aws/aws-autoloader.php");

use DB;
use URL;
use App\User;
use App\Estaciones;
use App\Mensajes;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Aws\Ses\SesClient;

class ApiController extends Controller
{
  public function getRadarImagesLastHour()
  {
    $result = DB::select("select * from radar_image_idx where fechahora > now() - Interval '7 hour'");
    return response()->json($result);
  }

  public function getEstacionesMedicion()
  {
    $result = DB::select("select * from estaciones where tipo = 'telemetrica'");
    return response()->json($result);
  }

  public function getPCHs()
  {
    $result = DB::select("select * from pchs order by idpch");
    return response()->json($result);
  }

  public function getParametrosTelemetricas()
  {
    $result = DB::select("select * from parametros_telemetricas order by idparametro");
    return response()->json($result);
  }

  public function getMedicionesPorEstacion(Request $request)
  {
    $result = null;
    if(isset($request->fecha1) && isset($request->fecha2))
    {
        $result = DB::select("select * from estacion_medicion where idparametro = ?
                              and idestacion = ? and fechahora >= ?
                              and fechahora <= ?",[$request->idparametro,$request->idestacion,$request->fecha1,$request->fecha2]);
    }
    if(isset($request->fecha))
    {
        $result = DB::select("select * from estacion_medicion where idparametro = ?
                              and idestacion = ? and fechahora >= ?
                              and fechahora <= ?",[$request->idparametro,$request->idestacion,$request->fecha . " 00:00",$request->fecha . " 23:59"]);
    }
    return response()->json($result);
  }

  public function getPronosticoPCH(Request $request)
  {
      $pchs = DB::select("select * from pchs where idpch = ?",[$request->idpch]);
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
                            where fecha = '" . $request->fecha . "' and a.idpch = " . $pch->idpch . "
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
                            where fecha = ? and a.idpch = ?
                            group by a.nombre_pch
                            order by a.nombre_pch",[$request->fecha,$pch->idpch]);

        $pronosticos[] = [$pch->nombre_pch,$pronostico_pch,$total_pch];
      }
      return response()->json($pronosticos);
  }

  public function getResultadosPCH(Request $request)
  {
      $pchs = DB::select("select * from pchs where idpch = ?",[$request->idpch]);

      foreach($pchs as $pch)
      {
        $valores = DB::select("select a.idpch, b.nombre_pch, a.tiempo,a.ppmedia, a.qentrada,
                                a.qexcedente, a.qcaptacion, a.qincremental, a.qtramo, a.qturbina, a.qsalida,
                                a.potencia, b.qecologico from
                          pchs_caudal_potencia a inner join pchs b on a.idpch = b.idpch
                          where a.fecha = ? and a.idpch = ?
                          order by a.idpch, b.nombre_pch, a.tiempo",[$request->fecha,$pch->idpch]);
        $ppmedia = null;
        $qentrada = null;
        $qexcedente = null;
        $qcaptacion = null;
        $qincremental = null;
        $qtramo = null;
        $qturbina = null;
        $potencia = null;
        $qsalida = null;
        $qecologico = null;

        foreach($valores as $row)
        {
          $ppmedia[] = $row->ppmedia;
          $qentrada[] = $row->qentrada;
          $qexcedente[] = $row->qexcedente;
          $qcaptacion[] = $row->qcaptacion;
          $qincremental[] = $row->qincremental;
          $qtramo[] = $row->qtramo;
          $qturbina[] = $row->qturbina;
          $qsalida[] = $row->qsalida;
          $potencia[] = $row->potencia;
          $qecologico[] = $row->qecologico;
        }

        $resultados[] = [$pch->nombre_pch,
                         $ppmedia,
                         $qentrada,
                         $qexcedente,
                         $qcaptacion,
                         $qincremental,
                         $qtramo,
                         $qturbina,
                         $qsalida,
                         $potencia,
                         $qecologico
                       ];
      }
      return response()->json($resultados);
  }

  public function validarUsuario(Request $request)
  {
    /*if (Auth::attempt(['email' => $request->email, 'password' => $request->clave])) {
        $user = Auth::user();
        if($user->validado==1)
          return response()->json($user);
        else
          return "0";
    } else return "0";*/
    $user = DB::select("select * from users where email = ?",[$request->email])[0];
    return response()->json($user);
  }

  public function validarUsuarioByPhone(Request $request)
  {
    $user = DB::select("select * from users where telefono = ?",[$request->telefono])[0];
    return response()->json($user);
  }
  
  public function getToken()
  {
     return csrf_token();
  }
  
  public function registrarUsuario(Request $request)
  {
     // validar :-)
     $token = csrf_token();
     $existente = DB::select("select * from users where email = ?", [$request->email]);
     
     if(count($existente)>0) return "FAIL: Existente.";
     
     $usuario = new User();
     $usuario->name = $request->nombre;
     $usuario->lastname = $request->apellido;
     $usuario->telefono = $request->telefono;
     $usuario->email = $request->email;
     $usuario->remember_token = $token;
     $usuario->rol = 2;
     $usuario->validado = 1;
     $usuario->gcmtoken = $request->token;
     $usuario->password = bcrypt($request->clave);
     $usuario->save();
     
     define('SENDER', 'centroclimaorg@gmail.com');
     define('RECIPIENT', $request->email);
     define('REGION','us-west-2'); 
     define('SUBJECT','Confirmacion de registro en Hidro Clima');
     define('BODY','
                  
                  <!DOCTYPE html>
                  <html>
                  <body>
                  
                  <div style="text-align:center;">
                  <img src="' . URL::to('/') . '/images/icon.png"></div>
                  
                  <br />
                  <h3>Confirmaci&oacute;n de usuario</h3>
                  
                  Para completar el proceso de registro debe verificar su correo haciendo clic en: <a href="' . URL::to('/') . '/verificarCorreo?token=' . $token . '">Verificar</a>.
                  </div>
                  </body>
                  </html>
                  ');
     
     $client = SesClient::factory(array(
          'version'=> 'latest',     
          'region' => REGION,
          'credentials' => [
              'key'    => 'AKIAJRXVEU3HNEWQRIHQ',
              'secret' => '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'
          ]
     ));

     $request = array();
     $request['Source'] = SENDER;
     $request['Destination']['ToAddresses'] = array(RECIPIENT);
     $request['Message']['Subject']['Data'] = SUBJECT;
     $request['Message']['Body']['Text']['Data'] = "";
     $request['Message']['Body']['Html']['Data'] = BODY;
     
     try {
         $result = $client->sendEmail($request);
         $messageId = $result->get('MessageId');
         // echo("Email sent! Message ID: $messageId"."\n");
    
     } catch (Exception $e) {
         // echo("The email was not sent. Error message: ");
         // echo($e->getMessage()."\n");
     }
 
     
     return "OK";
  }

  public function registrarUsuario2(Request $request)
  {
     // validar :-)
     $token = csrf_token();
     $existente = DB::select("select * from users where email = ?", [$request->email]);
     
     if(count($existente)>0) return "FAIL: Existente.";
     
     $usuario = new User();
     $usuario->name = $request->nombre;
     $usuario->lastname = $request->apellido;
     $usuario->telefono = $request->telefono;
     $usuario->email = $request->email;
     $usuario->remember_token = $token;
     $usuario->rol = 2;
     $usuario->validado = 1;
     $usuario->gcmtoken = $request->token;
     $usuario->password = bcrypt($request->clave);
     $usuario->save();
     
     /*define('SENDER', 'centroclimaorg@gmail.com');
     define('RECIPIENT', $request->email);
     define('REGION','us-west-2'); 
     define('SUBJECT','Confirmacion de registro en Hidro Clima');
     define('BODY','
                  
                  <!DOCTYPE html>
                  <html>
                  <body>
                  
                  <div style="text-align:center;">
                  <img src="' . URL::to('/') . '/images/icon.png"></div>
                  
                  <br />
                  <h3>Confirmaci&oacute;n de usuario</h3>
                  
                  Para completar el proceso de registro debe verificar su correo haciendo clic en: <a href="' . URL::to('/') . '/verificarCorreo?token=' . $token . '">Verificar</a>.
                  </div>
                  </body>
                  </html>
                  ');
     
     $client = SesClient::factory(array(
          'version'=> 'latest',     
          'region' => REGION,
          'credentials' => [
              'key'    => 'AKIAJRXVEU3HNEWQRIHQ',
              'secret' => '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'
          ]
     ));

     $request = array();
     $request['Source'] = SENDER;
     $request['Destination']['ToAddresses'] = array(RECIPIENT);
     $request['Message']['Subject']['Data'] = SUBJECT;
     $request['Message']['Body']['Text']['Data'] = "";
     $request['Message']['Body']['Html']['Data'] = BODY;
     
     try {
         $result = $client->sendEmail($request);
         $messageId = $result->get('MessageId');
         // echo("Email sent! Message ID: $messageId"."\n");
    
     } catch (Exception $e) {
         // echo("The email was not sent. Error message: ");
         // echo($e->getMessage()."\n");
     }*/
 
     
     return "OK";
  }
  
  public function verificarCorreo(Request $request)
  {
      $row = DB::select("select * from users where remember_token = ?",[$request->token]);
      if(count($row)>0)
      { 
        DB::update("update users set validado = 1, remember_token = '' where remember_token = ?",[$request->token]);
        return view('validado');
      } else return view('novalidado');
  }
  
  public function updateToken(Request $request)
  {
    $usuario = User::find($request->id);
    $usuario->gcmtoken = $request->token;
    $usuario->save();
    return "OK";
  }
  
  public function sendMessageToAdmin(Request $request)
  {
      $mensaje = new Mensajes();
      $mensaje->status = 0;
      $mensaje->mensaje = $request->mensaje;
      $mensaje->iddestinatario = 0;
      $mensaje->idremitente = $request->id;
      $mensaje->save();
      return "OK";
  }
  
  public function getMensajes(Request $request)
  {
     $mensajes = DB::select("select * from mensajes where iddestinatario = ? order by fechahora limit 25",[$request->id]);
     return response()->json($mensajes);
  }

  public function getSitiosNivelCaudal(){
    $sitios = DB::select("select * from puntos_nivel");
    return response()->json($sitios);
  }

  public function getMedicionesPuntoNivelCaudal(Request $request)
  {
    $mediciones = DB::select("select * from registro_nivelcaudal where puntoid = ? order by fechahora desc limit 20",[$request->sitioid]);
    return response()->json($mediciones);
  }

  public function registrarNivelCaudal(Request $request)
  {
      $sitios = DB::select("select * from puntos_nivel where puntoid = ?",[$request->sitioid]);
      $parametros = json_decode($sitios[0]->coeficientes);
      $caudal = $parametros[0] * pow($request->nivel,2) + $parametros[1] * $request->nivel + $parametros[2];
      DB::insert("insert into registro_nivelcaudal (fechahora,puntoid,caudal,nivel) values (?,?,?,?)",
      [date('Y-m-d H:i'),$request->sitioid,$caudal,$request->nivel]);
  }

}

?>
