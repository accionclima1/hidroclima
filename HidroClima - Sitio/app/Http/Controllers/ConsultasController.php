<?php

namespace App\Http\Controllers;

use DB;
use App\User;
use App\Mensajes;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ConsultasController extends Controller
{
    public function __construct()
    {
      $this->middleware('auth');
    }

    public function consultas()
    {
        $mensajes = DB::select("select * from mensajes  where iddestinatario = 0 order by fechahora desc limit 25");
        $destinatarios = DB::select("select * from users where rol = 2 order by id");
        return view('consultas',['mensajes'=>$mensajes,'destinatarios'=>$destinatarios]);
    }

    public function enviarMensaje(Request $request)
    {
      if($request->accion=="nuevo")
      {
        $mensaje = new Mensajes();
        $mensaje->status = 0;
        $mensaje->mensaje = $request->mensaje;
        $mensaje->idremitente = 0;
        $mensaje->iddestinatario = $request->destinatario;
        $mensaje->save();
        
        $usuario = DB::select("select * from users where id = ?",[$request->destinatario]);
        #return $usuario[0]->gcmtoken;
        $url = 'https://fcm.googleapis.com/fcm/send';

        $fields = array (
                'to' => $usuario[0]->gcmtoken,
                'notification' => array (
                        "title" => "MENSAJE HIDROCLIMA",
                        "text" => $request->mensaje
                )
        );
        $fields = json_encode ( $fields );
    
        $headers = array (
                'Authorization: key=' . "AAAAI9DHBSE:APA91bE26JY-P8OP9IZ-zlRHbFbllEIOjykBhj8vlaxHVEsLCfombrQ7yfdWcLa3-6-Z1eFIq2vCyUrAZJwQ7CqTQGGhmKBQfRlnBralKIWXahngSDCN5dQFlJ1cAW5VUv_aHM8KOOQ4",
                'Content-Type: application/json'
        );
    
        $ch = curl_init ();
        curl_setopt ( $ch, CURLOPT_URL, $url );
        curl_setopt ( $ch, CURLOPT_POST, true );
        curl_setopt ( $ch, CURLOPT_HTTPHEADER, $headers );
        curl_setopt ( $ch, CURLOPT_RETURNTRANSFER, true );
        curl_setopt ( $ch, CURLOPT_POSTFIELDS, $fields );
        curl_setopt ( $ch, CURLOPT_SSL_VERIFYPEER, false);
    
        $result = curl_exec ( $ch );
        
        if(curl_errno($ch))
        {
            return 'Curl error: ' . curl_error($ch);
        }
        
        return response()->json($result);
        
        curl_close ( $ch );
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

      $mensajes = DB::select("select * from mensajes  where iddestinatario = 0 order by fechahora desc limit 25");
      $destinatarios = DB::select("select * from users where rol = 2 order by id");
      return view('consultas',['mensajes'=>$mensajes,'destinatarios'=>$destinatarios]);
    }
}
