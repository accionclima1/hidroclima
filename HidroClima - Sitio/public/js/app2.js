var map = null;
var pronostico = null;
var x = null;
function initMap() {
    var center = [13.77, -89.743537];
    var zoom = 12;
    map = L.map("map").setView(center, zoom);

    L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
	       maxZoom: 18,
	       attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    /*map = new google.maps.Map(document.getElementById('map'), {
       center: {lat: 13.80, lng: -89.743537},
       zoom: 12,
       gestureHandling: 'none'
    });*/

    getMapPCHs();
}
     
     function getMapPCHs(){
         console.log("Eliseo");
         $.ajax({
				    url: URL + "/getPCHs",
				    cache: false,
				    crossDomain: true
			   }).done(function(data){
			        var i = 0;
                    console.log(data);
			        for(i = 0; i < data.length; i++)
			        {
			           createPCHMarker(data[i]);
			        }
			   });
     }
     
     function createPCHMarker(pchi)
     {
        var pch = [pchi.latitud * 1, pchi.longitud * 1];
        
        var myIcon = L.icon({
            iconUrl: URL + '/images/marker.png'
        });
        
        var marker = L.marker(pch,{title:pchi.nombre_pch,icon:myIcon}).addTo(map);
        
        if(pchi.nombre_pch == 'PAPALOATE DE NAHUIZALCO I') {
            marker.bindTooltip(pchi.nombre_pch,{permanent:true}).openTooltip();
        } else {
            marker.bindTooltip(pchi.nombre_pch,{permanent:true,direction:'right',offset:L.point(20,20)}).openTooltip(); 
        }

        /*var markerPCH = new MarkerWithLabel({
                 position: pch,
                 draggable: false,
                 raiseOnDrag: false,
                 map: map,
                 icon: URL + '/images/marker.png',
                 labelContent: pchi.nombre_pch,
                 labelAnchor: (pchi.nombre_pch == 'PAPALOATE DE NAHUIZALCO I') ? new google.maps.Point(90, 0) : new google.maps.Point(90,40),
                 labelClass: "labels",
                 labelStyle: {opacity: 0.75}
        });
        
        var o = pchi.idpch + "";
        google.maps.event.addListener(markerPCH,"click", function (e) { 
          $("#pch").val(o);
		  getData();  
        });*/
     }
     
     function round(value, exp) {
        if (typeof exp === 'undefined' || +exp === 0)
          return Math.round(value);
    
        value = +value;
        exp = +exp;
    
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
          return NaN;
    
        // Shift
        value = value.toString().split('e');
        value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));
    
        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
     }
     
     function getData()
     {
        $.post(URL + "/getResultsByPCH",{idpch:$("#pch").val(),_token:TOKEN,fecha:$("#fecha").val()},function(data){
            console.log(data);
            x = data;
            var i = 0;
            var pronosticos = data.pronosticos[0];
            var html = "";
            html += "<table class=\"table table-striped table-bordered\">\n";
            html += "<thead>\n";
            html += "<tr>\n";
            html += "<th rowspan=\"2\">Estaci&oacute;n</th>\n";
            html += "<th colspan=\"3\">Precipitaci&oacute;n</th>\n";
            html += "<th colspan=\"3\">Caudal bruto</th>\n";
            html += "</tr>\n";
            html += "<tr>\n";
            html += "<th>24H</th>\n";
            html += "  <th>48H</th>\n";
            html += "  <th>72H</th>\n";
            html += "  <th>24H</th>\n";
            html += "  <th>48H</th>\n";
            html += "  <th>72H</th>\n";
            html += "</tr>\n";
            html += "</thead>\n";
            html += "<tbody>\n";
            html += "<tr>\n";
            html += "<td colspan=\"7\">" + pronosticos[0] + "</td>\n";
            for(i=0;i<pronosticos[1].length;i++)
            {
            	html += "    </tr>\n";
            	html += "      <tr>\n";
            	html += "        <td>" + pronosticos[1][i].nombre_estacion + "</td>\n";
           		html += "        <td>" + pronosticos[1][i].p24h + "</td>\n";
            	html += "        <td>" + pronosticos[1][i].p48h + "</td>\n";
            	html += "        <td>" + pronosticos[1][i].p72h + "</td>\n";
            	html += "        <td>" + round(pronosticos[1][i].qb24h,3) + "</td>\n";
           		html += "        <td>" + round(pronosticos[1][i].qb48h,3) + "</td>\n";
            	html += "        <td>" + round(pronosticos[1][i].qb72h,3) + "</td>\n";
            	html += "      </tr>\n";
            }
            html += "    <tr>\n";
            html += "      <td><strong>Totales</strong></td>\n";
            html += "      <td>" + round(pronosticos[2][0].pm24h,2) + "</td>\n";
            html += "      <td>" + round(pronosticos[2][0].pm48h,2) + "</td>\n";
            html += "      <td>" + round(pronosticos[2][0].pm72h,2) + "</td>\n";
            html += "      <td>" + round(pronosticos[2][0].qb24h,3) + "</td>\n";
            html += "      <td>" + round(pronosticos[2][0].qb48h,3) + "</td>\n";
            html += "      <td>" + round(pronosticos[2][0].qb72h,3) + "</td>\n";
            html += "    </tr>\n";
            html += "</tbody>\n";
            html += "<tfoot>\n";
            html += "  <tr>\n";
            html += "    <th>Estaci&oacute;n</th>\n";
            html += "    <th>24H</th>\n";
            html += "    <th>48H</th>\n";
            html += "    <th>72H</th>\n";
            html += "    <th>24H</th>\n";
            html += "    <th>48H</th>\n";
            html += "    <th>72H</th>\n";
            html += "  </tr>\n";
            html += "</tfoot>\n";
            html += "</table>\n";
            $("#resultados").html(html);
            
            html = "";
            html += "<table class=\"table table-striped table-bordered\">\n";
            html += "<thead>\n";
            html += "<tr>\n";
            html += "  <th>Resultados del pron&oacute;stico</th>\n";
            html += "  <th>24H</th>\n";
            html += "  <th>48H</th>\n";
            html += "  <th>72H</th>\n";
            html += "</tr>\n";
            html += "</thead>\n";
            html += "<tbody>\n";
            
            var resultados = data.resultados[0];

            var row = resultados;
            
            for(i=0;i<row.length;i++)
            {
              if(i==0)
              {
                html += "<tr><td colspan=\"4\"><h4>" + row[0] + "</h4></td></tr>\n";
              }
              if(i==1)
              {
                html += "<tr>\n";
                html += "  <td>Precipitaci&oacute;n media</td>\n";
                html += "  <td>" + row[1][0] + "</td>\n";
                html += "  <td>" + row[1][1] + "</td>\n";
                html += "  <td>" + row[1][2] + "</td>\n";
                html += "</tr>\n";
              }
              if(i==2)
              {
                html += "<tr>\n";
                html += "  <td>Escorrent&iacute;a dique</td>\n";
                html += "  <td>" + row[2][0] + "</td>\n";
                html += "  <td>" + row[2][1] + "</td>\n";
                html += "  <td>" + row[2][2] + "</td>\n";
                html += "</tr>\n";
              }
              if(i==3)
              {
                html += "<tr>\n";
                html += "  <td>Caudal turbinado</td>\n";
                html += "  <td>" + row[3][0] + "</td>\n";
                html += "  <td>" + row[3][1] + "</td>\n";
                html += "  <td>" + row[3][2] + "</td>\n";
                html += "</tr>\n";
              }
              if(i==4)
              {
                html += "<tr>\n";
                html += "  <td>Potencia estimada</td>\n";
                html += "  <td>" + row[4][0] + "</td>\n";
                html += "  <td>" + row[4][1] + "</td>\n";
                html += "  <td>" + row[4][2] + "</td>\n";
                html += "</tr>\n";
              }
            }
            html += "</tbody>\n";
            html += "<tfoot>\n";
            html += "<tr>\n";
            html += "  <th>Resultados del pronostico</th>\n";
            html += "  <th>24H</th>\n";
            html += "  <th>48H</th>\n";
            html += "  <th>72H</th>\n";
            html += "</tr>\n";
            html += "</tfoot>\n";
            html += "</table>\n";
            
            $("#potencia_tabla").html(html);
        });
        
        updateData();
     }
     
     function setHrs(i)
     {
        $('#qentrada').html(pronostico[0][2][i]);
    		$('#qcaptacion').html(pronostico[0][4][i]);
    		$('#qecologico').html(pronostico[0][10][i]);
    		$('#qturbina').html(pronostico[0][7][i]);
    		$('#qexcedente').html(pronostico[0][3][i]);
    		$('#qincremental').html(pronostico[0][5][i]);
    		$('#qsalida').html(pronostico[0][8][i]);
    		$('#qtramo').html(pronostico[0][6][i]);
    		$('#potencia').html("Potencia: " + pronostico[0][9][i]);
    		$('#tab' + i).tab('show');
    		return false;
     }
        
		 function updateData()
     {
          $.ajax({
    				url: URL + "/getResultadosPCH",
    				cache: false,
    				crossDomain: true,
    				data: {"idpch":$('#pch').val(),"fecha":$('#fecha').val(),_token:TOKEN}
    			}).done(function(data){
    			    pronostico = data;
    			    $('#qentrada').html(data[0][2][0]);
    			    $('#qcaptacion').html(data[0][4][0]);
    			    $('#qecologico').html(data[0][10][0]);
    			    $('#qturbina').html(data[0][7][0]);
    			    $('#qexcedente').html(data[0][3][0]);
    			    $('#qincremental').html(data[0][5][0]);
    			    $('#qsalida').html(data[0][8][0]);
    			    $('#qtramo').html(data[0][6][0]);
    			    $('#potencia').html("<strong>Potencia aproximada:</strong> " + data[0][9][0]);

    			    $('#ppm24h').html(data[0][1][0]);
    			    $('#ppm48h').html(data[0][1][1]);
    			    $('#ppm72h').html(data[0][1][2]);

    			    $('#escorrentia24h').html(data[0][2][0]);
    			    $('#escorrentia48h').html(data[0][2][1]);
    			    $('#escorrentia72h').html(data[0][2][2]);

    			    $('#qturbina24h').html(data[0][7][0]);
    			    $('#qturbina48h').html(data[0][7][1]);
    			    $('#qturbina72h').html(data[0][7][2]);

    			    $('#potencia24h').html(data[0][9][0]);
    			    $('#potencia48h').html(data[0][9][1]);
    			    $('#potencia72h').html(data[0][9][2]);
    			});
     }
     
jsPlumb.ready(function () {

    var instance = window.jsp = jsPlumb.getInstance({
        // default drag options
        DragOptions: { cursor: 'pointer', zIndex: 2000 },
        // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
        // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
        ConnectionOverlays: [
            [ "Arrow", {
                location: 1,
                visible:true,
                width:11,
                length:11,
                id:"ARROW",
                events:{
                    click:function() { alert("you clicked on the arrow overlay")}
                }
            } ]
        ],
        Container: "canvas"
    });

    var basicType = {
        connector: "StateMachine",
        paintStyle: { stroke: "red", strokeWidth: 4 },
        hoverPaintStyle: { stroke: "blue" },
        overlays: [
            "Arrow"
        ]
    };
    instance.registerConnectionType("basic", basicType);

    // this is the paint style for the connecting lines..
    var connectorPaintStyle = {
            strokeWidth: 2,
            stroke: "#61B7CF",
            joinstyle: "round",
            outlineStroke: "white",
            outlineWidth: 2
        },
    // .. and this is the hover style.
        connectorHoverStyle = {
            strokeWidth: 3,
            stroke: "#216477",
            outlineWidth: 5,
            outlineStroke: "white"
        },
        endpointHoverStyle = {
            fill: "#216477",
            stroke: "#216477"
        },
    // the definition of source endpoints (the small blue ones)
        sourceEndpoint = {
            endpoint: "Dot",
            paintStyle: {
                stroke: "#7AB02C",
                fill: "transparent",
                radius: 7,
                strokeWidth: 1
            },
            isSource: true,
            connector: [ "Flowchart", { stub: [10, 10], gap: 5, cornerRadius: 0, alwaysRespectStubs: false } ],
            connectorStyle: connectorPaintStyle,
            hoverPaintStyle: endpointHoverStyle,
            connectorHoverStyle: connectorHoverStyle,
            dragOptions: {},
        },
    // the definition of target endpoints (will appear when the user drags a connection)
        targetEndpoint = {
            endpoint: "Dot",
            paintStyle: { fill: "#7AB02C", radius: 7 },
            hoverPaintStyle: endpointHoverStyle,
            maxConnections: -1,
            dropOptions: { hoverClass: "hover", activeClass: "active" },
            isTarget: true,
            /*overlays: [
                [ "Label", { location: [0.5, -0.5], label: "Drop", cssClass: "endpointTargetLabel", visible:false } ]
            ]*/
        },
        init = function (connection) {
            //connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
        };

    var _addEndpoints = function (toId, sourceAnchors, targetAnchors) {
        for (var i = 0; i < sourceAnchors.length; i++) {
            var sourceUUID = toId + sourceAnchors[i];
            var ep = instance.addEndpoint("flowchart" + toId, sourceEndpoint, {
                anchor: sourceAnchors[i], uuid: sourceUUID
            });
            ep.setEnabled(false);
        }
        for (var j = 0; j < targetAnchors.length; j++) {
            var targetUUID = toId + targetAnchors[j];
            var ep = instance.addEndpoint("flowchart" + toId, targetEndpoint, { anchor: targetAnchors[j], uuid: targetUUID });
            ep.setEnabled(false);
        }
    };

    // suspend drawing and initialise.
    instance.batch(function () {

    _addEndpoints("Window8", [], ["TopCenter", "RightMiddle","LeftMiddle"]);
		_addEndpoints("Window7", [], ["TopCenter", "RightMiddle"]);
		_addEndpoints("Window6", [], ["BottomCenter"]);
		_addEndpoints("Window5", [], ["LeftMiddle", "RightMiddle"]);
		_addEndpoints("Window4", [], ["TopCenter", "BottomCenter"]);
        _addEndpoints("Window2", [], ["TopCenter", "BottomCenter"]);
        _addEndpoints("Window3", [], ["RightMiddle", "TopCenter"]);
        _addEndpoints("Window1", [], ["LeftMiddle", "RightMiddle", "BottomCenter"]);

        // listen for new connections; initialise them the same way we initialise the connections at startup.
        instance.bind("connection", function (connInfo, originalEvent) {
            init(connInfo.connection);
        });

        // connect a few up
        instance.connect({uuids: ["Window1LeftMiddle", "Window2TopCenter"], enabled:false, editable: false, connector: [ "Flowchart", { stub: [10, 10], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ]});
        instance.connect({uuids: ["Window1BottomCenter", "Window5LeftMiddle"], enabled:false, editable: false, connector: [ "Flowchart", { stub: [10, 10], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ]});
        instance.connect({uuids: ["Window1RightMiddle", "Window3TopCenter"], enabled:false, editable: false, connector: [ "Flowchart", { stub: [10, 10], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ]});
        instance.connect({uuids: ["Window2BottomCenter", "Window4TopCenter"], enabled:false, editable: false, connector: [ "Flowchart", { stub: [10, 10], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ]});
        instance.connect({uuids: ["Window4BottomCenter", "Window1TopCenter"], enabled:false, editable: false,  connector: [ "Flowchart", { stub: [10, 10], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ]});
        instance.connect({uuids: ["Window3BottomCenter", "Window1BottomCenter"], enabled:false, editable: false, connector: [ "Flowchart", { stub: [10, 10], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ]});
        instance.connect({uuids: ["Window3RightMiddle", "Window8RightMiddle"], enabled:false, editable: false, connector: [ "Flowchart", { stub: [15, 15], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ]});
        instance.connect({uuids: ["Window5RightMiddle", "Window8RightMiddle"], enabled:false, editable: false, connector: [ "Flowchart", { stub: [15, 15], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ]});
        instance.connect({uuids: ["Window6BottomCenter", "Window8TopCenter"], enabled:false, editable: false, connector: [ "Flowchart", { stub: [15, 15], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ]});
        instance.connect({uuids: ["Window8LeftMiddle", "Window7RightMiddle"], enabled:false, editable: false, connector: [ "Flowchart", { stub: [15, 15], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ]});
        instance.connect({uuids: ["Window4BottomCenter", "Window7TopCenter"], enabled:false, editable: false, connector: [ "Flowchart", { stub: [15, 15], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ]});
        //

    });

    jsPlumb.fire("jsPlumbDemoLoaded", instance);
          $("#pch").val(idpch);
					$.ajax({
    				url: URL + "/getResultadosPCH",
    				cache: false,
    				crossDomain: true,
    				data: {"idpch":idpch,"fecha":today}
    			}).done(function(data){
    			    pronostico = data;
    			    $('#qentrada').html(data[0][2][0]);
    			    $('#qcaptacion').html(data[0][4][0]);
    			    $('#qecologico').html(data[0][10][0]);
    			    $('#qturbina').html(data[0][7][0]);
    			    $('#qexcedente').html(data[0][3][0]);
    			    $('#qincremental').html(data[0][5][0]);
    			    $('#qsalida').html(data[0][8][0]);
    			    $('#qtramo').html(data[0][6][0]);
    			    $('#potencia').html("<strong>Potencia aproximada:</strong> " + data[0][9][0]);

    			    $('#ppm24h').html(data[0][1][0]);
    			    $('#ppm48h').html(data[0][1][1]);
    			    $('#ppm72h').html(data[0][1][2]);

    			    $('#escorrentia24h').html(data[0][2][0]);
    			    $('#escorrentia48h').html(data[0][2][1]);
    			    $('#escorrentia72h').html(data[0][2][2]);

    			    $('#qturbina24h').html(data[0][7][0]);
    			    $('#qturbina48h').html(data[0][7][1]);
    			    $('#qturbina72h').html(data[0][7][2]);

    			    $('#potencia24h').html(data[0][9][0]);
    			    $('#potencia48h').html(data[0][9][1]);
    			    $('#potencia72h').html(data[0][9][2]);
    			});
    			$( "#fecha" ).datepicker();
    			$( "#fecha" ).datepicker( "option", "dateFormat", "yy-mm-dd");
    			$( "#fecha" ).val(today.substring(0,10));
    			initMap();
});