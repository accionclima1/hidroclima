<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Estaciones extends Model
{
    protected $table = 'estaciones';
    protected $primaryKey = 'idestacion';
    public $incrementing = false;
    public $timestamps = false;
}
