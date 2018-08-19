<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class PuntosNivel extends Model
{
    protected $table = 'puntos_nivel';
    protected $primaryKey = 'puntoid';
    // public $incrementing = false;
    public $timestamps = false;
}
