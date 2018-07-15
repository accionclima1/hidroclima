<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Mensajes extends Model
{
    protected $table = 'mensajes';
    protected $primaryKey = 'id';
    public $timestamps = false;
}
