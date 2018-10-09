<?php
namespace App\Http\Controllers;

use DB;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class MainController extends Controller
{
    public function getLayersMiembro(Request $request)
    {
        //return "select * from clima3_layer_index where layerclass='c3pronostico' and layergroup like '" . $request->miembro . "%'";
        $layers = DB::select("select * from clima3_layer_index where layerclass='c3pronostico' and layergroup like 'm" . $request->miembro . "%'");
        return response()->json($layers);
    }

    public function getLayersByLayerGroup(Request $request)
    {
        if(!($request->layergroup=='DESVIACIONES_CHIRPS_PROMEDIO' || $request->layergroup=='DESVIACIONES_CHIRP_PROMEDIO')) {
            $layers = DB::select("SELECT layerindex, layerclass, layergroup, layername, layertitle, filepath, createdate
            FROM public.clima3_layer_index where layerclass='linea_base' and layergroup='" . $request->layergroup . "' and layername like '%" . $request->year . "%'");
        } else {
            $layers = DB::select("SELECT layerindex, layerclass, layergroup, layername, layertitle, filepath, createdate
            FROM public.clima3_layer_index where layerclass='linea_base' and layergroup='" . $request->layergroup . "'");
        }
        return response()->json($layers);
    }

    public function getGeoTiff(Request $request){
        $strfile = DB::select("select filepath from clima3_layer_index where layername = ?",[$request->file])[0]->filepath;
        $strfile = str_replace("file://","",$strfile);
        $strfile = str_replace("/home/geoserver/clima3/","",$strfile);
        return response()->json([ 'strfile' => $strfile ]);
    }
}

?>