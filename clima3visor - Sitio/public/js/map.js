    var map = null;
	  var infoTemplate = null;
	  var geojson;
	  var gl_departamentos = null;
	  var gl_municipios = null;
	  var gl_simbolos = null;
	  var currentVarSelection = null;
	  var data_mapa = null;
	  var data_grafico = null;
	  var sliderValues = null;
	  var colorPicker1 = null;
	  var colorPicker2 = null;
	  var proyectoactual_ = null;
	  var initchart = 0;
    var tempmapas = null;
		var cclases = null;
		
	  require(['esri/map',
			   'esri/dijit/HomeButton',
			   'esri/dijit/BasemapGallery',
			   'esri/symbols/SimpleMarkerSymbol',
			   'esri/symbols/SimpleFillSymbol',
			   'esri/arcgis/utils',
			   'dojo/parser',
         'esri/layers/WMSLayer', 
         'esri/layers/WMSLayerInfo', 
         'esri/geometry/Extent',
         "esri/geometry/Polygon",
         "esri/layers/FeatureLayer",
         "esri/dijit/PopupTemplate",
         "esri/request",
         "esri/geometry/Point",
         "esri/graphic",
         "esri/layers/GraphicsLayer",
         "dojo/on",
         "dojo/_base/array",
			   "dijit/layout/BorderContainer", 
			   "dijit/layout/ContentPane", 
			   "dijit/TitlePane",
			   "dojo/domReady!"], function(Map,
										   HomeButton,
										   BasemapGallery,
										   SimpleMarkerSymbol,
										   SimpleFillSymbol,
										   arcgisUtils,
										   parser,
                       WMSLayer, 
                       WMSLayerInfo, 
                       Extent,
                       Polygon, 
                       FeatureLayer, 
                       InfoTemplate,
                       esriRequest,
                       Point,
                       Graphic,
                       GraphicsLayer,
                       on,
                       array) 
	{ 
        var featureLayer;
		    gl_simbolos = new Array();
		    parser.parse();
        
        if(drawmap==1)
        {
	        var zoom = 9;
	        
	        if($('#map').height()<340) zoom = 8;
	        
	        map = new Map("map", {
	          center: [-88.9060, 13.8],
	          zoom: zoom,
	          basemap: "oceans"
	        });
			
			    var basemapGallery = new BasemapGallery({
							showArcGISBasemaps: true,
							map: map
					}, "basemapGallery");
			
			    basemapGallery.startup();
	      
    			basemapGallery.on("error", function(msg) {
    			    //
    			});

			    $('#scaleyear').hide();
	        redrawContents(0,0);
	        getDataGrafico(0,0);
	        
    	}
           
      buildTree();

      $('#arbol_catalogo').on("select_node.jstree", function (e, data) {
			  
			});

			$('#arbol_catalogo').on("deselect_node.jstree", function (e, data) {
			  
			});

			$('#arbol_catalogo').on('changed.jstree', function (e, data) {
			    if(data.node!=null) {
				    if(data.node.parent=="#"){
				    	if(map!=null) getProyecto(data.node.id,0);
				    	else window.location.href = baseUrl + "/" + data.node.id;
				    } else {
				    	
				    	var x = data.node.original.id.split("_");
				    	if(proyectoactual.id!=data.node.original.parent)
				    	{
				    		getProyecto(data.node.parent,x[1]);
				    	} else {
				    		cambiarTab(x[1]);
				    	}
				    }
				}
			});

			$('#myButton').on('click', function() {
			    var $btn = $(this).button('loading')
			    var file_data = $('#fileToUpload').prop('files')[0];   
			    var form_data = new FormData();                  
			    form_data.append('file', file_data);
			    form_data.append('tipo',$('#valtipoarchivo').val());
			    form_data.append('dm',$('#tipodm').val());
			    form_data.append('coordtype',$('#tipocoord').val());
			    form_data.append("_token",$('[name=_token]').val());
			    form_data.append('titulo',$('#tituloDescriptivo').val());
			    form_data.append('proyectoid',proyectoactual.id);
			    $.ajax({
			        url: 'uploadArchivoDatos', 
			        dataType: 'text', 
			        cache: false,
			        contentType: false,
			        processData: false,
			        data: form_data,                         
			        type: 'post',
			        success: function(php_script_response){
			            $btn.button('reset');
			            $.ajax({
			  							method: "POST",
			  							url: baseUrl + "/getCapasDatosPersonales",
			  							data: {"_token":$('[name=_token]').val(), id:proyectoactual.id}
		  						}).done(function( data ) {
		    							var i = 0;
		    					    $("#capasPersonales").find('option').remove();
									  	for(i=0;i<data.capasProyecto.length;i++)
									  	{
									  		$("#capasPersonales").append($("<option></option>").attr("value", data.capasProyecto[i].idarchivo).text(data.capasProyecto[i].titulo));
									  	}
									  	for(i=0;i<data.capasUsuario.length;i++)
									  	{
									  		$("#capasPersonales").append($("<option></option>").attr("value", data.capasUsuario[i].idarchivo).text(data.capasUsuario[i].titulo));
									  	}
        							getAtributosCapaPersonalizada($("#capasPersonales").val());
		  						});
			        }
					});
			});
	  });

		function addLayerDepartamento(mapaid,id,temporalidad,atributo,color1,color2,transparencia)
	  {
	  		require(["esri/graphic",
            		"esri/layers/GraphicsLayer",
            		'esri/map',
			   				'esri/dijit/BasemapGallery'],function(Graphic,GraphicsLayer,Map,BasemapGallery){
		  		  
						gl_departamentos = new GraphicsLayer({ id: "departamentos" });
					
		        map.addLayer(gl_departamentos,0);

		        var i = 0;

		        var colorscale = d3.scale.linear().domain([1,(proyectoactual.configuracion.mapas[mapaid].contenidos[id].nclases * 1)],function(n,i){ return n.value * 1; }).range([color1,color2]);
		        
		        if(proyectoactual.configuracion.mapas[mapaid].contenidos[id].clasificacion=="2")
		        {
		        	var max = Math.max.apply(Math,$.map(data_mapa[id].data_temporalidad[temporalidad][atributo],function(n,i){ return n.value * 1; }));
		  	   		var min = Math.min.apply(Math,$.map(data_mapa[id].data_temporalidad[temporalidad][atributo],function(n,i){ return n.value * 1; }));
		  	   		var rango = max - min;
		  	   		ic = round(rango / proyectoactual.configuracion.mapas[mapaid].contenidos[id].nclases,2);
		  	   		var a = 0;
		  	   		var clases = new Array();
		  	   		
		  	   		for(a=0;a<proyectoactual.configuracion.mapas[mapaid].contenidos[id].nclases;a++)
		  	   		{
		  	   			var clase = new Array();
		  	   			clase.push(min);
		  	   			
		  	   			if(a<proyectoactual.configuracion.mapas[mapaid].contenidos[id].nclases-1) clase.push(round(min+ic,2));
		  	   			else(clase.push(max));
		  	   			clases.push(clase);
		  	   			min = min + ic;
		  	   		}

		  	   		proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases = clases;
		        }

		        if(proyectoactual.configuracion.mapas[mapaid].contenidos[id].clasificacion=="3")
		        {
		        	var clases = new Array();
		        	var values = $.map(data_mapa[id].data_temporalidad[temporalidad][atributo],function(n,i){ return n.value * 1; });
		      		values.sort(function(a, b){return a-b});
		      		var clase = new Array();
		      		clase.push(values[0]);
		      		clase.push(values[3]);
		      		clases.push(clase);

		      		clase = new Array();
		      		clase.push(values[4]);
		      		clase.push(values[7]);
		      		clases.push(clase);

		      		clase = new Array();
		      		clase.push(values[8]);
		      		clase.push(values[10]);
		      		clases.push(clase);

		      		clase = new Array();
		      		clase.push(values[11]);
		      		clase.push(values[13]);
		      		clases.push(clase);

		      		proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases = clases;  	
		        }

		        if(proyectoactual.configuracion.mapas[mapaid].contenidos[id].clasificacion=="4")
		        {
		        	var clases = new Array();
		        	var values = $.map(data_mapa[id].data_temporalidad[temporalidad][atributo],function(n,i){ return n.value * 1; });
		      		values.sort(function(a, b){return a-b});
		      		var clase = new Array();
		      		clase.push(values[0]);
		      		clase.push(values[2]);
		      		clases.push(clase);

		      		clase = new Array();
		      		clase.push(values[3]);
		      		clase.push(values[5]);
		      		clases.push(clase);

		      		clase = new Array();
		      		clase.push(values[6]);
		      		clase.push(values[8]);
		      		clases.push(clase);

		      		clase = new Array();
		      		clase.push(values[9]);
		      		clase.push(values[11]);
		      		clases.push(clase);

		      		clase = new Array();
		      		clase.push(values[12]);
		      		clase.push(values[13]);
		      		clases.push(clase);

		      		proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases = clases; 
		        }

		        for(i=0;i<departamentos.length;i++)
		        {

		        	if(typeof departamentos[i].geojson == "string")
		        		departamentos[i].geojson = eval("(" + departamentos[i].geojson + ")");
		        	
		        	var depPolygons = new Array();
		        	var j = 0;
		        	
		        	for(j=0;j<departamentos[i].geojson.coordinates.length;j++)
		        	{
		        		var color = [255,255,255,100];
		        		
		        		for(k=0;k<data_mapa[id].data_temporalidad[temporalidad][atributo].length;k++)
		        		{
		        			if(data_mapa[id].data_temporalidad[temporalidad][atributo][k].departamento == departamentos[i].departamento)
		        			{
		        					var l = 1;
		        					for(l=1;l<=proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases.length;l++)
		        					{
		        						if(data_mapa[id].data_temporalidad[temporalidad][atributo][k].value >= (proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases[l-1][0] * 1) && data_mapa[id].data_temporalidad[temporalidad][atributo][k].value <= (proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases[l-1][1]*1))
		        						{
		        							color = HexToRGB(colorscale(l).toUpperCase(),transparencia);
		        						}
		        					}
		        			}
		        		}

		        		var myPolygon = {"geometry":{"rings":departamentos[i].geojson.coordinates[j],"spatialReference":{"wkid":4326}}, 
		        		"symbol":{"color":color,"outline":{"color":[0,0,0,0],"width":1,"type":"esriSLS","style":"esriSLSSolid"},
		    				"type":"esriSFS","style":"esriSFSSolid"},attributes:{"coddepto":departamentos[i].coddepto,"departamentoid":departamentos[i].departamentoid,"departamento":departamentos[i].departamento}};
		    				depPolygons[j] = myPolygon;
		    			
		    				var gra = new Graphic(myPolygon);
		  					gl_departamentos.add(gra);
		        	}
		 
		    			departamentos[i].polygon = depPolygons;

		        }
	    	});
	  }
	  
	  function addLayerCP(mapaid,id,atributo,tipolayer,tipocoord,dm,color1,color2,transparencia)
	  {
		     
				 require(["esri/graphic",
            		"esri/layers/GraphicsLayer"],function(Graphic,GraphicsLayer){
		  		  gl_departamentos = new GraphicsLayer({ id: "departamentos" });
		        gl_municipios = new GraphicsLayer({ id: "municipios" });
		        
		        map.addLayer(gl_departamentos,0);
		        map.addLayer(gl_municipios,1);

		        var i = 0;

		        var colorscale = d3.scale.linear().domain([1,(proyectoactual.configuracion.mapas[mapaid].contenidos[id].nclases * 1)],function(n,i){ return n.value * 1; }).range([color1,color2]);
		        
		        var clases = proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases;
		        console.log("DM" + dm);
		        if(dm=="1")
		        {
							 for(i=0;i<departamentos.length;i++)
		        	 {
		        	      if(typeof departamentos[i].geojson == "string")
		        					departamentos[i].geojson = eval("(" + departamentos[i].geojson + ")");
		        	
		        				var depPolygons = new Array();
		        				var j = 0;
		        	      for(j=0;j<departamentos[i].geojson.coordinates.length;j++)
		        				{
		        						var color = [255,255,255,100];
		        				    var value;
		        				    var index = data_mapa[id][0].campos.indexOf(atributo);
												
												for(k=0;k<data_mapa[id][0].data.length;k++)
		        				    {
												   if(data_mapa[id][0].data[k][index][departamentos[i].coddepto]!=null)
												   {
													    value = data_mapa[id][0].data[k][index][departamentos[i].coddepto];
													    break;
													 }
												}
												
												for(l=1;l<=proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases.length;l++)
		        						{
		        							if(value >= (proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases[l-1][0] * 1) && value <= (proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases[l-1][1]*1))
		        							{
		        								color = HexToRGB(colorscale(l).toUpperCase(),transparencia);
		        							}
		        						}
		        						
		        						var myPolygon = {"geometry":{"rings":departamentos[i].geojson.coordinates[j],"spatialReference":{"wkid":4326}}, 
							        	"symbol":{"color":color,"outline":{"color":[0,0,0,0],"width":1,"type":"esriSLS","style":"esriSLSSolid"},
							    			"type":"esriSFS","style":"esriSFSSolid"},attributes:{"coddepto":departamentos[i].coddepto,"departamentoid":departamentos[i].departamentoid,"departamento":departamentos[i].departamento}};
							    			depPolygons[j] = myPolygon;
							    			
							    			var gra = new Graphic(myPolygon);
							  				gl_departamentos.add(gra);
										}
										
										departamentos[i].polygon = depPolygons;
		        	 }
						} else {
						   for(i=0;i<municipios.length;i++)
		        	 {
		        	      if(typeof municipios[i].geojson == "string")
		        					municipios[i].geojson = eval("(" + municipios[i].geojson + ")");
		        	
		        				var munPolygons = new Array();
		        				var j = 0;
		        	      for(j=0;j<municipios[i].geojson.coordinates.length;j++)
		        				{
		        						var color = [255,255,255,100];
		        				    var value;
		        				    var index = data_mapa[id][0].campos.indexOf(atributo);
												for(k=0;k<data_mapa[id][0].data.length;k++)
		        				    {
												   if(data_mapa[id][0].data[k][index][municipios[i].codmuni]!=null)
												   {
													    value = data_mapa[id][0].data[k][index][municipios[i].codmuni];
													    break;
													 }
												}
												
												for(l=1;l<=proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases.length;l++)
		        						{
		        							if(value >= (proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases[l-1][0] * 1) && value <= (proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases[l-1][1]*1))
		        							{
		        								color = HexToRGB(colorscale(l).toUpperCase(),transparencia);
		        							}
		        						}
		        						
		        						var myPolygon = {"geometry":{"rings":municipios[i].geojson.coordinates[j],"spatialReference":{"wkid":4326}}, 
							        		"symbol":{"color":color,"outline":{"color":[0,0,0,0],"width":1,"type":"esriSLS","style":"esriSLSSolid"},
							    			"type":"esriSFS","style":"esriSFSSolid"},attributes:{"codmuni":municipios[i].codmuni,"municipioid":municipios[i].municipioid,"municipio":municipios[i].municipio}};
							    			munPolygons[j] = myPolygon;
							    			
							    			var gra = new Graphic(myPolygon);
							  				gl_municipios.add(gra);
										}
										
										municipios[i].polygon = munPolygons;
		        	 }
						}
		     });
		}

	  function guardarNuevoProyecto()
	  {
	  		$("#frmNuevoProyecto")[0].submit();
	  }

	  function crearMapa()
	  {

	  	if(proyectoactual!=null)
	  	{
	  		$('#tituloProyectoContenedor').val(proyectoactual.nombre);
	  		$('#tituloMapaNuevo').val("");
				$('#nuevo_mapa').modal('toggle');
	  	}
	  	else
	  	{
			$().toastmessage('showToast', {
	  									text:"Debe tener un proyecto activo para agregar un mapa.",
	  									type:"warning",
	  									position:"middle-center"
	  								  });
	  	}
	  }

	  function actualizarProyecto(accion)
	  {
	  	if(accion=="crearmapa")
	  	{
	  		var id = proyectoactual.configuracion.mapas.length
	  		proyectoactual.configuracion.mapas.push({"id":id,"titulo_mapa":$("#tituloMapaNuevo").val() });
	  		proyectoactual.configuracion.graficos.push({"id":proyectoactual.configuracion.graficos.length,"titulo":$("#tituloMapaNuevo").val() });
	  		catalogo.push({ "id" : "mapa" + proyectoactual.id + "_" + id, "parent" : proyectoactual.id, "text" : $("#tituloMapaNuevo").val(), "icon":"folder", "state" : { "opened": true }, "icon":"fa fa-map-o text-primary", "type":"folder", "codigo":"","nombre":"","padre":""});
	  		
	  		var tree = $.jstree.reference('#arbol_catalogo');
	  		tree.settings.core.data = catalogo;
	  		tree.refresh();
	  		
	  		$('#tab_maps').append("<li id=\"mapa" + id + "\" role=\"presentation\"><a id=\"" + proyectoactual.id + "_" + id + "\" href=\"#\" aria-controls=\"home\" role=\"tab\" data-toggle=\"tab\">" + $("#tituloMapaNuevo").val() + "</a></li>");
	  		$('#'+ proyectoactual.id + "_" + id).tab('show');
	  		$('#nuevo_mapa').modal('toggle');

	  		$.ajax({
			  method: "POST",
			  url: baseUrl + "/updateProyecto",
			  data: { "_token":$('[name=_token]').val(),"id":proyectoactual.id,"configuracion":proyectoactual.configuracion } 
			}).done(function( data ) {
				cambiarTab(proyectoactual.configuracion.mapas.length-1);
		  });
	  	}
	  }

	  function agregarVariables()
	  {
	  		$.ajax({
			  method: "POST",
			  url: baseUrl + "/actualizarProyecto",
			  data: $("#frmNuevoProyecto").serialize()
			}).done(function( data ) {
		    	var jsonData = eval('(' + data + ')');
		    	if(jsonData.status=="OK")
		    	{
		    		$('#nuevo_proyecto').modal('close');
		    		$('#sel_informacion').modal('show');
		    	} 
		    	else
		    	{
		    		$().toastmessage('showToast', {
	  									text:jsonData.mensaje,
	  									type:"error",
	  									position:"middle-center"
	  								  });
		    	}
		  	});	
	  }

	  function changeTipoArchivo(sel)
	  {
	  	if(sel==2)
	  	{
	  		$('#grpTipoCoordenadas').show();
	  		$("#valtipoarchivo").val(2);
        $('#grpDepartamentosMunicipios').hide();
	  	}
	  	else
	  	{
	  		$('#grpTipoCoordenadas').hide();
	  		$("#valtipoarchivo").val(1);
        $('#grpDepartamentosMunicipios').show();
	  	}
	  }

	  function changeCoordType(sel)
	  {
	  	$('#tipocoord').val(sel);
	  }
    
    function changeTypeDM(sel)
    {
      $('#tipodm').val(sel);
    }

	  function selArchivoDatos()
	  {
	  	$.ajax({
			  method: "POST",
			  url: baseUrl + "/getCapasDatosPersonales",
			  data: {"_token":$('[name=_token]').val(), id:proyectoactual.id}
		  }).done(function( data ) {
		    var i = 0;
		    
		    $("#capasPersonales").find('option').remove();

		  	for(i=0;i<data.capasProyecto.length;i++)
		  	{
		  		$("#capasPersonales").append($("<option></option>").attr("value", data.capasProyecto[i].idarchivo).text(data.capasProyecto[i].titulo));
		  	}

		  	for(i=0;i<data.capasUsuario.length;i++)
		  	{
		  		$("#capasPersonales").append($("<option></option>").attr("value", data.capasUsuario[i].idarchivo).text(data.capasUsuario[i].titulo));
		  	}
        
        getAtributosCapaPersonalizada($("#capasPersonales").val());
		  	
        $('#grpTipoCoordenadas').hide();
        
        $("#spinner_").spinner({
    		  stop: function( event, ui ) {
    		  	createInputClasses2($('#color1').val(),$('#color2').val());
    		  }
        });
        
        $("#tclasificacion2").val(1);
	  	  createInputClasses2('#ffffff','#304bb8');
        
		    $('#sel_informacion2').modal('toggle');	
		  });
	  }
    
    function getAtributosCapaPersonalizada(id)
    {
        $.ajax({
			     method: "POST",
			     url: baseUrl + "/getAtributoCapaPersonal",
			     data: {"_token":$('[name=_token]').val(), id:id}
			  }).done(function( data ) {
		    	var i = 0;
          data = eval('(' + data + ')');
          $("#atributo1_").empty();
          for(i=0;i<data.length;i++){
              $("#atributo1_").append($("<option></option>").attr("value", data[i]).text(data[i]));
          }
		  	});
    }

	  function publicarProyecto()
	  {
	  		$.ajax({
			  method: "POST",
			  url: baseUrl + "/publicarProyecto",
			  data: {"_token":$('[name=_token]').val(), id:proyectoactual.id}
			}).done(function( data ) {
		    	window.location.href = baseUrl + "/";
		  	});	
	  }

	  function editarNombreMapa()
	  {
	  	var mapid = $("ul#tab_maps li.active").attr("id").substring(4);
	  	$('#inputeditarnmapa').val(proyectoactual.configuracion.mapas[mapid].titulo_mapa);
	  	$('#sel_editmapa').modal('toggle'); 
	  }
    
    function editarContenidos()
    {
       tempmapas = proyectoactual.configuracion.mapas;
       var html = "";
       html += "<table class=\"table\">";
       html += "<tr>";
       html += "<td>Mapa</td>";
       html += "<td>Contenidos</td>";
       html += "<td>Acciones</td>";
       html += "</tr>";
       var i = 0;
       for(i=0;i<proyectoactual.configuracion.mapas.length;i++)
       {
          html += "<tr>";
          html += "<td>";
          html += proyectoactual.configuracion.mapas[i].titulo_mapa;
          html += "</td>";
          html += "<td colspan=2>";
          var j = 0;
          html +="<table class=\"table\">"
          for(j=0;j<proyectoactual.configuracion.mapas[i].contenidos.length;j++)
          {
             html += "<tr>";
             html += "<td>" + proyectoactual.configuracion.mapas[i].contenidos[j].lblatributo1 + "</td>";
             html += "<td><a onclick=\"eliminarContenido(" + i + "," + j + ");\" class=\"btn btn-default\" href=\"#\" role=\"button\">Eliminar</a></td>";
             html += "</tr>";
          }
          html+="</table>"
          html += "</td>";
          html += "</tr>";
       }
       html += "</table>";
       $('#tblContenidos').html(html);
       $('#nuevo_contenidos').modal('toggle');
    }
    
    function eliminarContenido(mapaid,contenidoid)
    {
        ncontenidos = new Array();
        
        var i = 0;
        for(i=0;i<proyectoactual.configuracion.mapas[mapaid].contenidos.length;i++)
        {
          if(i!=contenidoid) ncontenidos.push(proyectoactual.configuracion.mapas[mapaid].contenidos[i]);
        }
        proyectoactual.configuracion.mapas[mapaid].contenidos = ncontenidos;
        var html = "";
        html += "<table class=\"table\">";
        html += "<tr>";
        html += "<td>Mapa</td>";
        html += "<td>Contenidos</td>";
        html += "<td>Acciones</td>";
        html += "</tr>";
        var i = 0;
        for(i=0;i<proyectoactual.configuracion.mapas.length;i++)
        {
          html += "<tr>";
          html += "<td>";
          html += proyectoactual.configuracion.mapas[i].titulo_mapa;
          html += "</td>";
          html += "<td colspan=2>";
          var j = 0;
          html +="<table class=\"table\">"
          for(j=0;j<proyectoactual.configuracion.mapas[i].contenidos.length;j++)
          {
             html += "<tr>";
             html += "<td>" + proyectoactual.configuracion.mapas[i].contenidos[j].lblatributo1 + "</td>";
             html += "<td><a onclick=\"eliminarContenido(" + i + "," + j + ");\" class=\"btn btn-default\" href=\"#\" role=\"button\">Eliminar</a></td>";
             html += "</tr>";
          }
          html+="</table>"
          html += "</td>";
          html += "</tr>";
        }
        html += "</table>";
        $('#tblContenidos').html(html); 
    }
    
    function actualizaProyecto()
    {
         $.ajax({
			   	method: "POST",
			   	url: baseUrl + "/updateProyecto",
			   	data: { "_token":$('[name=_token]').val(),"id":proyectoactual.id,"configuracion":proyectoactual.configuracion } 
			   }).done(function( data ) {
				    cambiarTab(0);
            $('#nuevo_contenidos').modal('toggle');
		     });
    }
    
    function cancelaEdicionContenido()
    {
      proyectoactual.configuracion.mapas = tempmapas;
    }

	  function guardarTituloMapa(){
	  	var mapid = $("ul#tab_maps li.active").attr("id").substring(4);
	  	proyectoactual.configuracion.mapas[mapid].titulo_mapa = $('#inputeditarnmapa').val();
	  	$.ajax({
			  method: "POST",
			  url: baseUrl + "/updateProyecto",
			  data: { "_token":$('[name=_token]').val(),"id":proyectoactual.id,"configuracion":proyectoactual.configuracion } 
			}).done(function( data ) {
				redrawProyecto(mapid)
				$('#sel_editmapa').modal('toggle');
		  });	
	  }

	  function guardaTipoGrafico()
	  {
	  		proyectoactual.configuracion.graficos[$('#selgrafico').val()].series[$('#selserie').val()].tipo = $('#seltipografico').val();
	  		
				var tempoid = null;
	  		
	  		if(proyectoactual.configuracion.mapas[$('#selgrafico').val()].contenidos[$('#selserie').val()].origen=="BD")
	  		 		tempoid = getTemporalidadGrafico($('#selgrafico').val(),proyectoactual.configuracion.mapas[$('#selgrafico').val()].contenidos[$('#selserie').val()].escalaTiempo,$('.slider').slider('value'),'');
				else tempoid = 0;
				
	  		$.ajax({
			  	method: "POST",
			  	url: baseUrl + "/updateProyecto",
			  	data: { "_token":$('[name=_token]').val(),"id":proyectoactual.id,"configuracion":proyectoactual.configuracion } 
				}).done(function( data ) {
					drawCharts(tempoid);
					$('#sel_editchart').modal('toggle');
		 });
	  }

	  function buildTree()
	  {
	  		$('#arbol_catalogo').jstree({ 'core' : {
                'data' : catalogo
                },
                'check_callback' : true,
                'contextmenu' : {
                        'items' : function(node) {
                            var tmp = $.jstree.defaults.contextmenu.items();
                            eliseo = tmp;
                            delete tmp.create.action;
                            tmp.create.label = "Nuevo";
                            tmp.create.submenu = {
                                "create_folder" : {
                                    "separator_after"   : true,
                                    "label"             : "Grupo",
                                    "action"            : function (data) {
                                        var inst = $.jstree.reference(data.reference),
                                            obj = inst.get_node(data.reference);
                                        
                                        if(obj.id==0) 
                                        {
                                            $("#parent").val('RAIZ');
                                        }
                                        else
                                        {
                                            $("#parent").val(obj.text);
                                        }
                                        if(obj.type=="folder")
                                        {
                                            $('#parentid').val(obj.id);
                                            $('#nuevogruporaiz').modal('toggle');
                                        } else window.alert("Debe seleccionar un grupo para crear un nuevo grupo.");
                                    }
                                },
                                "create_file" : {
                                    "label"             : "Cuenta",
                                    "action"            : function (data) {
                                        var inst = $.jstree.reference(data.reference),
                                            obj = inst.get_node(data.reference);
                                        if(obj.type=='folder'){
                                            $("#parent_").val(obj.text);
                                            $('#parentid_').val(obj.id);
                                            $('#nuevacuenta').modal('toggle');
                                        } else window.alert("Debe seleccionar un grupo para crear una cuenta.");
                                    }
                                }
                            };
                            delete tmp.rename;
                            tmp.remove.label = "Eliminar";
                            tmp.remove.action = function(data) {
                                var inst = $.jstree.reference(data.reference),
                                            obj = inst.get_node(data.reference);
                                if(confirm("�Realmente desea eliminar el item seleccionado?"))
                                {
                                    $("#id").val(obj.id);
                                    
                                    if(obj.type=='file') {
                                        $("#accion_delete").val("cuenta");
                                    }
                                    else {
                                        $("#accion_delete").val("grupo");
                                    }

                                    $('#delete_form')[0].submit();
                                }
                            };
                            tmp.editar = { "label" : "Editar", "action" : function(data){ 
                                    var inst = $.jstree.reference(data.reference),
                                            obj = inst.get_node(data.reference);
                                    if(obj.type=="folder"){
                                        $("#grupoid").val(obj.id);
                                        $("#grupo").val(obj.original.nombre);
                                        $("#parent").val(obj.original.padre);
                                        $("#codigo").val(obj.original.codigo);
                                        $("#accion_grupo").val("grupo_editar");
                                        $('#nuevogruporaiz').modal('toggle');
                                    } else {
                                        $('#parent_').val(obj.original.padre);
                                        $('#cuentaid').val(obj.original.cuentaid);
                                        $('#empresaid').val(obj.original.empresaid);
                                        $('#tipo').val(obj.original.tipo);
                                        $('#codigo_').val(obj.original.codigo);
                                        $('#cuenta').val(obj.original.cuenta);
                                        $('#saldo').val(obj.original.saldo);
                                        $("#accion_cuenta").val("cuenta_editar");
                                        $('#nuevacuenta').modal('toggle');
                                    }
                                } 
                            };
                            delete tmp.ccp;

                            if(this.get_type(node) === "file") {
                                delete tmp.create;
                            }
                            return tmp;
                        }
                    },
                    'types' : {
                        'folder' : { 'icon' : 'folder' },
                        'file' : { 'icon' : 'file' }
                    },
                    plugins: ['types','contextmenu'] 
            });
	  }

	  function getMinMax(atributo,escalaT)
	  {
	  	 $.ajax({
			   method: "POST",
			   url: baseUrl + "/getMinMax",
			   data: { "_token":$('[name=_token]').val(),"atributo":atributo,"escala":escalaT} 
			 }).done(function( data ) {
				
				var i = 0;
				var ic = (data[0] - data[1]) / $('#spinner').val();
				var start = data[1] * 1;
				
				for(i=1;i<=$('#spinner').val();i++)
	  		{	
	  				$("#clase" + i + "_1").val(round(start,2));
	  				$("#clase" + i + "_2").val(round((start) + (ic)));
	  				start += ic;
	  		}
		 });
	  }
	  
	  function getMinMaxCP(capaid,atributo)
	  {
	  	  $.ajax({
			  	method: "POST",
			  	url: baseUrl + "/getMinMaxCP",
			  	data: { "_token":$('[name=_token]').val(),"atributo":atributo,"id":capaid} 
			  }).done(function( data ) {
				var i = 0;
				var ic = (data[0] - data[1]) / $('#spinner_').val();
				var start = data[1] * 1;
				
				for(i=1;i<=$('#spinner_').val();i++)
	  		{	
	  				$("#clase_" + i + "_1").val(round(start,2));
	  				$("#clase_" + i + "_2").val(round((start) + (ic)));
	  				start += ic;
	  		}
		  });
	  }

	  function getCuantile(atributo,escalaT,yyyy,mm)
	  {
	  	 $.ajax({
			  method: "POST",
			  url: baseUrl + "/getCuantiles",
			  data: { "_token":$('[name=_token]').val(),"nquantile":$('#spinner').val(),"atributo":atributo,"ttemporalidad":escalaT} 
			 }).done(function( data ) {
				var i = 0;
				
				for(i=0;i<data.length;i++)
				{
					$("#clase" + (i + 1) + "_2").val(data[i].r2);
				}				
		 });
	  }
	  
	  function getCuantileCP(capaid,atributo)
	  {
	  	 $.ajax({
			  method: "POST",
			  url: baseUrl + "/getCuantilesCP",
			  data: { "_token":$('[name=_token]').val(),"nquantile":$('#spinner_').val(),"atributo":atributo,"capaid":capaid} 
			}).done(function( data ) {
				var i = 0;
				cclases = new Array();
				for(i=0;i<data.length;i++)
				{
					var clase = new Array();
					clase.push(data[i].r1);
					clase.push(data[i].r2);
					cclases.push(clase);
					$("#clase_" + (i + 1) + "_2").val(data[i].r2);
				}				
		 });
	  }

	  function changeClasificacion()
	  {
	  		if($('#tclasificacion').val()==1)
	  		{
	  			$('#spinner').val(3);
	  			createInputClasses($('#color1').val(),$('#color2').val());
          return;
	  		}

	  		if($('#tclasificacion').val()==2)
	  		{
	  			$('#spinner').val(3);
	  			createInputClasses($('#color1').val(),$('#color2').val());
          return;
	  		}

	  		if($('#tclasificacion').val()==3)
	  		{
	  			$('#spinner').val(4);
	  			createInputClasses($('#color1').val(),$('#color2').val());
          return;
	  		}

	  		if($('#tclasificacion').val()==4)
	  		{
	  			$('#spinner').val(5);
	  			createInputClasses($('#color1').val(),$('#color2').val());
          return;	
	  		}
	  }
	  
	  function changeClasificacion2()
	  {
	  		if($('#tclasificacion2').val()==1)
	  		{
	  			$('#spinner_').val(3);
	  			createInputClasses2($('#color1').val(),$('#color2').val());
          return;
	  		}

	  		if($('#tclasificacion2').val()==2)
	  		{
	  			$('#spinner_').val(3);
	  			createInputClasses2($('#color1').val(),$('#color2').val());
          return;
	  		}

	  		if($('#tclasificacion2').val()==3)
	  		{
	  			$('#spinner_').val(4);
	  			createInputClasses2($('#color1').val(),$('#color2').val());
          return;
	  		}

	  		if($('#tclasificacion2').val()==4)
	  		{
	  			$('#spinner_').val(5);
	  			createInputClasses2($('#color1').val(),$('#color2').val());
          return;	
	  		}
	  }

	  function addContenidosBase()
	  {
	  	$('#grpAtributo2').hide();
	  	$('#grpAtributoColeccion').hide();
	  	$('input:checkbox').attr('checked', false); 
	  	$('#sel_informacion').modal('toggle');
	  	$('#etiquetasbd').hide();
	  	$("#spinner").spinner({
  		  stop: function( event, ui ) {
  		  	createInputClasses($('#color1').val(),$('#color2').val());
  		  }
		  });

	  	$("#tclasificacion").val(1);
	  	createInputClasses('#ffffff','#304bb8');
	  	if(!$.fn.DataTable.isDataTable('#tblVariables'))
	  	{
		  	$('#tblVariables').DataTable({
	                scrollX: true,
	                searching: false,
	                lengthChange: false,
	                language: {
	                    processing:     "Procesando...",
	                    search:         "Buscar:",
	                    lengthMenu:     "Mostrar _MENU_ filas",
	                    info:           "_START_ a _END_ de _TOTAL_ filas",
	                    infoEmpty:      "0 a 0 de 0 filas",
	                    infoFiltered:   "(filtradas de _MAX_ filas totales)",
	                    infoPostFix:    "",
	                    loadingRecords: "Cargando...",
	                    zeroRecords:    "Ning&uacute;n registro que mostrar",
	                    emptyTable:     "Tabla vac&iacute;a",
	                    paginate: {
	                       first:      "<<",
	                        previous:   "<",
	                        next:       ">",
	                        last:       ">>"
	                    }
	                }
	        });
	  	}
	  }

	  function changeColors()
	  {
	  	var i = 0;
	  	var colorscale = d3.scale.linear().domain([1,$('#spinner').val()]).range([$('#color1').val(),$('#color2').val()]);
	  	for(i=0;i<$('#spinner').val();i++)
	  	{
	  		$("#lbl" + (i + 1)).css("background-color",colorscale(i+1));
	  	}
	  }
	  
	  function changeColors2()
	  {
	  	var i = 0;
	  	var colorscale = d3.scale.linear().domain([1,$('#spinner_').val()]).range([$('#color1_').val(),$('#color2_').val()]);
	  	for(i=0;i<$('#spinner_').val();i++)
	  	{
	  		$("#lbl_" + (i + 1)).css("background-color",colorscale(i+1));
	  	}
	  }

	  function createInputClasses(color1,color2)
	  {
	  		var i = 0;
	  		var html="";

	  		$('#cp11').colorpicker({color:color1});
	  		$('#cp11').on("hidePicker",function(){ changeColors(); });
	  		$('#cp12').colorpicker({color:color2});
	  		$('#cp12').on("hidePicker",function(){ changeColors(); });

	  		var colorscale = d3.scale.linear().domain([1,$('#spinner').val()]).range([$('#color1').val(),$('#color2').val()]);

	  		$("#clases_").hide();
	  		$("#clases_").html("");
	  		$('#quartiles').hide();
	  		$('#quartiles').html("");
	  		$('#quintiles').hide();
	  		$('#quintiles').html("");
	  		
	  		if($('#tclasificacion').val()==1)
	  		{
		  		for(i=1;i<=$('#spinner').val();i++)
		  		{
		  			var value1 = $("#clase").val() + "";
		  			var value2 = $("#clase").val() + "";
		  			var color = colorscale(i);
		  			
		  			html += "<div class=\"form-group\" style=\"position:relative;\">\n";
						html += "<label for=\"clase" + i + "\">Clase " + i + "</label>\n";
						html += "<input type=\"text\" id=\"clase" + i + "_1\" size=\"5\" /> - <input type=\"text\" id=\"clase" + i + "_2\" size=\"5\" />";
						html += "<label id=\"lbl" + i +  "\" style=\"background-color:" + color + ";position:absolute;width:25px;height:25px;border-style:solid;border-width:1px;bottom:-2px;left:200px;\"></label>";
						html += "</div>";
		  		}

		  		$("#clases_").html(html);
		  		$("#clases_").show();
		  	}

		  	if($('#tclasificacion').val()==2)
		  	{
		  		for(i=1;i<=$('#spinner').val();i++)
		  		{
		  			var value1 = $("#clase").val() + "";
		  			var value2 = $("#clase").val() + "";
		  			var color = color = colorscale(i);
		  			
		  			html += "<div class=\"form-group\" style=\"position:relative;\">\n";
					  html += "<label for=\"clase" + i + "\">Clase " + i + "</label>\n";
					  html += "<input type=\"text\" id=\"clase" + i + "_1\" size=\"5\" /> - <input type=\"text\" id=\"clase" + i + "_2\" size=\"5\" />";
					  html += "<label id=\"lbl" + i +  "\" style=\"background-color:" + color + ";position:absolute;width:25px;height:25px;border-style:solid;border-width:1px;bottom:-2px;left:200px;\"></label>";
					  html += "</div>";
		  		}

		  		$("#clases_").html(html);
          
		  		getMinMax($('#atributo1').val(),$('#escalaTiempo').val());
		  		$("#clases_").show();
		  	}

		  	if($('#tclasificacion').val()==3)
	  		{
		  		for(i=1;i<=4;i++)
		  		{
		  			var value1 = $("#clase").val() + "";
		  			var value2 = $("#clase").val() + "";
		  			var color = color = colorscale(i);
		  			
		  			html += "<div class=\"form-group\" style=\"position:relative;\">\n";
						html += "<label for=\"clase" + i + "\">Limite " + i + "</label>\n";
						html += "<input type=\"text\" id=\"clase" + i + "_2\" size=\"5\" />";
						html += "<label  id=\"lbl" + i +  "\" style=\"background-color:" + color + ";position:absolute;width:25px;height:25px;border-style:solid;border-width:1px;bottom:-2px;left:130px;\"></label>";
						html += "</div>";
				}
				
				$('#quartiles').html(html);
				getCuantile($('#atributo1').val(),$('#escalaTiempo').val(),'','');
				$('#quartiles').show();
		  		
		  	}

		  	if($('#tclasificacion').val()==4)
	  		{
		  		for(i=1;i<=5;i++)
		  		{
		  			var value1 = $("#clase").val() + "";
		  			var value2 = $("#clase").val() + "";
		  			var color = color = colorscale(i);
		  			
		  			html += "<div class=\"form-group\" style=\"position:relative;\">\n";
						html += "<label for=\"clase" + i + "\">Limite" + i + "</label>\n";
						html += "<input type=\"text\" id=\"clase" + i + "_2\" size=\"5\" />";
						html += "<label id=\"lbl" + i +  "\" style=\"background-color:" + color + ";position:absolute;width:25px;height:25px;border-style:solid;border-width:1px;bottom:-2px;left:130px;\"></label>";
						html += "</div>";
					}
				
					$('#quintiles').html(html);
					getCuantile($('#atributo1').val(),$('#escalaTiempo').val(),'','');
					$('#quintiles').show();
		  		
		  	}
  		
	  }
    
    function createInputClasses2(color1,color2)
	  {
	  		var i = 0;
	  		var html="";

	  		$('#cp11_').colorpicker({color:color1});
	  		$('#cp11_').on("hidePicker",function(){ changeColors2(); });
	  		$('#cp12_').colorpicker({color:color2});
	  		$('#cp12_').on("hidePicker",function(){ changeColors2(); });

	  		var colorscale = d3.scale.linear().domain([1,$('#spinner_').val()]).range([$('#color1_').val(),$('#color2_').val()]);

	  		$("#clases__").hide();
	  		$("#clases__").html("");
	  		$('#quartiles_').hide();
	  		$('#quartiles_').html("");
	  		$('#quintiles_').hide();
	  		$('#quintiles_').html("");
	  		
	  		if($('#tclasificacion2').val()==1)
	  		{
		  		for(i=1;i<=$('#spinner_').val();i++)
		  		{
		  			var value1 = $("#clase").val() + "";
		  			var value2 = $("#clase").val() + "";
		  			var color = colorscale(i);
		  			
		  			html += "<div class=\"form-group\" style=\"position:relative;\">\n";
					  html += "<label for=\"clase_" + i + "\">Clase " + i + "</label>\n";
					  html += "<input type=\"text\" id=\"clase_" + i + "_1\" size=\"5\" /> - <input type=\"text\" id=\"clase_" + i + "_2\" size=\"5\" />";
					  html += "<label id=\"lbl_" + i +  "\" style=\"background-color:" + color + ";position:absolute;width:25px;height:25px;border-style:solid;border-width:1px;bottom:-2px;left:200px;\"></label>";
					  html += "</div>";
		  		}

		  		$("#clases__").html(html);
		  		$("#clases__").show();
		  	}

		  	if($('#tclasificacion2').val()==2)
		  	{
		  		for(i=1;i<=$('#spinner_').val();i++)
		  		{
		  			var value1 = $("#clase").val() + "";
		  			var value2 = $("#clase").val() + "";
		  			var color = color = colorscale(i);
		  			
		  			html += "<div class=\"form-group\" style=\"position:relative;\">\n";
					  html += "<label for=\"clase_" + i + "\">Clase " + i + "</label>\n";
					  html += "<input type=\"text\" id=\"clase_" + i + "_1\" size=\"5\" /> - <input type=\"text\" id=\"clase_" + i + "_2\" size=\"5\" />";
					  html += "<label id=\"lbl_" + i +  "\" style=\"background-color:" + color + ";position:absolute;width:25px;height:25px;border-style:solid;border-width:1px;bottom:-2px;left:200px;\"></label>";
					  html += "</div>";
		  		}

		  		$("#clases__").html(html);
          
		  		getMinMaxCP($('#capasPersonales').val(),$('#atributo1_').val());
		  		$("#clases__").show();
		  	}

		  	if($('#tclasificacion2').val()==3)
	  		{
		  		for(i=1;i<=4;i++)
		  		{
		  			var value1 = $("#clase").val() + "";
		  			var value2 = $("#clase").val() + "";
		  			var color = color = colorscale(i);
		  			
		  			html += "<div class=\"form-group\" style=\"position:relative;\">\n";
						html += "<label for=\"clase_" + i + "\">Limite " + i + "</label>\n";
						html += "<input type=\"text\" id=\"clase_" + i + "_2\" size=\"5\" />";
						html += "<label  id=\"lbl_" + i +  "\" style=\"background-color:" + color + ";position:absolute;width:25px;height:25px;border-style:solid;border-width:1px;bottom:-2px;left:130px;\"></label>";
						html += "</div>";
					}
				
					$('#quartiles_').html(html);
					getCuantileCP($('#capasPersonales').val(),$('#atributo1_').val());
					$('#quartiles_').show();
		  		
		  	}

		  	if($('#tclasificacion2').val()==4)
	  		{
		  		for(i=1;i<=5;i++)
		  		{
		  			var value1 = $("#clase").val() + "";
		  			var value2 = $("#clase").val() + "";
		  			var color = color = colorscale(i);
		  			
		  			html += "<div class=\"form-group\" style=\"position:relative;\">\n";
						html += "<label for=\"clase_" + i + "\">Limite" + i + "</label>\n";
						html += "<input type=\"text\" id=\"clase_" + i + "_2\" size=\"5\" />";
						html += "<label id=\"lbl_" + i +  "\" style=\"background-color:" + color + ";position:absolute;width:25px;height:25px;border-style:solid;border-width:1px;bottom:-2px;left:130px;\"></label>";
						html += "</div>";
					}
				
					$('#quintiles_').html(html);
					getCuantileCP($('#capasPersonales').val(),$('#atributo1_').val());
					$('#quintiles_').show();
		  		
		  	}
	  }

	  function changeSimbolo(){
	  	 var mapid = $("ul#tab_maps li.active").attr("id").substring(4);
	  	 if($('#selSimbolo').val()=="1"){
	  	 	$('#imgsimbolo').attr('src',baseUrl + '/imgs/circle.png');
	  	 	proyectoactual_.configuracion.mapas[mapid].contenidos[$('#contenido').val()].simbolo="STYLE_CIRCLE";
	  	 }
	  	 if($('#selSimbolo').val()=="2"){
	  	 	$('#imgsimbolo').attr('src',baseUrl + '/imgs/cross.png');
	  	 	proyectoactual_.configuracion.mapas[mapid].contenidos[$('#contenido').val()].simbolo="STYLE_CROSS";
	  	 }
	  	 if($('#selSimbolo').val()=="3"){
	  	 	$('#imgsimbolo').attr('src',baseUrl + '/imgs/diamond.png');
	  	 	proyectoactual_.configuracion.mapas[mapid].contenidos[$('#contenido').val()].simbolo="STYLE_DIAMOND";
	  	 }
	  	 if($('#selSimbolo').val()=="4"){
	  	 	$('#imgsimbolo').attr('src',baseUrl + '/imgs/square.png');
	  	 	proyectoactual_.configuracion.mapas[mapid].contenidos[$('#contenido').val()].simbolo="STYLE_SQUARE";
	  	 }
	  }

	  function selectContenido()
	  {
		  var mapid = $("ul#tab_maps li.active").attr("id").substring(4);
	  	$('#selEstiloRepresentacion2_').val(proyectoactual_.configuracion.mapas[mapid].contenidos[$('#contenido').val()].tipo);
	  	selectEstiloRepresentacion3();
	  	
	  	if(proyectoactual.configuracion.mapas[mapid].contenidos[$('#contenido').val()].simbolo=="STYLE_CIRCLE") {
	  		$('#selSimbolo').val(1);
	  		$('#imgsimbolo').attr('src',baseUrl + '/imgs/circle.png');
	  	}
	  	if(proyectoactual.configuracion.mapas[mapid].contenidos[$('#contenido').val()].simbolo=="STYLE_CROSS") {
	  		$('#selSimbolo').val(2);
	  		$('#imgsimbolo').attr('src',baseUrl + '/imgs/cross.png');
	  	}
	  	if(proyectoactual.configuracion.mapas[mapid].contenidos[$('#contenido').val()].simbolo=="STYLE_DIAMOND") {
	  		$('#selSimbolo').val(3);
	  		$('#imgsimbolo').attr('src',baseUrl + '/imgs/diamond.png');
	  	} 
	  	if(proyectoactual.configuracion.mapas[mapid].contenidos[$('#contenido').val()].simbolo=="STYLE_SQUARE") {
	  		$('#selSimbolo').val(4);
	  		$('#imgsimbolo').attr('src',baseUrl + '/imgs/square.png');
	  	}
	  	
	  	require(["esri/dijit/ColorPicker"],function(ColorPicker){
	  	 	
	  	 	if(colorPicker1!=null){
	  	 		colorPicker1.destroy();
	  	 		colorPicker1 = null;
	  	 		$('#colorPicker1Container').html("<div id=\"colorPicker1\"></div>");
	  	 	}
	  	 		
		  	 	colorPicker1 = new ColorPicker({
									            color:new esri.Color(proyectoactual_.configuracion.mapas[mapid].contenidos[$('#contenido').val()].color1),
									            showRecentColors: false,
									            showTransparencySlider: true,
									            showSuggestedColors: false,
									            required: true
									          }, "colorPicker1");
		  	 	colorPicker1.on('color-change',function(){
		  	 		var mapid = $("ul#tab_maps li.active").attr("id").substring(4);
		  	 		proyectoactual_.configuracion.mapas[mapid].contenidos[$("#contenido").val()].color1 = colorPicker1.color.toRgba();
		  	 		if(proyectoactual_.configuracion.mapas[mapid].contenidos[$("#contenido").val()].tipo==1)
		  	 		{
		  	 			proyectoactual_.configuracion.mapas[mapid].contenidos[$("#contenido").val()].transparencia = (255*colorPicker1.color.toRgba()[3]);
		  	 		} else {
		  	 			proyectoactual_.configuracion.mapas[mapid].contenidos[$("#contenido").val()].transparencia = colorPicker1.color.toRgba()[3];
		  	 		}
		  	 	});
	  	 	if(colorPicker2!=null){
	  	 		colorPicker2.destroy();
	  	 		colorPicker2 = null;
	  	 		$('#colorPicker2Container').html("<div id=\"colorPicker2\"></div>");
	  	 	}
		  	 	colorPicker2 = new ColorPicker({
									            color:new esri.Color(proyectoactual_.configuracion.mapas[mapid].contenidos[$('#contenido').val()].color2),
									            showRecentColors: false,
									            showTransparencySlider: true,
									            showSuggestedColors: false,
									            required: true
									          }, "colorPicker2");
		  	 	colorPicker2.on('color-change',function(){
		  	 		var mapid = $("ul#tab_maps li.active").attr("id").substring(4);
		  	 		proyectoactual_.configuracion.mapas[mapid].contenidos[$("#contenido").val()].color2= colorPicker2.color.toRgba();
		  	 	});
	  	 });
	  }

	  function personalizarEstilos()
	  {
	  	 var i = 0;
	  	 var mapid = $("ul#tab_maps li.active").attr("id").substring(4);
	  	 
	  	 $("#contenido").find('option').remove();
	  	 
	  	 for(i=0;i<proyectoactual.configuracion.mapas[mapid].contenidos.length;i++)
	  	 {
	  	 	if(proyectoactual.configuracion.mapas[mapid].contenidos[i].tipo!=4)
	  	 		$("#contenido").append($("<option></option>").attr("value", proyectoactual.configuracion.mapas[mapid].contenidos[i].id).text(proyectoactual.configuracion.mapas[mapid].contenidos[i].lblatributo1));
	  	 	else
	  	 		$("#contenido").append($("<option></option>").attr("value", proyectoactual.configuracion.mapas[mapid].contenidos[i].id).text(proyectoactual.configuracion.mapas[mapid].contenidos[i].lblatributo1 + " - " + proyectoactual.configuracion.mapas[mapid].contenidos[i].lblatributo2));
	  	 }

	  	 proyectoactual_ = proyectoactual;

	  	 require(["esri/dijit/ColorPicker"],function(ColorPicker){
	  	 	
	  	 	if(colorPicker1!=null){
	  	 		colorPicker1.destroy();
	  	 		colorPicker1 = null;
	  	 		$('#colorPicker1Container').html("<div id=\"colorPicker1\"></div>");
	  	 	}

		  	 	colorPicker1 = new ColorPicker({
									            color:new esri.Color(proyectoactual.configuracion.mapas[mapid].contenidos[0].color1),
									            showRecentColors: false,
									            showTransparencySlider: true,
									            showSuggestedColors: false,
									            required: true
									          }, "colorPicker1");
		  	 	colorPicker1.on('color-change',function(){
		  	 		var mapid = $("ul#tab_maps li.active").attr("id").substring(4);
		  	 		proyectoactual_.configuracion.mapas[mapid].contenidos[$("#contenido").val()].color1 = colorPicker1.color.toRgba();
		  	 		if(proyectoactual_.configuracion.mapas[mapid].contenidos[$("#contenido").val()].tipo==1)
		  	 		{
		  	 			proyectoactual_.configuracion.mapas[mapid].contenidos[$("#contenido").val()].transparencia = (255*colorPicker1.color.toRgba()[3]);
		  	 		} else {
		  	 			proyectoactual_.configuracion.mapas[mapid].contenidos[$("#contenido").val()].transparencia = colorPicker1.color.toRgba()[3];
		  	 		}
		  	 	});
	  	 	if(colorPicker2!=null){
	  	 		colorPicker2.destroy();
	  	 		colorPicker2 = null;
	  	 		$('#colorPicker2Container').html("<div id=\"colorPicker2\"></div>");
	  	 	}
		  	 	colorPicker2 = new ColorPicker({
									            color:new esri.Color(proyectoactual.configuracion.mapas[mapid].contenidos[0].color2),
									            showRecentColors: false,
									            showTransparencySlider: false,
									            showSuggestedColors: false,
									            required: true
									          }, "colorPicker2");
		  	 	colorPicker2.on('color-change',function(){
		  	 		var mapid = $("ul#tab_maps li.active").attr("id").substring(4);
		  	 		proyectoactual_.configuracion.mapas[mapid].contenidos[$("#contenido").val()].color2= colorPicker2.color.toRgba();
		  	 	});
	  	 });

	  	 $('#selEstiloRepresentacion2_').val(proyectoactual.configuracion.mapas[mapid].contenidos[0].tipo);

	  	 if(proyectoactual.configuracion.mapas[mapid].contenidos[0].simbolo=="STYLE_CIRCLE") {
	  		$('#selSimbolo').val(1);
	  		$('#imgsimbolo').attr('src',baseUrl + '/imgs/circle.png');
	  	}
	  	if(proyectoactual.configuracion.mapas[mapid].contenidos[0].simbolo=="STYLE_CROSS") {
	  		$('#selSimbolo').val(2);
	  		$('#imgsimbolo').attr('src',baseUrl + '/imgs/cross.png');
	  	}
	  	if(proyectoactual.configuracion.mapas[mapid].contenidos[0].simbolo=="STYLE_DIAMOND") {
	  		$('#selSimbolo').val(3);
	  		$('#imgsimbolo').attr('src',baseUrl + '/imgs/diamond.png');
	  	} 
	  	if(proyectoactual.configuracion.mapas[mapid].contenidos[0].simbolo=="STYLE_SQUARE") {
	  		$('#selSimbolo').val(4);
	  		$('#imgsimbolo').attr('src',baseUrl + '/imgs/square.png');
	  	}
	  	 
	  	 selectEstiloRepresentacion3();
	  	 
	  	 $('#set_estilos').modal('toggle');
	  }

	  function setEstilos()
	  {
	  	  proyectoactual = proyectoactual_;
	  	  var mapid = $("ul#tab_maps li.active").attr("id").substring(4);
  	 	  	  
	  	  if(gl_departamentos!=null) map.removeLayer(gl_departamentos);
	  	  if(gl_municipios!=null) map.removeLayer(gl_municipios);
		  	gl_departamentos = null;
        gl_municipios = null;
        
		  	var i = 0;
		  	
				for(i=0;i<gl_simbolos.length;i++)
		  	{
			 		map.removeLayer(gl_simbolos[i]);
		  	}

			  if($(".slider").slider()!=null){ 
			  	$(".slider").slider('destroy');
			  	$(".slider").html(''); 
					$(".slider").removeClass('ui-slider-pips'); 
			  }
				
			  gl_simbolos = new Array();
			  data_mapa = new Array;
			  timeslide = 0;

	  	  $.ajax({
			  	method: "POST",
			  	url: baseUrl + "/updateProyecto",
			  	data: { "_token":$('[name=_token]').val(),"id":proyectoactual.id,"configuracion":proyectoactual.configuracion } 
				}).done(function( data ) {
					// redraw proyect
					redrawContents(mapid,0);
					$('#set_estilos').modal('toggle');
		  	});
	  }

	  function selectEstiloRepresentacion()
	  {
	  	
	  	if($('#selEstiloRepresentacion').val()=="1") {
	  		$('#imgEstilo').attr('src',baseUrl + '/imgs/d1.png');
	  		$('#grpAtributo1').show();
	  		$('#grpAtributo2').hide();
	  		$('#grpAtributoColeccion').hide();
	  	}

	  	if($('#selEstiloRepresentacion').val()=="2") {
	  		$('#imgEstilo').attr('src',baseUrl + '/imgs/d2.png');
	  		$('#grpAtributo1').hide();
	  		$('#grpAtributo2').show();
	  		$('#grpAtributoColeccion').hide();
	  	}

	  	if($('#selEstiloRepresentacion').val()=="3") {
	  		$('#imgEstilo').attr('src',baseUrl + '/imgs/d3.png');
	  		$('#grpAtributo1').show();
	  		$('#grpAtributo2').hide();
	  		$('#grpAtributoColeccion').hide();
	  	}

	  	if($('#selEstiloRepresentacion').val()=="4") {
	  		$('#imgEstilo').attr('src',baseUrl + '/imgs/d4.png');
	  		$('#grpAtributo1').show();
	  		$('#grpAtributo2').show();
	  		$('#grpAtributoColeccion').hide();
	  	}

	  	if($('#selEstiloRepresentacion').val()=="5") {
	  		$('#imgEstilo').attr('src',baseUrl + '/imgs/d5.png');
	  		$('#grpAtributo1').hide();
	  		$('#grpAtributo2').hide();
	  		$('#grpAtributoColeccion').show();
	  	}
	  }

	  function selectEstiloRepresentacion2()
	  {
	  	if($('#selEstiloRepresentacion2').val()=="1") {
	  		$('#imgEstilo2').attr('src',baseUrl + '/imgs/d1.png');
	  		$('#divsimbolo').hide();
	  	}

	  	if($('#selEstiloRepresentacion2').val()=="2") {
	  		$('#imgEstilo2').attr('src',baseUrl + '/imgs/d2.png');
	  		$('#divsimbolo').show();
	  	}

	  	if($('#selEstiloRepresentacion2').val()=="3") {
	  		$('#imgEstilo2').attr('src',baseUrl + '/imgs/d3.png');
	  		$('#divsimbolo').show();
	  	}

	  	if($('#selEstiloRepresentacion2').val()=="4") {
	  		$('#imgEstilo2').attr('src',baseUrl + '/imgs/d4.png');
	  		$('#divsimbolo').show();
	  	}

	  	if($('#selEstiloRepresentacion2').val()=="5") {
	  		$('#imgEstilo2').attr('src',baseUrl + '/imgs/d5.png');
	  		$('#divsimbolo').show();
	  	}
	  }
	  
	  function selectEstiloRepresentacion3()
	  {
	  	if($('#selEstiloRepresentacion2_').val()=="1") {
	  		$('#imgEstilo2_').attr('src',baseUrl + '/imgs/d1.png');
	  		$('#divsimbolo').hide();
	  	}

	  	if($('#selEstiloRepresentacion2_').val()=="2") {
	  		$('#imgEstilo2_').attr('src',baseUrl + '/imgs/d2.png');
	  		$('#divsimbolo').show();
	  	}

	  	if($('#selEstiloRepresentacion2_').val()=="3") {
	  		$('#imgEstilo2_').attr('src',baseUrl + '/imgs/d3.png');
	  		$('#divsimbolo').show();
	  	}

	  	if($('#selEstiloRepresentacion2_').val()=="4") {
	  		$('#imgEstilo2_').attr('src',baseUrl + '/imgs/d4.png');
	  		$('#divsimbolo').show();
	  	}

	  	if($('#selEstiloRepresentacion2_').val()=="5") {
	  		$('#imgEstilo2_').attr('src',baseUrl + '/imgs/d5.png');
	  		$('#divsimbolo').show();
	  	}
	  }

	  function addVariableConsulta(variableid)
	  {
	  	var index;
	  	
	  	if(currentVarSelection==null)
	  	{
	  		currentVarSelection = new Array();
	  	}
	  	
	  	currentVarSelection = new Array();
	  	currentVarSelection.push(variableid);
      	  	
	  	getDesegregacionesVariables();
	  }

	  function getDesegregacionesVariables()
	  {
	  	if(currentVarSelection!=null)
	  	{
	  		var i = 0;
	  		var ids = "";
	  		
	  		for(i=0;i<currentVarSelection.length;i++)
	  		{
	  			if(ids=="") ids = "" + currentVarSelection[i];
	  			else ids += "," + currentVarSelection[i];
	  		}

	  		if(ids!="")
	  		{
	  			$.ajax({
			  		method: "POST",
			  		url: baseUrl + "/getDesegregacionVariable",
			  		data: { "ids":ids } 
				}).done(function( data ) {
					var option = "";
					var i = 0;
					$("#atributo1").empty();
					$("#atributo2").empty();
					$("#atributo3").empty();
					$("#escalaTiempo").empty();

					for(i=0;i<data.desegregacion.length;i++)
					{
						$("#atributo1").append($("<option></option>").attr("value", data.desegregacion[i].desegregacionid).text(data.desegregacion[i].desegregacion));
						$("#atributo2").append($("<option></option>").attr("value", data.desegregacion[i].desegregacionid).text(data.desegregacion[i].desegregacion));
						$("#atributo3").append($("<option></option>").attr("value", data.desegregacion[i].desegregacionid).text(data.desegregacion[i].desegregacion));
					}

					for(i=0;i<data.temporalidad.length;i++)
					{
						$("#escalaTiempo").append($("<option></option>").attr("value", data.temporalidad[i].tipo).text(data.temporalidad[i].tipo));
					}
				});
	  		}
	  	}
	  }

	  function getVariables()
	  {
	  	$.ajax({
			  method: "POST",
			  url: baseUrl + "/getVariables",
			  data: { "categoriaid":$("#categoria").val() } 
			}).done(function( data ) {
		    	var table = "";
		    	table = "<table id=\"tblVariables\" style=\"width:100%\" class=\"table table-striped table-bordered dt-responsive nowrap\">";
			    table += "<thead>";
				table += "<tr>";
				table += "<th width=\"250px\">Variable</th>";
				table += "</tr>";
			    table += "</thead>";
			    table += "<tbody>";
			    
			    var i = 0;
			    var checked = "";
			    var index = 0;
			    for(i=0;i<data.length;i++)
			    {    	
		    		index = $.inArray(("" + data[i].variableid),currentVarSelection);
		    		if(index > -1)
		    		{
		    			checked = "checked";
		    		}
		    		else
		    		{
		    			checked = "";
		    		}
		    		table += "<tr>";
		    		table += "<td>";
		    		table += "<label class=\"checkbox-inline\"><input type=\"checkbox\" id=\"chkvar" + data[i].variableid + "\" onclick=\"addVariableConsulta('" + data[i].variableid + "')\" value=\"" + data[i].variableid + "\" " + checked + "> "+ data[i].variable +"</label>";
		    		table += "</td>";
		    		table += "</tr>";
				}

		    	table += "</tbody>";
		    	table += "<tfoot>";
					table += "<tr>";
					table += "<th>Variable</th>";
					table += "</tr>";
			    table += "</tfoot>";
		    	table += "</table>";

		    	$("#tableContainer").html(table);
		    	
		    	$('#tblVariables').DataTable({
	                scrollX: true,
	                searching: false,
	                lengthChange: false,
	                language: {
	                    processing:     "Procesando...",
	                    search:         "Buscar:",
	                    lengthMenu:     "Mostrar _MENU_ filas",
	                    info:           "_START_ a _END_ de _TOTAL_ filas",
	                    infoEmpty:      "0 a 0 de 0 filas",
	                    infoFiltered:   "(filtradas de _MAX_ filas totales)",
	                    infoPostFix:    "",
	                    loadingRecords: "Cargando...",
	                    zeroRecords:    "Ning&uacute;n registro que mostrar",
	                    emptyTable:     "Tabla vac&iacute;a",
	                    paginate: {
	                       first:      "<<",
	                        previous:   "<",
	                        next:       ">",
	                        last:       ">>"
	                    }
	                }
	        	});
		  	});
	  }

	  function crearCapaBaseDatos()
	  {
	  	var a = 0;
			
			if($("#tclasificacion").val()==1)
	  	{                
	  		for(a=0; a < $("#spinner").val(); a++)
	  		{
				   if($("#clase" + (a + 1) + "_1").val()=="") { window.alert("Debe ingresar los valores de las clases."); return; }
				   if($("#clase" + (a + 1) + "_2").val()=="") { window.alert("Debe ingresar los valores de las clases."); return; }
				}
			}
			
			if(currentVarSelection != null && currentVarSelection.length > 0)
	  	{
	  		var mapaActual = null;
	  		var i = 0;
	  		for(i=0;i<proyectoactual.configuracion.mapas.length;i++){
	  			if(proyectoactual.configuracion.mapas[i].titulo_mapa==$("ul#tab_maps li.active").text())
	  			{
	  				if($("#selEstiloRepresentacion").val()==1) transparencia=255;
	  				else transparencia=1;
	  				
	  				var clases = new Array();
	  				var j = 0;
	  				if($("#tclasificacion").val()==1)
	  				{
	  					for(j=0; j < $("#spinner").val(); j++)
	  					{
	  						var clase = new Array();
	  						clase.push($("#clase" + (j + 1) + "_1").val());
	  						clase.push($("#clase" + (j + 1) + "_2").val());
	  						clases.push(clase);
	  					}
	  				}

	  				if(proyectoactual.configuracion.mapas[i].contenidos == null)
	  				{
	  					var contenido = {  "id":"0",
	  									   "tipo":$("#selEstiloRepresentacion").val(),
	  									   "origen":"BD",
	  									   "variables":currentVarSelection,
	  									   "atributo1":$("#atributo1").val(),
	  									   "atributo2":$("#atributo1").val(),
	  									   "lblatributo1":$("#atributo1 option:selected").text(),
	  									   "lblatributo2":$("#atributo1 option:selected").text(),
	  									   "atributosGragico":$("#atributo3").val(),
	  									   "escalaTiempo":$("#escalaTiempo").val(),
	  									   "resumenDatos":$("#chkResumen").prop("checked"),
	  									   "tipoResumen":$("[name='resumen']:checked").val() + "",
	  									   "etiquetas":$("#chkResumen").prop("checked"),
	  									   "campoetiqueta":$("#etiqueta").val(),
	  									   "clasificacion":$("#tclasificacion").val(),
	  									   "nclases":$("#spinner").val(),
	  									   "clases":clases,
	  									   "color1":HexToRGB($('#color1').val().toUpperCase(),1),
	  									   "color2":HexToRGB($('#color2').val().toUpperCase(),1),
	  									   "simbolo":"STYLE_CIRCLE",
	  									   "transparencia": transparencia };
	  					proyectoactual.configuracion.mapas[i].contenidos = new Array();
	  					proyectoactual.configuracion.mapas[i].contenidos.push(contenido);

	  					var serie = {
							"id": "0",
							"tipo": 1,
							"origen": 1,
							"variables": currentVarSelection,
							"atributo1":$("#atributo1").val(),
	  						"atributo2":$("#atributo2").val(),
	  						"lblatributo1":$("#atributo1 option:selected").text(),
	  						"lblatributo2":$("#atributo1 option:selected").text(),
	  						"escalaTiempo":$("#escalaTiempo").val(),
	  						"resumenDatos":$("#chkResumen").prop("checked") + "",
	  						"tipoResumen":$("[name='resumen']:checked").val()
						};
	  					proyectoactual.configuracion.graficos[i].series = new Array();
	  					proyectoactual.configuracion.graficos[i].series.push(serie);
	  				} else {
	  					var contenido = {  "id":"" + proyectoactual.configuracion.mapas[i].contenidos.length,
	  									   "tipo":$("#selEstiloRepresentacion").val(),
	  									   "origen":"BD",
	  									   "variables":currentVarSelection,
	  									   "atributo1":$("#atributo1").val(),
	  									   "atributo2":$("#atributo1").val(),
	  									   "lblatributo1":$("#atributo1 option:selected").text(),
	  									   "lblatributo2":$("#atributo1 option:selected").text(),
	  									   "atributosGragico":$("#atributo3").val(),
	  									   "escalaTiempo":$("#escalaTiempo").val(),
	  									   "resumenDatos":$("#chkResumen").prop("checked"),
	  									   "tipoResumen":$("[name='resumen']:checked").val() + "",
	  									   "etiquetas":$("#chkResumen").prop("checked"),
	  									   "campoetiqueta":$("#etiqueta").val(),
	  									   "clasificacion":$("#tclasificacion").val(),
	  									   "nclases":$("#spinner").val(),
	  									   "clases":clases,
	  									   "color1":HexToRGB($('#color1').val().toUpperCase(),1),
	  									   "color2":HexToRGB($('#color2').val().toUpperCase(),1),
	  									   "simbolo":"STYLE_CIRCLE",
	  									   "transparencia": transparencia };
	  					proyectoactual.configuracion.mapas[i].contenidos.push(contenido);

	  					var serie = {
							"id": proyectoactual.configuracion.graficos[i].series.length,
							"tipo": 1,
							"origen": 1,
							"variables": currentVarSelection,
							"atributo1":$("#atributo1").val(),
	  						"lblatributo1":$("#atributo1 option:selected").text(),
	  						"lblatributo2":$("#atributo1 option:selected").text(),
	  						"escalaTiempo":$("#escalaTiempo").val(),
	  						"resumenDatos":$("#chkResumen").prop("checked") + "",
	  						"tipoResumen":$("[name='resumen']:checked").val()
						};
						proyectoactual.configuracion.graficos[i].series.push(serie);
	  				}
	  				break;
	  			}
	  		}
	  		// update base de datos
	  		$.ajax({
			  	method: "POST",
			  	url: baseUrl + "/updateProyecto",
			  	data: { "_token":$('[name=_token]').val(),"id":proyectoactual.id,"configuracion":proyectoactual.configuracion } 
				}).done(function( data ) {
					// redraw proyect
					var mapid = $("ul#tab_maps li.active").attr("id").substring(4);
					redrawContents(mapid,0);
					getDataGrafico(mapid,0);
					$('#sel_informacion').modal('toggle');
				});
	  	} else {
	  		$().toastmessage('showToast', {
	  									text:'Debe seleccionar las variables a utilizar',
	  									type:"error",
	  									position:"middle-center"
	  								  });
	  	}
	  }
	  
	  function crearCapaArchivoDeDatos()
	  {
			  // Obtener detalles de la capa seleccionada
			  var a = 0;
			
				if($("#tclasificacion2").val()==1)
	  		{                
	  			for(a=0; a < $("#spinner2").val(); a++)
	  			{
				   	if($("#clase_" + (a + 1) + "_1").val()=="") { window.alert("Debe ingresar los valores de las clases."); return; }
				   	if($("#clase_" + (a + 1) + "_2").val()=="") { window.alert("Debe ingresar los valores de las clases."); return; }
					}
				}
				
				$.ajax({
			  	method: "POST",
			  	url: baseUrl + "/getDatailsCapaPersonal",
			  	data: { "_token":$('[name=_token]').val(),"id": $('#capasPersonales').val() } 
				}).done(function( data ) {
					var mapaActual = null;
	  			var i = 0;
	  			for(i=0;i<proyectoactual.configuracion.mapas.length;i++){
	  				
						if(proyectoactual.configuracion.mapas[i].titulo_mapa==$("ul#tab_maps li.active").text())
	  				{
							  if($("#selEstiloRepresentacion2").val()==1) transparencia=255;
	  						else transparencia=1;
	  						
	  						var clases = new Array();
	  						var j = 0;

	  						if($("#tclasificacion2").val()==1 || $("#tclasificacion2").val()==2)
	  						{
	  							for(j=0; j < $("#spinner_").val(); j++)
	  							{
	  								var clase = new Array();
	  								clase.push($("#clase_" + (j + 1) + "_1").val());
	  								clase.push($("#clase_" + (j + 1) + "_2").val());
	  								clases.push(clase);
	  							}
	  						} else {
									clases = cclases;
								}
								
								if(proyectoactual.configuracion.mapas[i].contenidos == null)
	  						{
	  								var contenido = {  "id":"0",
	  									"tipo":$("#selEstiloRepresentacion2").val(),
	  									"origen":"CP",
	  									"variables":$('#capasPersonales').val(),
	  									"atributo1":$("#atributo1_").val(),
	  									"atributo2":"",
	  									"lblatributo1":$("#atributo1_ option:selected").text(),
	  								  "lblatributo2":"",
	  									"atributosGragico":"",
	  									"escalaTiempo":"",
	  									"resumenDatos":"",
	  									"tipoResumen":"",
	  									"etiquetas":$("#chkResumen").prop("checked"),
	  									"campoetiqueta":$("#etiqueta").val(),
	  									"clasificacion":$("#tclasificacion2").val(),
	  									"nclases":$("#spinner_").val(),
	  									"clases":clases,
	  									"color1":HexToRGB($('#color1_').val().toUpperCase(),1),
	  									"color2":HexToRGB($('#color2_').val().toUpperCase(),1),
	  									"simbolo":"STYLE_CIRCLE",
	  									"transparencia": transparencia,
	  									"capaid":$('#capasPersonales').val(),
											"tipolayer":data[0].tipolayer,
											"tipocoord":data[0].tipocoord,
											"dm":data[0].dm };
	  									proyectoactual.configuracion.mapas[i].contenidos = new Array();
	  									proyectoactual.configuracion.mapas[i].contenidos.push(contenido);

	  								var serie = {
											"id": "0",
											"tipo": 1,
											"origen":2,
											"variables": $('#capasPersonales').val(),
											"atributo1":$("#atributo1_").val(),
	  									"atributo2":"",
	  									"lblatributo1":$("#atributo1_ option:selected").text(),
	  									"lblatributo2":"",
	  									"escalaTiempo":"",
	  									"resumenDatos":"",
	  									"tipoResumen":""
										};
	  								proyectoactual.configuracion.graficos[i].series = new Array();
	  								proyectoactual.configuracion.graficos[i].series.push(serie);
	  				} else {
	  					//.log("?");
							var contenido = {  "id":"" + proyectoactual.configuracion.mapas[i].contenidos.length,
	  									   "tipo":$("#selEstiloRepresentacion2").val(),
	  									"origen":"CP",
	  									"variables":$('#capasPersonales').val(),
	  									"atributo1":$("#atributo1_").val(),
	  									"atributo2":"",
	  									"lblatributo1":$("#atributo1_ option:selected").text(),
	  								  "lblatributo2":"",
	  									"atributosGragico":"",
	  									"escalaTiempo":"",
	  									"resumenDatos":"",
	  									"tipoResumen":"",
	  									"etiquetas":$("#chkResumen").prop("checked"),
	  									"campoetiqueta":$("#etiqueta").val(),
	  									"clasificacion":$("#tclasificacion2").val(),
	  									"nclases":$("#spinner_").val(),
	  									"clases":clases,
	  									"color1":HexToRGB($('#color1_').val().toUpperCase(),1),
	  									"color2":HexToRGB($('#color2_').val().toUpperCase(),1),
	  									"simbolo":"STYLE_CIRCLE",
	  									"transparencia": transparencia,
	  									"capaid":$('#capasPersonales').val(),
											"tipolayer":data[0].tipolayer,
											"tipocoord":data[0].tipocoord,
											"dm":data[0].dm };
											console.log(data);
											console.log(contenido);
	  								proyectoactual.configuracion.mapas[i].contenidos.push(contenido);

	  						var serie = {
								"id": proyectoactual.configuracion.graficos[i].series.length,
								"tipo": 2,
								"origen": 2,
								"variables": $('#capasPersonales').val(),
								"atributo1":$("#atributo1_ option:selected").val(),
	  						"atributo2":"",
	  						"lblatributo1":$("#atributo1_").text(),
	  						"lblatributo2":"",
	  						"escalaTiempo":"",
	  						"resumenDatos":"",
	  						"tipoResumen":""
							};
							proyectoactual.configuracion.graficos[i].series.push(serie);
	  				}
	  					break;
	  				}
	  			}
	  			
	  			// update base de datos
	  			$.ajax({
			  		method: "POST",
			  		url: baseUrl + "/updateProyecto",
			  		data: { "_token":$('[name=_token]').val(),"id":proyectoactual.id,"configuracion":proyectoactual.configuracion } 
					}).done(function( data ) {
						// redraw proyect
						var mapid = $("ul#tab_maps li.active").attr("id").substring(4);
						redrawContents(mapid,0);
						getDataGrafico(mapid,0);
						$('#sel_informacion2').modal('toggle');
       		});
				});
		}
																										g
	  function redrawProyecto(mapaid)
	  {
	  	 // titulo
	  	 $("#titulo_proyecto").html("<h2>" + proyectoactual.nombre + "<small> " + proyectoactual.titulo + "</small></h2>");
	  	 
	  	 // mapas
	  	 
	  	 var i = 0;
	  	 var tabs = "";
	  	 
	  	 tabs += "<ul id=\"tab_maps\" class=\"nav nav-tabs\" role=\"tablist\">";
	  	 
	  	 for(i=0;i<proyectoactual.configuracion.mapas.length;i++)
	  	 {
	  	 	var active = "";
	  	 	if(proyectoactual.configuracion.mapas[i].id==mapaid) active = "class=\"active\"";
	  	 	tabs += "<li id=\"mapa" + proyectoactual.configuracion.mapas[i].id + "\" onclick=\"cambiarTab(" + proyectoactual.configuracion.mapas[i].id + ");\" role=\"presentation\" " + active + "><a href=\"#home\" aria-controls=\"home\" role=\"tab\" data-toggle=\"tab\">" + proyectoactual.configuracion.mapas[i].titulo_mapa + "</a></li>";
	  	 }
       					
          tabs += "</ul>";
	  	 
	  	 $('#tab_container').html(tabs);
	  }

	  function getChartType(tipo)
	  {
	  	if(tipo==1) return 'column';
	  	if(tipo==2) return 'bar';
	  	if(tipo==3) return 'line';
	  	if(tipo==4) return 'area';
	  	if(tipo==5) return 'pie';
	  }

	  function drawCharts(tempoid)
	  {
	  	var i = 0;
	  	proyectoactual.configuracion.graficos.length % 2 == 0
	  	
	  	var divChart = "";
	  	
	  	for(i=0;i<proyectoactual.configuracion.graficos.length;i++)
	  	{
	  		if(i % 2 == 0 && proyectoactual.configuracion.graficos.length % 2 == 0)
	  		{
	  			divChart += "<div class=\"row\">";
	  		}

	  		if(i == proyectoactual.configuracion.graficos.length - 1 && proyectoactual.configuracion.graficos.length % 2 != 0)
	  		{
	  			divChart += "<div class=\"row\">";
	  		}

	  		if((proyectoactual.configuracion.graficos.length % 2 != 0) && (i == proyectoactual.configuracion.graficos.length - 1))
	  		{
	  			divChart += "<div id=\"chart" + proyectoactual.configuracion.graficos[i].id +"\" class=\"col-lg-12\" style=\"height:350px;\"></div>";
	  		} else {
	  			divChart += "<div id=\"chart" + proyectoactual.configuracion.graficos[i].id +"\" class=\"col-lg-6\" style=\"height:350px;\"></div>";
	  		}

	  		if(i % 2 != 0)
	  		{
	  			divChart += "</div>";
	  		}
	  	}
	  	
	  	$('#graficos').html(divChart);
	  	var categories = null;
	  	for(i=0;i<proyectoactual.configuracion.graficos.length;i++)
	  	{
					var series = new Array();
	  			var j = 0;
	
					if(tempoid>0 && (proyectoactual.configuracion.graficos[i].series[0].resumenDatos=="true" || proyectoactual.configuracion.graficos[i].series[0].resumenDatos==true)) { continue; }
	  			
					if(proyectoactual.configuracion.graficos[i].series==null) { console.log(":-/"); return; }  
  			
					for(j=0;j<proyectoactual.configuracion.graficos[i].series.length;j++)
	  			{
			  		console.log("j:"+j);
						if(proyectoactual.configuracion.graficos[i].series[j].origen==1 || proyectoactual.configuracion.graficos[i].series[j].origen=="1"){
								if(tempoid==null || tempoid == 0){
								    tempoid = data_grafico[i][j].temporalidad[0].tempoid;
								}
								console.log(tempoid); 
								if(categories==null) categories = $.map(data_grafico[proyectoactual.configuracion.graficos[i].id][proyectoactual.configuracion.graficos[i].series[j].id].data_temporalidad[tempoid][proyectoactual.configuracion.graficos[i].series[j].atributo1],function(n,i){ return n.departamento; })
			  				if(proyectoactual.configuracion.graficos[i].series[j].tipo!=5) {
				  				try{
		              	series.push({
						        	type:getChartType(proyectoactual.configuracion.graficos[i].series[j].tipo),
						        	name: proyectoactual.configuracion.graficos[i].series[j].lblatributo1,
						        	data: $.map(data_grafico[proyectoactual.configuracion.graficos[i].id][proyectoactual.configuracion.graficos[i].series[j].id].data_temporalidad[tempoid][proyectoactual.configuracion.graficos[i].series[j].atributo1],function(n,i){ return n.value * 1; })
						      	});
		            	} 
		            	catch(err)
		            	{
		              	console.log(err);
		            	}
			  				} 
			  				else 
			  				{
			  					var z = 0;
			  					var data = new Array();
			  				
			  					for(z=0;z<data_grafico[proyectoactual.configuracion.graficos[i].id][proyectoactual.configuracion.graficos[i].series[j].id].data_temporalidad[tempoid][proyectoactual.configuracion.graficos[i].series[j].atributo1].length;z++)
			  					{
			  						data.push({ name: data_grafico[proyectoactual.configuracion.graficos[i].id][proyectoactual.configuracion.graficos[i].series[j].id].data_temporalidad[tempoid][proyectoactual.configuracion.graficos[i].series[j].atributo1][z].departamento,
			  								y: data_grafico[proyectoactual.configuracion.graficos[i].id][proyectoactual.configuracion.graficos[i].series[j].id].data_temporalidad[tempoid][proyectoactual.configuracion.graficos[i].series[j].atributo1][z].value * 1
			  							 });
			  					}
			  					if(data.length>0){
		  	  					if(getChartType(proyectoactual.configuracion.graficos[i].series.length>1))
		  	  					{
		  		  					series.push({
		  					        type:getChartType(proyectoactual.configuracion.graficos[i].series[j].tipo),
		  					        name: proyectoactual.configuracion.graficos[i].series[j].lblatributo1,
		  					        data: data,
		  					        size:50,
		  					        center: ['50%','20%']
		  					    	});
		  	  					} else {
		  	  						series.push({
		  					        type:getChartType(proyectoactual.configuracion.graficos[i].series[j].tipo),
		  					        name: proyectoactual.configuracion.graficos[i].series[j].lblatributo1,
		  					        data: data
		  					    	});
		  	  					}
		            	}
			  				} 
						} else {
							console.log(i);
						  if(typeof data_grafico[i][j][0].campos === 'string') data_grafico[i][j][0].campos = eval('(' + data_grafico[i][j][0].campos + ')'); 
							if(typeof data_grafico[i][j][0].data === 'string') data_grafico[i][j][0].data = eval('(' + data_grafico[i][j][0].data + ')'); 
							
							var index = data_grafico[i][j][0].campos.indexOf(proyectoactual.configuracion.graficos[i].series[j].atributo1);
			  	   	var data = new Array();
						
							for(k=0;k<data_grafico[i][j][0].data.length;k++)
			  	   	{
									data.push(data_grafico[i][j][0].data[k][index][Object.keys(data_grafico[i][j][0].data[k][index])[0]]);
							}
							
							series.push({
				        	type:getChartType(proyectoactual.configuracion.graficos[i].series[j].tipo),
				        	name: proyectoactual.configuracion.graficos[i].series[j].lblatributo1,
				        	data: data
				      });
						}
	  			}
	  		
				$('#chart' + i).highcharts({
		        title: {
		            text: proyectoactual.configuracion.graficos[i].titulo,
		            x: -20 //center
		        },
		        xAxis: {
		            categories: categories
		        },
		        yAxis: {
		            title: {
		                text: 'Unidad'
		            },
		            plotLines: [{
		                value: 0,
		                width: 1,
		                color: '#808080'
		            }]
		        },
		        legend: {
		            layout: 'vertical',
		            align: 'right',
		            verticalAlign: 'middle',
		            borderWidth: 0
		        },
		        series: series
    		});
			}
    }

	  function setTipoGrafico()
	  {
	  	 var i = 0;
	  	 
	  	 $("#selgrafico").find('option').remove();
	  	 
	  	 for(i=0;i<proyectoactual.configuracion.graficos.length;i++)
	  	 {
	  	 	$("#selgrafico").append($("<option></option>").attr("value", proyectoactual.configuracion.graficos[i].id).text(proyectoactual.configuracion.graficos[i].titulo));
	  	 }

	  	 $("#selserie").find('option').remove();

	  	 for(i=0;i<proyectoactual.configuracion.graficos[$("#selgrafico").val()].series.length;i++)
	  	 {
	  	 	$("#selserie").append($("<option></option>").attr("value", proyectoactual.configuracion.graficos[$('#selgrafico').val()].series[i].id).text(proyectoactual.configuracion.graficos[$('#selgrafico').val()].series[i].lblatributo1));
	  	 }

	  	 $("#seltipografico").val(proyectoactual.configuracion.graficos[$('#selgrafico').val()].series[$('#selserie').val()].tipo);

	  	 $('#sel_editchart').modal('toggle');
	  }

	  function changeSelGrafico()
	  {
	  	$("#selserie").find('option').remove();

	  	 for(i=0;i<proyectoactual.configuracion.graficos[$("#selgrafico").val()].series.length;i++)
	  	 {
	  	 	$("#selserie").append($("<option></option>").attr("value", proyectoactual.configuracion.graficos[$('#selgrafico').val()].series[i].id).text(proyectoactual.configuracion.graficos[$('#selgrafico').val()].series[i].lblatributo1));
	  	 }

	  	 $("#seltipografico").val(proyectoactual.configuracion.graficos[$('#selgrafico').val()].series[$('#selserie').val()].tipo);
	  }

	  function changeSelSerie()
	  {
	  	 $("#seltipografico").val(proyectoactual.configuracion.graficos[$('#selgrafico').val()].series[$('#selserie').val()].tipo);
	  }

	  function cambiarTab(mapaid)
	  {
	  	 var i = 0;
	  	 
	  	 for(i=0;i<proyectoactual.configuracion.mapas.length;i++)
	  	 {
	  	 	$('#mapa' + i).removeClass('active');
	  	 }

	  	 $('#mapa' + mapaid).addClass('active');

	  	 if(gl_departamentos!=null) map.removeLayer(gl_departamentos);
		 	 gl_departamentos = null;
		 	 
		 	 if(gl_municipios!=null) map.removeLayer(gl_municipios);
		 	 gl_municipios = null;

			 var i = 0;
			 for(i=0;i<gl_simbolos.length;i++)
			 {
				map.removeLayer(gl_simbolos[i]);
			 }
	
			 if($(".slider").slider()!=null) { 
			 	$(".slider").slider('destroy');
			 	$(".slider").html(''); 
				$(".slider").removeClass('ui-slider-pips'); 
			 }
				
			 gl_simbolos = new Array();
			 data_mapa = new Array;
			 timeslide = 0;
			 gl_departamentos = null;
	
			 redrawContents(mapaid,0);

	  }

	  function getProyecto(id,mapid)
	  {
	  	if(proyectoactual==null || id!=proyectoactual.id)
	  	{
		  	$.ajax({
			  method: "POST",
			  url: baseUrl + "/getProyecto",
			  data: { "_token":$('[name=_token]').val(),"id":id } 
			}).done(function( data ) {
				proyectoactual.id = data[0].proyectoid;
				proyectoactual.nombre = data[0].nombre;
				proyectoactual.titulo = data[0].descripcion;
				proyectoactual.configuracion = eval('(' + data[0].configuracion + ')');
				
				if(gl_departamentos!=null) map.removeLayer(gl_departamentos);
				gl_departamentos = null;

				var i = 0;
				for(i=0;i<gl_simbolos.length;i++)
				{
					map.removeLayer(gl_simbolos[i]);
				}

				if($(".slider").slider()!=null) { 
					$(".slider").slider('destroy');
					$(".slider").html(''); 
					$(".slider").removeClass('ui-slider-pips');  
				}
				
				gl_simbolos = new Array();
				data_mapa = new Array;
				timeslide = 0;
				gl_departamentos = null;

				redrawProyecto(mapid);
				redrawContents(mapid,0);
				$('#graficos').html('');
			});
		}
	  }

	  function drawPointLayerDepartamento(mapaid,id,temporalidad,atributo,atributo2,simbolo,color1,color2,transparencia,tipo)
	  {		
	  	    try{
          if(temporalidad==null) return;
	  	    require(["esri/geometry/Point",
               "esri/graphic",
               "esri/symbols/SimpleMarkerSymbol",
               "esri/symbols/SimpleLineSymbol",
               "esri/Color"],function(Point,Graphic,SimpleMarkerSymbol,SimpleLineSymbol,Color){
		  	   var layer = new esri.layers.GraphicsLayer();
		  	   var i = 0;
		  	   
           var max = Math.max.apply(Math,$.map(data_mapa[id].data_temporalidad[temporalidad][atributo],function(n,i){ return n.value * 1; }));
           var colorscale = d3.scale.linear().domain([1,(proyectoactual.configuracion.mapas[mapaid].contenidos[id].nclases * 1)],function(n,i){ return n.value * 1; }).range([color1,color2]);
		  	   var quantize = d3.scale.quantize().domain([0,max]).range([10,52]);

           if(proyectoactual.configuracion.mapas[mapaid].contenidos[id].clasificacion=="2")
           {
            	// Intervalos iguales
            	var max = Math.max.apply(Math,$.map(data_mapa[id].data_temporalidad[temporalidad][atributo],function(n,i){ return n.value * 1; }));
      	   		var min = Math.min.apply(Math,$.map(data_mapa[id].data_temporalidad[temporalidad][atributo],function(n,i){ return n.value * 1; }));
      	   		var rango = max - min;
      	   		ic = round(rango / proyectoactual.configuracion.mapas[mapaid].contenidos[id].nclases,2);
      	   		var a = 0;
      	   		var clases = new Array();
      	   		
      	   		for(a=0;a<proyectoactual.configuracion.mapas[mapaid].contenidos[id].nclases;a++)
      	   		{
      	   			var clase = new Array();
      	   			clase.push(min);
      	   			
      	   			if(a<proyectoactual.configuracion.mapas[mapaid].contenidos[id].nclases-1) clase.push(round(min+ic,2));
      	   			else(clase.push(max));
      	   			clases.push(clase);
      	   			min = min + ic;
      	   		}
      
      	   		proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases = clases;
           }

            if(proyectoactual.configuracion.mapas[mapaid].contenidos[id].clasificacion=="3")
            {
            	var clases = new Array();
            	var values = $.map(data_mapa[id].data_temporalidad[temporalidad][atributo],function(n,i){ return n.value * 1; });
          		values.sort(function(a, b){return a-b});
          		var clase = new Array();
          		clase.push(values[0]);
          		clase.push(values[3]);
          		clases.push(clase);
      
          		clase = new Array();
          		clase.push(values[4]);
          		clase.push(values[7]);
          		clases.push(clase);
      
          		clase = new Array();
          		clase.push(values[8]);
          		clase.push(values[10]);
          		clases.push(clase);
      
          		clase = new Array();
          		clase.push(values[11]);
          		clase.push(values[13]);
          		clases.push(clase);
      
          		proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases = clases;  	
            }

            if(proyectoactual.configuracion.mapas[mapaid].contenidos[id].clasificacion=="4")
            {
            	var clases = new Array();
            	var values = $.map(data_mapa[id].data_temporalidad[temporalidad][atributo],function(n,i){ return n.value * 1; });
          		values.sort(function(a, b){return a-b});
          		var clase = new Array();
          		clase.push(values[0]);
          		clase.push(values[2]);
          		clases.push(clase);
      
          		clase = new Array();
          		clase.push(values[3]);
          		clase.push(values[5]);
          		clases.push(clase);
      
          		clase = new Array();
          		clase.push(values[6]);
          		clase.push(values[8]);
          		clases.push(clase);
      
          		clase = new Array();
          		clase.push(values[9]);
          		clase.push(values[11]);
          		clases.push(clase);
      
          		clase = new Array();
          		clase.push(values[12]);
          		clase.push(values[13]);
          		clases.push(clase);
      
          		proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases = clases; 
            }

		  	   for(i=0;i<departamentos_point.length;i++)
		  	   {
		  	   		var geojson = eval('(' + departamentos_point[i].geojson + ')');
		  	   		var point = new Point(geojson.coordinates[0],geojson.coordinates[1]);
			   		  point = esri.geometry.geographicToWebMercator(point);
			   		  var attr = {};
			   		  var line = new SimpleLineSymbol();
					    line.setColor(new Color([255, 255, 255, 1]));
			   		  var marker = new SimpleMarkerSymbol();
			   		
			   		  if(simbolo=="STYLE_CIRCLE")
			   		  {
			   			   marker.setStyle(SimpleMarkerSymbol.STYLE_CIRCLE);
			   		  }

			   		  if(simbolo=="STYLE_CROSS")
			   		  {
			   			   marker.setStyle(SimpleMarkerSymbol.STYLE_CROSS);
			   		  }

			   		  if(simbolo=="STYLE_DIAMOND")
			   		  {
			   			   marker.setStyle(SimpleMarkerSymbol.STYLE_DIAMOND);
			   		  }

			   		  if(simbolo=="STYLE_SQUARE")
			   		  {
			   			   marker.setStyle(SimpleMarkerSymbol.STYLE_SQUARE);
			   		  }
			   		  
			   		  for(k=0;k<data_mapa[id].data_temporalidad[temporalidad][atributo].length;k++)
			   		  {
			   			   if(departamentos_point[i].departamento==data_mapa[id].data_temporalidad[temporalidad][atributo][k].departamento)
			   			   {
			   				    var l = 1;
		        				for(l=1;l<=proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases.length;l++)
		        				{
		        						if(data_mapa[id].data_temporalidad[temporalidad][atributo][k].value >= (proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases[l-1][0] * 1) && data_mapa[id].data_temporalidad[temporalidad][atributo][k].value <= (proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases[l-1][1]*1))
		        						{
		        							color = HexToRGB(colorscale(l).toUpperCase(),transparencia);
		        						}
		        				}
                    if(tipo==2){
			   					     marker.setOutline(line);
			   					     marker.setColor(new Color(color));
			   				    }
			   				    if(tipo==3){
			   					     marker.setColor(color2);
			   					     marker.setOutline(line);
			   					     marker.setSize(quantize(data_mapa[id].data_temporalidad[temporalidad][atributo][k].value));
			   				    }
			   				    if(tipo==4){
			   					     marker.setColor(new Color(color));
			   					     marker.setOutline(line);
			   					     marker.setSize(quantize(data_mapa[id].data_temporalidad[temporalidad][atributo2][k].value));
			   				    }
			   				    break;
			   			   }
			   		  }
			   		
			   		var graphic = new Graphic(point,marker,attr,null);
			   		layer.add(graphic);
		  	   }

		  	   map.addLayer(layer,3);
		  	   gl_simbolos.push(layer);
		  	});
        } catch (err) {
           console.log(err);
        }
	  }
	  
	  function drawPointLayerCP(mapaid,id,atributo,tipolayer,tipocoord,dm,simbolo,color1,color2,transparencia,tipo)
	  {
	  	  console.log("Id" + id);
				try
				{
					 require(["esri/geometry/Point",
               "esri/graphic",
               "esri/symbols/SimpleMarkerSymbol",
               "esri/symbols/SimpleLineSymbol",
               "esri/Color"],function(Point,Graphic,SimpleMarkerSymbol,SimpleLineSymbol,Color){
		  	   			var layer = new esri.layers.GraphicsLayer();
		  	   			var i = 0;
		  	   			
		  	   			var index = data_mapa[id][0].campos.indexOf(atributo);
		  	   			console.log("Index:" + index);
								var data = new Array();
		  	   			
								for(k=0;k<data_mapa[id][0].data.length;k++)
		  	   			{
								    data.push(data_mapa[i][0].data[k][index][Object.keys(data_mapa[i][0].data[k][index])[0]]);
								}                                             
								
								console.log(data);

								var max = Math.max.apply(Math,data);
								var colorscale = d3.scale.linear().domain([1,(proyectoactual.configuracion.mapas[mapaid].contenidos[id].nclases * 1)],function(n,i){ return n.value * 1; }).range([color1,color2]);
           			var quantize = d3.scale.quantize().domain([0,max]).range([10,52]);
           			console.log("dm:" + dm);
								if(dm==2)
								{
									for(i=0;i<municipios_point.length;i++)
		  	   				{	
		  	   				  var geojson = eval('(' + municipios_point[i].geojson + ')');
			  	   				var point = new Point(geojson.coordinates[0],geojson.coordinates[1]);
				   		  		point = esri.geometry.geographicToWebMercator(point);
				   		  		var attr = {};
				   		  		var line = new SimpleLineSymbol();
						    		line.setColor(new Color([255, 255, 255, 1]));
				   		  		var marker = new SimpleMarkerSymbol();
			   		
						   		  if(simbolo=="STYLE_CIRCLE")
						   		  {
						   			   marker.setStyle(SimpleMarkerSymbol.STYLE_CIRCLE);
						   		  }
			
						   		  if(simbolo=="STYLE_CROSS")
						   		  {
						   			   marker.setStyle(SimpleMarkerSymbol.STYLE_CROSS);
						   		  }
	
						   		  if(simbolo=="STYLE_DIAMOND")
						   		  {
						   			   marker.setStyle(SimpleMarkerSymbol.STYLE_DIAMOND);
						   		  }
			
						   		  if(simbolo=="STYLE_SQUARE")
						   		  {
						   			   marker.setStyle(SimpleMarkerSymbol.STYLE_SQUARE);
						   		  }
				   		      var value = null;
				   		      
						   		  for(k=0;k<data_mapa[id][0].data.length;k++)
						   		  {
						   			  if(data_mapa[id][0].data[k][index][municipios[i].codmuni]!=null)
											{
											    value = data_mapa[id][0].data[k][index][municipios[i].codmuni];
											    break;
											}
										}	
					        	if(value==null) break;	
										for(l=1;l<=proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases.length;l++)
					        	{
					        			if(value >= (proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases[l-1][0] * 1) && value <= (proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases[l-1][1]*1))
					        			{
					        					color = HexToRGB(colorscale(l).toUpperCase(),transparencia);
					        			}
					        	}
			                    
										if(tipo==2){
						   			   marker.setOutline(line);
						   			   marker.setColor(new Color(color));
						   			}
						   				
						   			if(tipo==3){
						   			   marker.setColor(color2);
						   			   marker.setOutline(line);
						   			   marker.setSize(quantize(value));
						   			}
						   				
						   			if(tipo==4){
						   			   marker.setColor(new Color(color));
						   			   marker.setOutline(line);
						   			   marker.setSize(quantize(value));
						   			}
						   		  				   		
				   					var graphic = new Graphic(point,marker,attr,null);
				   					layer.add(graphic);
		  	   			  }
		  	   			  map.addLayer(layer,1);
		  	   				gl_simbolos.push(layer);
								}
								else
								{
									 console.log(departamentos_point.length);
									 for(i=0;i<departamentos_point.length;i++)
						  	   {
						  	   		var geojson = eval('(' + departamentos_point[i].geojson + ')');
						  	   		var point = new Point(geojson.coordinates[0],geojson.coordinates[1]);
							   		  point = esri.geometry.geographicToWebMercator(point);
							   		  var attr = {};
							   		  var line = new SimpleLineSymbol();
									    line.setColor(new Color([255, 255, 255, 1]));
							   		  var marker = new SimpleMarkerSymbol();
							   		  console.log("Simbolo:" + simbolo);
							   		  if(simbolo=="STYLE_CIRCLE")
							   		  {
							   			   marker.setStyle(SimpleMarkerSymbol.STYLE_CIRCLE);
							   		  }
				
							   		  if(simbolo=="STYLE_CROSS")
							   		  {
							   			   marker.setStyle(SimpleMarkerSymbol.STYLE_CROSS);
							   		  }
				
							   		  if(simbolo=="STYLE_DIAMOND")
							   		  {
							   			   marker.setStyle(SimpleMarkerSymbol.STYLE_DIAMOND);
							   		  }
				
							   		  if(simbolo=="STYLE_SQUARE")
							   		  {
							   			   marker.setStyle(SimpleMarkerSymbol.STYLE_SQUARE);
							   		  }
							   		  
											var value = null;
				   			      for(k=0;k<data_mapa[id][0].data.length;k++)
							   		  {
								   			  if(data_mapa[id][0].data[k][index][departamentos[i].coddepto]!=null)
													{
													    value = data_mapa[id][0].data[k][index][departamentos[i].coddepto];
													    break;
													}
  										}

											var l = 1;
						        				
						        	for(l=1;l<=proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases.length;l++)
						        	{
						        			if(value >= (proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases[l-1][0] * 1) && value <= (proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases[l-1][1]*1))
						        			{
						        					color = HexToRGB(colorscale(l).toUpperCase(),transparencia);
						        			}
						        	}
						        				
				              if(tipo==2){
							   			     marker.setOutline(line);
							   			     marker.setColor(new Color(color));
							   			}
							   			if(tipo==3){
							   			     marker.setColor(color2);
							   			     marker.setOutline(line);
							   			     marker.setSize(quantize(value));
							   			}
							   			if(tipo==4){
							   			    marker.setColor(new Color(color));
							   			    marker.setOutline(line);
							   			    marker.setSize(quantize(value));
							   			}
							   		
							   			var graphic = new Graphic(point,marker,attr,null);
							   			layer.add(graphic);
						  	   }
						  	   map.addLayer(layer,2);
		  	   				 gl_simbolos.push(layer);
								}           			
		  	  	});
	  	  }
	  	  catch(ex)
	  	  {
	  	  	console.log("Ex:" + ex);
				}
		}

	  function getDataGrafico(graficoid,serieid)
	  {
			var i = serieid;
	  	if(graficoid<proyectoactual.configuracion.graficos.length){
				if(proyectoactual.configuracion.mapas[graficoid].contenidos!=null && proyectoactual.configuracion.mapas[graficoid].contenidos.length > 0)
	  		{
	  			if(serieid<proyectoactual.configuracion.mapas[graficoid].contenidos.length)
	  			{
	  				var contenido = proyectoactual.configuracion.graficos[graficoid].series[serieid];
	  				var ids = "";
	  				var j = 0;
		  			for(k=0;k<contenido.variables.length;k++){
		  				if(ids=="") ids = "" + contenido.variables[k];
		  				else ids += "," + contenido.variables[k];
		  			}

		  			var desegregacion = "";

		  			desegregacion = contenido.atributo1 + "," + contenido.atributo2;
						if(proyectoactual.configuracion.graficos[graficoid].series[serieid].origen==1 || proyectoactual.configuracion.graficos[graficoid].series[serieid].origen=="1"){
							$.ajax({
						  	method: "POST",
						  	url: baseUrl + "/getData",
						  	data: { "ids":ids, 
						  		  "desegregaciones":desegregacion, 
						  		  "escalatiempo": contenido.escalaTiempo,
						  		  "resumenDatos": contenido.resumenDatos,
						  		  "tipoResumen": contenido.tipoResumen,
						  		  "i":i
						  	} 
						  }).done(function( data ) {
	
								if(data_grafico==null) 
								{ 
									data_grafico = new Array(); 
								}
							
								if(data_grafico[graficoid]==null)
								{
									data_grafico[graficoid] = new Array();
								}
	
								data_grafico[graficoid][contenido.id] = data;
	
								getDataGrafico(graficoid,serieid+1);
	
							});
						} else {
							
							$.ajax({
						  	method: "POST",
						  	url: baseUrl + "/getDataCP",
						  	data: { "capaid":ids, 
						  		  	  "i":i
						  	} 
						  }).done(function( data ) {
	
								if(data_grafico==null) 
								{ 
									data_grafico = new Array(); 
								}
							
								if(data_grafico[graficoid]==null)
								{
									data_grafico[graficoid] = new Array();
								}
	
								data_grafico[graficoid][contenido.id] = data;
	
								getDataGrafico(graficoid,serieid+1);
	
							});
						}
				} else { 
					getDataGrafico(graficoid+1,0); 
				} 
			} 
		}  else {
			
			var tempoid = null;
			if(data_grafico[0][0].temporalidad!=null)
			 tempoid = data_grafico[0][0].temporalidad[0].tempoid;
			else tempoid = 0;
			
			initchart=1;
			
			if(proyectoactual.configuracion.graficos[0].series[0].resumenDatos=="false" || proyectoactual.configuracion.graficos[0].series[0].resumenDatos==false) {
				drawCharts(tempoid); 
			} else {
				drawCharts(0);
			}
		}
	}

	  function redrawContents(mapaid,contenidoid)
	  {
	  	var timeslide = 0;
	  	var i = contenidoid;
	  	if(proyectoactual.configuracion.mapas[mapaid].contenidos!=null && proyectoactual.configuracion.mapas[mapaid].contenidos.length > 0)
	  	{
	  		if(contenidoid<proyectoactual.configuracion.mapas[mapaid].contenidos.length)
	  		{
	  			var contenido = proyectoactual.configuracion.mapas[mapaid].contenidos[contenidoid];
	  			if(contenido.origen=="BD"){
						var ids = "";
	  				var j = 0;
		  			for(k=0;k<contenido.variables.length;k++){
		  				if(ids=="") ids = "" + contenido.variables[k];
		  				else ids += "," + contenido.variables[k];
		  			}

		  			var desegregacion = "";

		  			desegregacion = contenido.atributo1 + "," + contenido.atributo2;

		  			$.ajax({
				  		method: "POST",
				  		url: baseUrl + "/getData",
				  		data: { "ids":ids, 
				  		  "desegregaciones":desegregacion, 
				  		  "escalatiempo": contenido.escalaTiempo,
				  		  "resumenDatos": contenido.resumenDatos,
				  		  "tipoResumen": contenido.tipoResumen,
				  		  "i":i
				  		} 
						}).done(function( data ) {
							if(data_mapa==null) data_mapa = new Array();
					
							data_mapa[contenido.id] = data;

					
		  				if(timeslide==0) {			
			  				if(proyectoactual.configuracion.mapas[mapaid].contenidos[0].resumenDatos=="true"){	
				  				$('#scaleyear').hide();
				  				$('.slider').html("<div style=\"text-align:center;\"><strong>A&ntilde;os: " + data_mapa[0].temporalidad[0].yyyy + " a " + data_mapa[0].temporalidad[data_mapa[0].temporalidad.length-1].yyyy + "</strong></div>");
							} else {
								
									timeslide=1;
			  					sliderValues = new Array();
			  				
				  				var k = 0;
				  				if(proyectoactual.configuracion.mapas[mapaid].contenidos[data_mapa[contenido.id].i].escalaTiempo=='ANUAL' || proyectoactual.configuracion.mapas[mapaid].contenidos[data_mapa[contenido.id].i].escalaTiempo=='RANGO') {
				  					$('#scaleyear').hide();
					  				
					  				for(k=0;k<data_mapa[contenido.id].temporalidad.length;k++)
					  				{
					  					
					  					if(proyectoactual.configuracion.mapas[mapaid].contenidos[data_mapa[contenido.id].i].escalaTiempo=='ANUAL'){
					  						sliderValues.push(data_mapa[contenido.id].temporalidad[k].yyyy * 1);
					  					}
					  				}

					  				if(sliderValues.length>0)
									  {
										$(".slider")
										    .slider({
										        max: sliderValues[sliderValues.length-1],
										        min: sliderValues[0],
										        range: 'min',
										        value: sliderValues[0],
										        step: 1,
										        change: function ( event, ui ) {
										        	
										        	var i = 0;
										        	
										        	for(i=0;i<gl_simbolos.length;i++)
										        	{
										        		map.removeLayer(gl_simbolos[i]);
										        	}

										        	gl_simbolos = new Array();
										        	for(i=0;i<proyectoactual.configuracion.mapas[mapaid].contenidos.length;i++)
										        	{
										        		if(proyectoactual.configuracion.mapas[mapaid].contenidos[i].origen=="BD"){
																	if(proyectoactual.configuracion.mapas[mapaid].contenidos[i].tipo==1)
											        		{
											        			if(gl_departamentos==null) addLayerDepartamento(mapaid,contenido.id,getTemporalidad(contenido.id,proyectoactual.configuracion.mapas[mapaid].contenidos[i].escalaTiempo,ui.value,""),contenido.atributo1,contenido.transparencia);
											        			else
											        			{
											        				var tempoid = getTemporalidad(contenido.id,proyectoactual.configuracion.mapas[mapaid].contenidos[i].escalaTiempo,ui.value,"");
											        				if(tempoid==null) return;
											        				var ldata = null;
											        				var ldata2 = null;
											        				ldata = data_mapa[contenido.id].data_temporalidad[tempoid][contenido.atributo1];
																	    if(contenido.tipo==4) ldata2 = data_mapa[contenido.id].data_temporalidad[tempoid][contenido.atributo2];
											        				var j = 0;
	                                    
											        				for(j=0;j<ldata.length;j++)
												        			{
												        				var max = Math.max.apply(Math,$.map(data_mapa[contenido.id].data_temporalidad[tempoid][contenido.atributo1],function(n,i){ return n.value * 1; }))
												        				setDeptoColor(ldata[j].departamento,ldata[j].value,max,new esri.Color(proyectoactual.configuracion.mapas[mapaid].contenidos[i].color1).toHex(),new esri.Color(proyectoactual.configuracion.mapas[mapaid].contenidos[i].color2).toHex(),proyectoactual.configuracion.mapas[mapaid].contenidos[i].transparencia,mapaid,i,contenido.atributo1,tempoid);
												        			}
											        			}
											        		}
											        		else
											        		{
												        		var tempoid = getTemporalidad(contenido.id,proyectoactual.configuracion.mapas[mapaid].contenidos[i].escalaTiempo,ui.value,"");
												        		drawPointLayerDepartamento(mapaid,proyectoactual.configuracion.mapas[mapaid].contenidos[i].id,tempoid,proyectoactual.configuracion.mapas[mapaid].contenidos[i].atributo1,proyectoactual.configuracion.mapas[mapaid].contenidos[i].atributo2,proyectoactual.configuracion.mapas[mapaid].contenidos[i].simbolo,new esri.Color(proyectoactual.configuracion.mapas[mapaid].contenidos[i].color1).toHex(),new esri.Color(proyectoactual.configuracion.mapas[mapaid].contenidos[i].color2).toHex(),proyectoactual.configuracion.mapas[mapaid].contenidos[i].transparencia,proyectoactual.configuracion.mapas[mapaid].contenidos[i].tipo);
											        		}
											        	}
															}
										        	if(contenido.origen=="BD"){
																var tempoid = getTemporalidad(contenido.id,proyectoactual.configuracion.mapas[mapaid].contenidos[0].escalaTiempo,ui.value,"");
										        		if(initchart==1) drawCharts(tempoid);
										        	} else if(contenido.origen=="CP") {
																//
															}
										        }
										    })
										    .slider("pips", {
										        rest: "label"
										    });

										    $("#beginning").button({
										      text: false,
										      icons: {
										        primary: "ui-icon-seek-start"
										      }
										});
									}
				  				} else {
				  					if(contenido.origen=="BD"){
											$('#scaleyear').show();
				  						$('#scaleyear').empty();
				  					
				  						var a = 0;
				  						for(a=0;a<data_mapa[contenidoid].years.length;a++)
				  						{
				  							$("#scaleyear").append($("<option></option>").attr("value", data_mapa[contenidoid].years[a].yyyy).text(data_mapa[contenidoid].years[a].yyyy));
				  						}

				  						var months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
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
								         	var i = 0;
										        	
													 for(i=0;i<gl_simbolos.length;i++)
													 {
													 	map.removeLayer(gl_simbolos[i]);
													 }

										 			 gl_simbolos = new Array();

								        	for(i=0;i<proyectoactual.configuracion.mapas[mapaid].contenidos.length;i++)
								        	{
								        		if(proyectoactual.configuracion.mapas[mapaid].contenidos[i].tipo==1)
								        		{
								        			console.log("slider months");
								        			if(gl_departamentos==null) addLayerDepartamento(mapaid,contenido.id,getTemporalidad(contenido.id,proyectoactual.configuracion.mapas[mapaid].contenidos[i].escalaTiempo,ui.value,""),contenido.atributo1,contenido.transparencia);
								        			else
								        			{
								        				var tempoid = getTemporalidad(contenido.id,proyectoactual.configuracion.mapas[mapaid].contenidos[i].escalaTiempo,$('#scaleyear').val(),ui.value+1);
								        				var ldata = null;
								        				var ldata2 = null;
														ldata = data_mapa[contenido.id].data_temporalidad[tempoid][contenido.atributo1];
														if(contenido.tipo==4) ldata2 = data_mapa[contenido].data_temporalidad[tempoid][contenido.atributo2];
								        				var j = 0;
								        				for(j=0;j<ldata.length;j++)
									        			{
									        				var max = Math.max.apply(Math,$.map(data_mapa[contenido.id].data_temporalidad[tempoid][contenido.atributo1],function(n,i){ return n.value * 1; }))
									        				setDeptoColor(ldata[j].departamento,ldata[j].value,new esri.Color(proyectoactual.configuracion.mapas[mapaid].contenidos[i].color1).toHex(),new esri.Color(proyectoactual.configuracion.mapas[mapaid].contenidos[i].color2).toHex(),proyectoactual.configuracion.mapas[mapaid].contenidos[i].transparencia,mapaid,i,contenido.atributo1,tempoid);
									        			}
								        			}
								        		}
								        		else
								        		{
									        		var tempoid = getTemporalidad(contenido.id,proyectoactual.configuracion.mapas[mapaid].contenidos[i].escalaTiempo,$('#scaleyear').val(),ui.value);
									        		drawPointLayerDepartamento(mapaid,proyectoactual.configuracion.mapas[mapaid].contenidos[i].id,tempoid,proyectoactual.configuracion.mapas[mapaid].contenidos[i].atributo1,proyectoactual.configuracion.mapas[mapaid].contenidos[i].atributo2,proyectoactual.configuracion.mapas[mapaid].contenidos[i].simbolo,new esri.Color(proyectoactual.configuracion.mapas[mapaid].contenidos[i].color1).toHex(),new esri.Color(proyectoactual.configuracion.mapas[mapaid].contenidos[i].color2).toHex(),proyectoactual.configuracion.mapas[mapaid].contenidos[i].transparencia,proyectoactual.configuracion.mapas[mapaid].contenidos[i].tipo);
								        		}
								        	}

							        		var tempoid = getTemporalidad(contenido.id,proyectoactual.configuracion.mapas[mapaid].contenidos[0].escalaTiempo,$('#scaleyear').val(),ui.value);
							        		if(initchart==1) drawCharts(tempoid);
								    	});
				  					}
				  				}
							 } 
						}
						
						
					if(contenido.tipo=="1") {
						if(gl_departamentos==null) { 
							if(proyectoactual.configuracion.mapas[mapaid].contenidos[0].resumenDatos=="false" || proyectoactual.configuracion.mapas[mapaid].contenidos[0].resumenDatos==false){
								console.log("contenido 1 no resumen");
								addLayerDepartamento(mapaid,contenido.id,getTemporalidad(contenido.id,contenido.escalaTiempo,data_mapa[contenido.id].temporalidad[0].yyyy,data_mapa[contenido.id].temporalidad[0].mm),contenido.atributo1,new esri.Color(contenido.color1).toHex(),new esri.Color(contenido.color2).toHex(),contenido.transparencia);
							}
							else {
								console.log("contenido 1 resumen");
								addLayerDepartamento(mapaid,contenido.id,0,contenido.atributo1,new esri.Color(contenido.color1).toHex(),new esri.Color(contenido.color2).toHex(),contenido.transparencia);
							}
						}
		  			} else if(contenido.tipo=="2") { // Simbolos recuentos y colores
		  				if(proyectoactual.configuracion.mapas[mapaid].contenidos[0].resumenDatos=="false" || proyectoactual.configuracion.mapas[mapaid].contenidos[0].resumenDatos==false){
		  					drawPointLayerDepartamento(mapaid,contenido.id,getTemporalidad(contenido.id,contenido.escalaTiempo,data_mapa[contenido.id].temporalidad[0].yyyy,data_mapa[contenido.id].temporalidad[0].mm),contenido.atributo1,contenido.atributo2,contenido.simbolo,new esri.Color(contenido.color1).toHex(),new esri.Color(contenido.color2).toHex(),contenido.transparencia,contenido.tipo);
		  				}
		  				else{
		  					drawPointLayerDepartamento(mapaid,contenido.id,0,contenido.atributo1,contenido.atributo2,contenido.simbolo,new esri.Color(contenido.color1).toHex(),new esri.Color(contenido.color2).toHex(),contenido.transparencia,contenido.tipo);
		  				}
		  			} 
		  			else if(contenido.tipo=="3") { // Simbolos recuentos y tamaños
		  				if(proyectoactual.configuracion.mapas[mapaid].contenidos[0].resumenDatos=="false" || proyectoactual.configuracion.mapas[mapaid].contenidos[0].resumenDatos==false){
		  					drawPointLayerDepartamento(mapaid,contenido.id,getTemporalidad(contenido.id,contenido.escalaTiempo,data_mapa[contenido.id].temporalidad[0].yyyy,data_mapa[contenido.id].temporalidad[0].mm),contenido.atributo1,contenido.atributo2,contenido.simbolo,new esri.Color(contenido.color1).toHex(),new esri.Color(contenido.color2).toHex(),contenido.transparencia,contenido.tipo);
		  				}
		  				else{
		  						drawPointLayerDepartamento(mapaid,contenido.id,0,contenido.atributo1,contenido.atributo2,contenido.simbolo,new esri.Color(contenido.color1).toHex(),new esri.Color(contenido.color2).toHex(),contenido.transparencia,contenido.tipo);
		  					}
		  				} 
		  				else if(contenido.tipo=="4") { // Simbolos recuentos, tamaños y colores
		  					if(proyectoactual.configuracion.mapas[mapaid].contenidos[0].resumenDatos=="false" || proyectoactual.configuracion.mapas[mapaid].contenidos[0].resumenDatos==false){
		  						drawPointLayerDepartamento(mapaid,contenido.id,getTemporalidad(contenido.id,contenido.escalaTiempo,data_mapa[contenido.id].temporalidad[0].yyyy,data_mapa[contenido.id].temporalidad[0].mm),contenido.atributo1,contenido.atributo2,contenido.simbolo,new esri.Color(contenido.color1).toHex(),new esri.Color(contenido.color2).toHex(),contenido.transparencia,contenido.tipo);
		  					}
		  					else{
		  						drawPointLayerDepartamento(mapaid,contenido.id,0,contenido.atributo1,contenido.atributo2,contenido.simbolo,new esri.Color(contenido.color1).toHex(),new esri.Color(contenido.color2).toHex(),contenido.transparencia,contenido.tipo);
		  					}
		  				} 
		  				else if(contenido.tipo=="5") { // Graficos sobre tablas

		  				}

		  				redrawContents(mapaid,contenidoid+1);

						});
					} else {
				    	// capas personalizadas
				    	$.ajax({
				  			method: "POST",
				  			url: baseUrl + "/getDataCP",
				  			data: { "ids":ids, 
				  		  	"capaid":contenido.capaid, 
				  		  	"i":i
				  			} 
							}).done(function( data ) {
						     
								 data[0].campos = eval('(' + data[0].campos + ')');
						     data[0].data = eval('(' + data[0].data + ')');
						     if(data_mapa==null) data_mapa = new Array();
								 data_mapa[contenido.id] = data;
								 
								 if(contenido.tipo=="1") {
										if(gl_departamentos==null) { 
												addLayerCP(mapaid,contenido.id,contenido.atributo1,contenido.tipolayer,contenido.tipocoord,contenido.dm,new esri.Color(contenido.color1).toHex(),new esri.Color(contenido.color2).toHex(),contenido.transparencia);
										}
		  					 } 
								 else if(contenido.tipo=="2") { // Simbolos recuentos y colores
		  							drawPointLayerCP(mapaid,contenido.id,contenido.atributo1,contenido.tipolayer,contenido.tipocoord,contenido.dm,contenido.simbolo,new esri.Color(contenido.color1).toHex(),new esri.Color(contenido.color2).toHex(),contenido.transparencia,contenido.tipo);
		    				 } 
		  					 else if(contenido.tipo=="3") { // Simbolos recuentos y tamaños
		  							drawPointLayerCP(mapaid,contenido.id,contenido.atributo1,contenido.tipolayer,contenido.tipocoord,contenido.dm,contenido.simbolo,new esri.Color(contenido.color1).toHex(),new esri.Color(contenido.color2).toHex(),contenido.transparencia,contenido.tipo);
		  				   } 
		  				 	 else if(contenido.tipo=="4") { // Simbolos recuentos, tamaños y colores
		  							drawPointLayerCP(mapaid,contenido.id,contenido.atributo1,contenido.atributo2,contenido.simbolo,new esri.Color(contenido.color1).toHex(),new esri.Color(contenido.color2).toHex(),contenido.transparencia,contenido.tipo);
		  					 }
				  			 else if(contenido.tipo=="5") { // Graficos sobre tablas

		  	  			 }

		  					redrawContents(mapaid,contenidoid+1);
								 
							});
					}
	  		} 
	  	}
	  }

	  function changeSelYear()
	  {
	  	 var i = 0;
		   var mapaid = $("ul#tab_maps li.active").attr("id").substring(4);								        	
		   for(i=0;i<gl_simbolos.length;i++)
		   {
		 	    map.removeLayer(gl_simbolos[i]);
		   }

		   gl_simbolos = new Array();

    	 for(i=0;i<proyectoactual.configuracion.mapas[mapaid].contenidos.length;i++)
    	 {
    		 var contenido = proyectoactual.configuracion.mapas[mapaid].contenidos[i];
    		
    		 if(proyectoactual.configuracion.mapas[mapaid].contenidos[i].tipo==1)
    		 {
    			if(gl_departamentos==null) addLayerDepartamento(contenido.id,getTemporalidad(contenido.id,proyectoactual.configuracion.mapas[mapaid].contenidos[i].escalaTiempo,ui.value,""),contenido.atributo1,contenido.transparencia);
    			else
    			{
    				var tempoid = getTemporalidad(contenido.id,proyectoactual.configuracion.mapas[mapaid].contenidos[i].escalaTiempo,$('#scaleyear').val(),$(".slider").slider("value")+1);
    				var ldata = null;
    				var ldata2 = null;
    				ldata = data_mapa[contenido.id].data_temporalidad[tempoid][contenido.atributo1];
					  if(contenido.tipo==4) ldata2 = data_mapa[contenido].data_temporalidad[tempoid][contenido.atributo2];
    				var j = 0;
    				for(j=0;j<ldata.length;j++)
        		{
        				var max = Math.max.apply(Math,$.map(data_mapa[contenido.id].data_temporalidad[tempoid][contenido.atributo1],function(n,i){ return n.value * 1; }))
        				setDeptoColor(ldata[j].departamento,ldata[j].value,max,new esri.Color(proyectoactual.configuracion.mapas[mapaid].contenidos[i].color1).toHex(),new esri.Color(proyectoactual.configuracion.mapas[mapaid].contenidos[i].color2).toHex(),proyectoactual.configuracion.mapas[mapaid].contenidos[i].transparencia,mapaid,i,contenido.atributo1);
        		}
    			}
    		}
    		else
    		{
        		var tempoid = getTemporalidad(contenido.id,proyectoactual.configuracion.mapas[mapaid].contenidos[i].escalaTiempo,$('#scaleyear').val(),$(".slider").slider("value")+1);
        		drawPointLayerDepartamento(mapaid,proyectoactual.configuracion.mapas[mapaid].contenidos[i].id,tempoid,proyectoactual.configuracion.mapas[mapaid].contenidos[i].atributo1,proyectoactual.configuracion.mapas[mapaid].contenidos[i].atributo2,proyectoactual.configuracion.mapas[mapaid].contenidos[i].simbolo,new esri.Color(proyectoactual.configuracion.mapas[mapaid].contenidos[i].color1).toHex(),new esri.Color(proyectoactual.configuracion.mapas[mapaid].contenidos[i].color2).toHex(),proyectoactual.configuracion.mapas[mapaid].contenidos[i].transparencia,proyectoactual.configuracion.mapas[mapaid].contenidos[i].tipo);
    		}
    	}

    	var tempoid = getTemporalidad(contenido.id,proyectoactual.configuracion.mapas[mapaid].contenidos[0].escalaTiempo,$('#scaleyear').val(),$(".slider").slider("value")+1);
    	if(initchart==1) drawCharts(tempoid);
	  }

	  function setDeptoColor(departamento,valor,max,color1,color2,transparencia,mapaid,id,atributo,temporalidad)
	  {
	  	try{
      var i = 0;
	  	var colorscale = d3.scale.linear().domain([1,(proyectoactual.configuracion.mapas[mapaid].contenidos[id].nclases * 1)],function(n,i){ return n.value * 1; }).range([color1,color2]);
		  var color = null;
      if(proyectoactual.configuracion.mapas[mapaid].contenidos[id].clasificacion=="2")
      {
      	// Intervalos iguales
      	var max = Math.max.apply(Math,$.map(data_mapa[id].data_temporalidad[temporalidad][atributo],function(n,i){ return n.value * 1; }));
	   		var min = Math.min.apply(Math,$.map(data_mapa[id].data_temporalidad[temporalidad][atributo],function(n,i){ return n.value * 1; }));
	   		var rango = max - min;
	   		ic = round(rango / proyectoactual.configuracion.mapas[mapaid].contenidos[id].nclases,2);
	   		var a = 0;
	   		var clases = new Array();
	   		
	   		for(a=0;a<proyectoactual.configuracion.mapas[mapaid].contenidos[id].nclases;a++)
	   		{
	   			var clase = new Array();
	   			clase.push(min);
	   			
	   			if(a<proyectoactual.configuracion.mapas[mapaid].contenidos[id].nclases-1) clase.push(round(min+ic,2));
	   			else(clase.push(max));
	   			clases.push(clase);
	   			min = min + ic;
	   		}

	   		proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases = clases;
      }

      if(proyectoactual.configuracion.mapas[mapaid].contenidos[id].clasificacion=="3")
      {
      	var clases = new Array();
      	var values = $.map(data_mapa[id].data_temporalidad[temporalidad][atributo],function(n,i){ return n.value * 1; });
    		values.sort(function(a, b){return a-b});
    		var clase = new Array();
    		clase.push(values[0]);
    		clase.push(values[3]);
    		clases.push(clase);

    		clase = new Array();
    		clase.push(values[4]);
    		clase.push(values[7]);
    		clases.push(clase);

    		clase = new Array();
    		clase.push(values[8]);
    		clase.push(values[10]);
    		clases.push(clase);

    		clase = new Array();
    		clase.push(values[11]);
    		clase.push(values[13]);
    		clases.push(clase);

    		proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases = clases;  	
      }

      if(proyectoactual.configuracion.mapas[mapaid].contenidos[id].clasificacion=="4")
      {
      	var clases = new Array();
      	var values = $.map(data_mapa[id].data_temporalidad[temporalidad][atributo],function(n,i){ return n.value * 1; });
    		values.sort(function(a, b){return a-b});
    		var clase = new Array();
    		clase.push(values[0]);
    		clase.push(values[2]);
    		clases.push(clase);

    		clase = new Array();
    		clase.push(values[3]);
    		clase.push(values[5]);
    		clases.push(clase);

    		clase = new Array();
    		clase.push(values[6]);
    		clase.push(values[8]);
    		clases.push(clase);

    		clase = new Array();
    		clase.push(values[9]);
    		clase.push(values[11]);
    		clases.push(clase);

    		clase = new Array();
    		clase.push(values[12]);
    		clase.push(values[13]);
    		clases.push(clase);

    		proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases = clases; 
      }
      
	  	for(i=0;i<gl_departamentos.graphics.length;i++)
	  	{
	  		if(gl_departamentos.graphics[i].attributes.departamento==departamento)
	  		{
	  			var l = 1;
		      
					for(l=1;l<=proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases.length;l++)
					{
						if(valor >= (proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases[l-1][0] * 1) && valor <= (proyectoactual.configuracion.mapas[mapaid].contenidos[id].clases[l-1][1]*1))
						{
							color = HexToRGB(colorscale(l).toUpperCase(),transparencia);
						}
					}
				  gl_departamentos.graphics[i].symbol.color = color;
	  		}
	  	}
	  	gl_departamentos.redraw();
      }
      catch(err)
      {
        console.log(err);
      }
	  }

	  function setSymbolColor(departamento,valor,max,transparencia)
	  {
	  	var i = 0;
	  	var colorscale = d3.scale.linear().domain([0,max]).range(['white','blue'])
		  var color = null;
	  }

	  function getTemporalidad(id,tipo,yyyy,mm)
	  {
	  	  console.log(id);
	  	  var i = 0;
	  	  for(i=0;i<data_mapa[id].temporalidad.length;i++)
	  	  {
	  	  	if(tipo=='ANUAL' || tipo=='RANGO')
	  	  	{
	  	  		if(data_mapa[id].temporalidad[i].tipo==tipo && data_mapa[id].temporalidad[i].yyyy==yyyy)
	  	  			return data_mapa[id].temporalidad[i].tempoid;
	  	  	} else if (tipo=='MENSUAL') {
	  	  		if(data_mapa[id].temporalidad[i].tipo==tipo && data_mapa[id].temporalidad[i].yyyy==yyyy && data_mapa[id].temporalidad[i].mm == mm)
	  	  			return data_mapa[id].temporalidad[i].tempoid;	  	  		
	  	  	}
	  	  }
	  }
	  
	  function getTemporalidadGrafico(id,tipo,yyyy,mm)
	  {
	  	  console.log(id);
	  	  var i = 0;
	  	  for(i=0;i<data_grafico[id][0].temporalidad.length;i++)
	  	  {
	  	  	if(tipo=='ANUAL' || tipo=='RANGO')
	  	  	{
	  	  		if(data_grafico[id][0].temporalidad[i].tipo==tipo && data_grafico[id][0].temporalidad[i].yyyy==yyyy)
	  	  			return data_grafico[id][0].temporalidad[i].tempoid;
	  	  	} else if (tipo=='MENSUAL') {
	  	  		if(data_grafico[id][0].temporalidad[i].tipo==tipo && data_grafico[id][0].temporalidad[i].yyyy==yyyy && data_grafico[id][0].temporalidad[i].mm == mm)
	  	  			return data_grafico[id][0].temporalidad[i].tempoid;	  	  		
	  	  	}
	  	  }
	  }

	  function chart()
	  {
	  	Morris.Bar({
        	element: 'morris-area-chart',
        	data: data_mapa.data_temporalidad[1],
        	labels: ['AMENAZAS'],
        	xkey: 'departamento',
        	ykeys: ['_1_4_24_2_1']
        });
	  }

function GiveDec(Hex)
{
   if(Hex == "A")
      Value = 10;
   else
   if(Hex == "B")
      Value = 11;
   else
   if(Hex == "C")
      Value = 12;
   else
   if(Hex == "D")
      Value = 13;
   else
   if(Hex == "E")
      Value = 14;
   else
   if(Hex == "F")
      Value = 15;
   else
      Value = eval(Hex)
   return Value;
}

function GiveHex(Dec)
{
   if(Dec == 10)
      Value = "A";
   else
   if(Dec == 11)
      Value = "B";
   else
   if(Dec == 12)
      Value = "C";
   else
   if(Dec == 13)
      Value = "D";
   else
   if(Dec == 14)
      Value = "E";
   else
   if(Dec == 15)
      Value = "F";
   else
      Value = "" + Dec;
   return Value;
}

function HexToRGB(colorhex,transparencia)
{

   a = GiveDec(colorhex.substring(1, 2));
   b = GiveDec(colorhex.substring(2, 3));
   c = GiveDec(colorhex.substring(3, 4));
   d = GiveDec(colorhex.substring(4, 5));
   e = GiveDec(colorhex.substring(5, 6));
   f = GiveDec(colorhex.substring(6, 7));

   x = (a * 16) + b;
   y = (c * 16) + d;
   z = (e * 16) + f;

   return [x , y, z, transparencia];
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