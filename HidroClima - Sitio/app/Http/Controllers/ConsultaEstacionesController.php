<?php

namespace App\Http\Controllers;

use DB;
use App\User;
use App\Mensajes;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ConsultaEstacionesController extends Controller
{
    public function __construct()
    {
      $this->middleware('auth');
    }

    public function consultas()
    {
        return view('consultaestaciones');
    }

}
