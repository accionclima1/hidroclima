<?php namespace App\Providers;

use View;
use DB;
use Auth;
use Illuminate\Support\ServiceProvider;

class ComposerServiceProvider extends ServiceProvider {
  public function boot()
  {
    View::composer('*',function($view)
    {
      $nivel = 0;
      
			if(Auth::check())
      {
        $user = Auth::user();
        if($user->id==1) $nivel = 1; else $nivel = 0;
      }

      $view->with('nivel', $nivel);
    });
  }

  public function register()
  {
    // TODO:
  }
}
?>