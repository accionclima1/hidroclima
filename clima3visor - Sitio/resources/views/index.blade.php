    @extends('layouts.admin')

    @section('extra_header_includes')
        <style>
            .btn-width
            {
                width: 170px;
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

        $(document).ready(function() {
          if($("#map").width()<=900) { zoom = 5; $("#mymap").height(440); }
          if($("#map").width()<=340) { zoom = 6; $("#mymap").height(340); }
          
          mymap = L.map("map").setView([15.3, -81.8], zoom);
          
          drawnItems = L.featureGroup().addTo(mymap);
          
          var Esri_OceanBasemap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
                maxZoom: 13
          });
          
          Esri_OceanBasemap.addTo(mymap);

          /*var OpenMapSurfer_Roads = L.tileLayer('https://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}', {
            maxZoom: 20,
            attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          });

          OpenMapSurfer_Roads.addTo(mymap);*/

          /*var wmsOptions = {
              crs: L.CRS.EPSG4326,
              layers:'m1_mes1_7',
              format:'image/png',
              transparent:'true'
          };
          
          var cLayer = L.tileLayer.wms('http://163.172.134.91/c3pronostico/wms?', wmsOptions);
          
          wmsLayer.addTo(mymap);*/

          /*L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
	            maxZoom: 18,
	            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }).addTo(mymap);*/

          /*$(".slider")
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
                        //$("#labels-months-output").text( "You selected " + months[ui.value] + " (" + ui.value + ")");
                    });*/

            showMiembro(1);
        });

        function getLayerGroupByYear(layergroup,year)
        {
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
                        if(cLayer!=null){
                            cLayer.removeSubLayer(layer);
                            cLayer=null;
                        }

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
                
                if(cLayer!=null){
                    cLayer.removeSubLayer(layer);
                    cLayer=null;
                }
                
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
            if(miembro==1)
            {
                $.post('{{ URL::to('/') }}/getLayersMiembro',{miembro:miembro, _token:'{{ csrf_token() }}'},function(data){
                    var i = 0;
                    months_pronostico = new Array();
                    layer_list = data;
                    for(i=0;i<data.length;i++)
                    {
                        var record = layer_list[i];
                        var layer = record.layername;
                        var layer_name_parts = layer.split('_');
                        layer = record.layername.split(":")[1];
                        console.log(layer_name_parts);
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
                            if(cLayer!=null){
                                cLayer.removeSubLayer(layer);
                                cLayer=null;
                            }

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

                    if(cLayer!=null){
                        cLayer.removeSubLayer(layer);
                        cLayer=null;
                    }
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

                    $('#titulo').html("Mapa de lluvia acumulada miembro " + miembro + " mes de " + months_pronostico[0] + " " + (new Date()).getFullYear());
                });
            }
            else
            {
                $(".slider").hide();
                $.post('{{ URL::to('/') }}/getLayersMiembro',{miembro:miembro, _token:'{{ csrf_token() }}'},function(data){
                    if(cLayer!=null){
                        cLayer.removeSubLayer(layer);
                        cLayer=null;
                    }
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
            <div class="col-lg-12 center"><h4 class="page-header"><span id="titulo">Titulo del mapa</span></h4></div>
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
    @endsection

    @section('dialogs')

    @endsection

    @section('js_includes')

    @endsection
