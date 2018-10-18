    @extends('layouts.admin')

    @section('extra_header_includes')
        <style>
            .btn-width
            {
                width: 170px;
            }
            #texto1 {
                padding-top:20px;
                padding-left:50px;
                padding-right:50px;
                text-align:justify;
            }
            #texto2 {
                padding-top:20px;
                padding-left:50px;
                padding-right:50px;
                text-align:justify;
            }
            #texto3 {
                padding-top:20px;
                padding-left:50px;
                padding-right:50px;
                text-align:justify;
            }
        </style>
        <script src="<?php echo asset('js/leaflet.js');?>"></script>
        <link href="<?php echo asset('css/leaflet.css') ?>" rel="stylesheet" />
        <script src="js/leaflet-providers.js"></script>
        <script src="js/catiline.js"></script>
        <script src="js/shp.js"></script>
        <script src="js/Leaflet.draw.js"></script>
        <script src="js/Leaflet.Draw.Event.js"></script>
        <link rel="stylesheet" href="js/leaflet.draw.css"/>
        <script src="js/leaflet.shpfile.js"></script>
        <script src="js/leaflet.wms.js"></script>

        <script src="js/Toolbar.js"></script>
        <script src="js/Tooltip.js"></script>

        <script src="js/ext/GeometryUtil.js"></script>
        <script src="js/ext/LatLngUtil.js"></script>
        <script src="js/ext/LineUtil.Intersect.js"></script>
        <script src="js/ext/Polygon.Intersect.js"></script>
        <script src="js/ext/Polyline.Intersect.js"></script>
        <script src="js/ext/TouchEvents.js"></script>

        <script src="js/draw/DrawToolbar.js"></script>
        <script src="js/draw/handler/Draw.Feature.js"></script>
        <script src="js/draw/handler/Draw.SimpleShape.js"></script>
        <script src="js/draw/handler/Draw.Polyline.js"></script>
        <script src="js/draw/handler/Draw.Circle.js"></script>
        <script src="js/draw/handler/Draw.Marker.js"></script>
        <script src="js/draw/handler/Draw.Polygon.js"></script>
        <script src="js/draw/handler/Draw.Rectangle.js"></script>

        <script src="js/edit/EditToolbar.js"></script>
        <script src="js/edit/handler/EditToolbar.Edit.js"></script>
        <script src="js/edit/handler/EditToolbar.Delete.js"></script>

        <script src="js/Control.Draw.js"></script>

        <script src="js/edit/handler/Edit.Poly.js"></script>
        <script src="js/edit/handler/Edit.SimpleShape.js"></script>
        <script src="js/edit/handler/Edit.Circle.js"></script>
        <script src="js/edit/handler/Edit.Rectangle.js"></script>
        <script src="js/edit/handler/Edit.Marker.js"></script> 
    @endsection

    @section('javascript_variables')
        var zoom = 5;
        var mymap = null;
        var drawingControl = null;
        var months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        var months_pronostico = null;
        var cLayer = null;
        var layer_list = null;
        var layer = null;
        var Esri_WorldImagery = null;
        var CartoDB_VoyagerOnlyLabels = null;
        var LayerGroup="";

        $(document).ready(function() {
          if($("#map").width()<=900) { zoom = 5; $("#mymap").height(440); }
          if($("#map").width()<=340) { zoom = 6; $("#mymap").height(340); }
          
          mymap = L.map("map").setView([15.3, -81.8], zoom);
          
          drawnItems = L.featureGroup().addTo(mymap);

          Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          });
        
          Esri_WorldImagery.addTo(mymap);

          CartoDB_VoyagerOnlyLabels = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
            subdomains: 'abcd',
            maxZoom: 19
          });

          CartoDB_VoyagerOnlyLabels.addTo(mymap);

          showMiembro(1);

          var downloaderCC = L.Control.Downloader = L.Control.extend({
            options: {
                position: 'topright'
            },
            onAdd: function(map) {
                var mc = L.DomUtil.create('div','Layer Download');
                var html="<select id='downloaderselect'>";
                    html+="<option value='image/geotiff'>GeoTiff</option>";
                    html+="<option value='application/vnd.google-earth.kml+xml'>KML</option>";
                    html+="<option value='image/png'>PNG</option>";
                    html+="</select>";
                    html+="<input type='button' value='Descargar' onclick='descargarLayer();'>";
                mc.innerHTML = html;
                return mc;
            },

            onRemove: function(map) {
                //
            }
          });
          mymap.addControl(new downloaderCC());
        });

        function descargarLayer()
        {
            if($('#downloaderselect').val()!='image/geotiff'){
                $.get("http://163.172.134.91/" + LayerGroup + "/wms?service=WMS&version=1.1.0&request=GetCapabilities",function(data){
                    var x2js = new X2JS();
                    var jsonData = x2js.xml2json(data);
                    console.log(jsonData);
                    var mbbox = "";
                    var srs = "";
                    var i = 0;
                    var CapLayers = jsonData.WMT_MS_Capabilities.Capability.Layer.Layer;
                    var url = "";
                    for(i=0;i < CapLayers.length;i++)
                    {
                        if(CapLayers[i].Name==layer)
                        {
                            srs = CapLayers[i].BoundingBox._SRS;
                            mbbox = CapLayers[i].BoundingBox._minx + "," + CapLayers[i].BoundingBox._miny + "," + CapLayers[i].BoundingBox._maxx + "," + CapLayers[i].BoundingBox._maxy;
                            url = "http://163.172.134.91/" + LayerGroup + "/wms?service=WMS&version=1.1.0&request=GetMap&layers=" + LayerGroup + ":";
                            url+= layer + "&styles=&bbox=" + mbbox + "&width=768&height=470&srs=" + srs + "&format=" + $('#downloaderselect').val();
                            window.open(url);
                        }
                    }
                    
                });
            } else {

                $.get("{{ URL::to('/') }}/getGeoTiff?file="+LayerGroup + ":" + layer + "&x=" + Math.random(),function(data){
                    window.open('http://163.172.134.91/'+data.strfile);
                    console.log(data);
                });
            }
            
        }

        function getLayerGroupByYear(layergroup,year)
        {
            $('#texto1').hide();
            $('#texto2').hide();
            $('#texto3').show();

            LayerGroup = "clima3base";

            $.post("{{ URL::to('/') }}/getLayersByLayerGroup",{layergroup:layergroup,year:year, _token:'{{ csrf_token() }}'},function(data){
                
                layer_list = data;
                
                $(".slider").show();
                $(".slider")
                    .slider({ 
                        min: 0, 
                        max: months.length-1, 
                        value: 0 
                    })
                    .slider("pips", {
                        rest: "label",
                        labels: months
                    })
                    .on("slidechange", function(e,ui) {
                        /*if(cLayer!=null){
                            cLayer.removeSubLayer(layer);
                            cLayer=null;
                        }*/

                        mymap.eachLayer(function (layer) {
                            try {
                                if(layer!=Esri_WorldImagery && layer!=CartoDB_VoyagerOnlyLabels) mymap.removeLayer(layer);
                            } catch(Err) {

                            }
                        });

                        var record = layer_list[ui.value];
                        
                        layer = record.layername.split(":")[1];
                        
                        var wmsOptions = {
                            crs: L.CRS.EPSG4326,
                            format:'image/png',
                            transparent:'true',
                            opacity:0.6
                        };
                                    
                        cLayer = L.WMS.source("http://163.172.134.91/clima3base/wms?", wmsOptions);
                            
                        cLayer.getLayer(layer).addTo(mymap);

                        $('#titulo').html("Mapa de lluvia acumulada " + layergroup + " mes de " + months[ui.value] + " " + year);
                    });
                
                /*if(cLayer!=null){
                    cLayer.removeSubLayer(layer);
                    cLayer=null;
                }*/

                mymap.eachLayer(function (layer) {
                    try {
                        if(layer!=Esri_WorldImagery && layer!=CartoDB_VoyagerOnlyLabels) mymap.removeLayer(layer);
                    } catch (Err) {

                    }
                });
                
                var record = layer_list[0];
                layer = record.layername;
                var layer_name_parts = layer.split('_');
                layer = record.layername.split(":")[1];

                var wmsOptions = {
                    crs: L.CRS.EPSG4326,
                    format:'image/png',
                    transparent:'true',
                    opacity:0.6
                };

                cLayer = L.WMS.source("http://163.172.134.91/clima3base/wms?", wmsOptions);
                            
                cLayer.getLayer(layer).addTo(mymap);  

                $('#titulo').html("Mapa de lluvia acumulada " + layergroup + " mes de " + months[0] + " " + year);
            });
            return false;
        }

        function showMiembro(miembro)
        {
            $('#texto1').show();
            $('#texto2').show();
            $('#texto3').hide();
            
            LayerGroup = "c3pronostico";

            if(miembro==1)
            {
                $.post('{{ URL::to('/') }}/getLayersMiembro',{miembro:miembro, _token:'{{ csrf_token() }}'},function(data){
                    var i = 0;
                    months_pronostico = new Array();
                    layer_list = data;
                    for(i=0; i < data.length; i++)
                    {
                        var record = layer_list[i];
                        layer = record.layername;
                        var layer_name_parts = layer.split('_');
                        layer = record.layername.split(":")[1];
                        months_pronostico.push(months[layer_name_parts[2]*1]);
                    }
                    $(".slider").show();
                    $(".slider")
                        .slider({ 
                            min: 0, 
                            max: months_pronostico.length-1, 
                            value: 0 
                        })
                        .slider("pips", {
                            rest: "label",
                            labels: months_pronostico
                        })
                        .on("slidechange", function(e,ui) {
                            /*if(cLayer!=null){
                                cLayer.removeSubLayer(layer);
                                cLayer=null;
                            }*/

                            mymap.eachLayer(function (layer) {
                                try {
                                    if(layer!=Esri_WorldImagery && layer!=CartoDB_VoyagerOnlyLabels) mymap.removeLayer(layer);
                                } catch (Err) {

                                }
                            });

                            var record = layer_list[ui.value];
                            layer = record.layername.split(":")[1];
                            
                            var wmsOptions = {
                                crs: L.CRS.EPSG4326,
                                format:'image/png',
                                transparent:'true',
                                opacity:0.6
                            };
                                
                            cLayer = L.WMS.source("http://163.172.134.91/c3pronostico/wms?", wmsOptions);
                            
                            cLayer.getLayer(layer).addTo(mymap);

                            $('#titulo').html("Mapa de lluvia acumulada miembro " + miembro + " mes de " + months_pronostico[ui.value] + " " + (new Date()).getFullYear());
                        });

                    /*if(cLayer!=null){
                        cLayer.removeSubLayer(layer);
                        cLayer=null;
                    }*/

                    mymap.eachLayer(function (layer) {
                        try {
                            if(layer!=Esri_WorldImagery && layer!=CartoDB_VoyagerOnlyLabels) mymap.removeLayer(layer);
                        } catch(Err) {
                            
                        }
                    });
                    
                    var record = layer_list[0];
                    layer = record.layername;
                    layer = record.layername.split(":")[1];

                    var wmsOptions = {
                        crs: L.CRS.EPSG4326,
                        format:'image/png',
                        transparent:'true',
                        opacity:0.6
                    };
                            
                    cLayer = L.WMS.source("http://163.172.134.91/c3pronostico/wms?", wmsOptions);
                            
                    cLayer.getLayer(layer).addTo(mymap);

                    console.log(layer);

                    $('#titulo').html("Mapa de lluvia acumulada miembro " + miembro + " mes de " + months_pronostico[0] + " " + (new Date()).getFullYear());
                });
            }
            else
            {
                $(".slider").hide();
                $.post('{{ URL::to('/') }}/getLayersMiembro',{miembro:miembro, _token:'{{ csrf_token() }}'},function(data){
                    /*if(cLayer!=null){
                        cLayer.removeSubLayer(layer);
                        cLayer=null;
                    }*/
                    mymap.eachLayer(function (layer) {
                        try{
                            if(layer!=Esri_WorldImagery && layer!=CartoDB_VoyagerOnlyLabels) mymap.removeLayer(layer);
                        } catch (Err) {

                        }
                    });
                    months_pronostico = new Array();
                    layer_list = data;
                    console.log(layer_list);
                    var record = layer_list[0];
                    layer = record.layername;
                    var layer_name_parts = layer.split('_');
                    layer = record.layername.split(":")[1];
                    console.log(layer_name_parts);
                    months_pronostico.push(months[layer_name_parts[2]*1]);

                   var wmsOptions = {
                        crs: L.CRS.EPSG4326,
                        format:'image/png',
                        transparent:'true',
                        opacity:0.6
                    };
                            
                    cLayer = L.WMS.source("http://163.172.134.91/c3pronostico/wms?", wmsOptions);
                            
                    cLayer.getLayer(layer).addTo(mymap);

                    $('#titulo').html("Mapa de lluvia acumulada miembro " + miembro + " mes de " + months_pronostico[0] + " " + (new Date()).getFullYear());
                });
            }
            return false;
        }
    @endsection

    @section('main_content')
        <div class="row">
            
            <div class="col-lg-12 center">
                <div id="texto1">
                El pron&oacute;stico del miembro 1 contiene un m&aacute;ximo de 3 meses de pron&oacute;stico, deslice la barra de tiempo de arriba para navegar entre los meses de pron&oacute;stico num&eacute;rico.
                Controle el acercamiento del mapa mediante los controles +/- o con la rueda del ratón para alejarse o acercarse a la zona de su inter&eacute;s. Puede descargar la capa de su inter&eacute;s en formato raster presione el botón de descarga en la esquina superior derecha.
                </div>
                <h4 class="page-header"><span id="titulo">Titulo del mapa</span></h4>
            </div>
        </div>
        <div class="row">
            <div class="col-lg-12">
                <div id="map"></div>
            </div>
        </div>
        <br>
        <div class="row">
            <div class="col-lg-2"></div>
            <div class="col-lg-8">
                <div class="slider"></div>
            </div>
            <div class="col-lg-2"></div>
        </div>
        <br>
        <div class="row">
            <div class="col-lg-2"></div>
            <div class="col-lg-8" style="text-align:center;">
                Escala: <img src="{{ URL::to('/') }}/img/escala.png" alt="Escala" style="margin:auto;"/> (mm)
            </div>
            <div class="col-lg-2"></div>
        </div>
        <div class="row">
            <div class="col-lg-12">
                <div id="texto2">
                    En el mapa se muestran los acumulados mensuales correspondientes a la salida del modelo WRF del sistema Clima 3, el acumulado mensual es preparado en base a pasos de tiempo de cada 3 horas que van desde el d&iacute;a 1 del mes de la simulaci&oacute;n hasta el &uacute;ltimo d&iacute;a del mes. Las  unidades de medida de la precipitaci&oacute;n son mil&iacute;metros.
                </div>
                <div id="texto3">
                    La l&iacute;nea base comprende 5 a&ntide;os de simulaci&oacute;n retrospectiva utilizando datos de re analisis y el sistema Clima 3, las simulaciones van desde el a&ntilde;o 2012 hasta el 2016, se prepararon acumulados mensuales para todo el per&iacute;odo simulado. Para medir la desviaci&oacute;n del modelo se usaron datos de hidroestimador global e hidro estimador global mejorado (CHIRP y <a href="http://chg.geog.ucsb.edu/data/chirps/">CHIRPS</a> respectivamente).

                    Con la desviaci&oacute;n promedio mensual podr&aacute; aplicar un ajuste estad&iacute;stico a cada salida de pron&oacute;stico del sistema Clima 3, este procedimiento reduce el error del resultado determinista del modelo en la mayor&iacute;a de los casos.

                    Mas informaci&oacute;n sobre la l&iacute;nea base en este <a href="http://blog.centroclima.org/index.php/2018/07/16/lanzamiento-de-linea-base-de-5-anos-de-2012-a-2016/">enlace</a>.
                </div>
            </div>
        </div>
        <br />   
    @endsection

    @section('dialogs')

    @endsection

    @section('js_includes')

    @endsection
