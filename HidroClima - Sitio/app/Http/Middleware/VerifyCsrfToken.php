<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as BaseVerifier;

class VerifyCsrfToken extends BaseVerifier
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array
     */
    protected $except = [
        'validarUsuario','registrarUsuario','updateToken','sendMessageToAdmin','validarUsuarioByPhone','registrarUsuario2',
        'getMedicionesPuntoNivelCaudal','registrarNivelCaudal'
    ];
}
