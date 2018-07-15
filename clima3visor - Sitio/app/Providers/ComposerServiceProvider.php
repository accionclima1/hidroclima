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
        $layer_groups = DB::select("select distinct layergroup from clima3_layer_index where layerclass = 'linea_base' order by layergroup");
        $layers_lineabase = DB::select("select * from clima3_layer_index where layerclass = 'linea_base' order by layergroup");
        $view->with('layer_groups', $layer_groups);
        $view->with('layers_lineabase',$layers_lineabase);
    });
  }

  public function register()
  {
    // TODO:
  }
}