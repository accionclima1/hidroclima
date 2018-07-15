@extends('layouts.main')

@section('extra_header_includes')
  <script src="{{ URL::to('/') }}/js/moment.min.js"></script>
  <script src="{{ URL::to('/') }}/js/Chart.js"></script>
  <script src="{{ URL::to('/') }}/js/utils.js"></script>
@endsection

@section('javascript_variables')
    var timeFormat = 'MM/DD/YYYY HH:mm';
		
		function newDate(days) {
			return moment().add(days, 'd').toDate();
		}

		function newDateString(days) {
			return moment().add(days, 'd').format(timeFormat);
		}

		function newTimestamp(days) {
			return moment().add(days, 'd').unix();
		}

		var color = Chart.helpers.color;
		var config = {
			type: 'line',
			data: {
				labels: [ 
				],
				datasets: [{
					label: "Mediciones en estaciones telem\u00E9tricas",
					backgroundColor: color(window.chartColors.green).alpha(0.5).rgbString(),
					borderColor: window.chartColors.green,
					fill: false,
					data: [{
						x: newDateString(0),
						y: randomScalingFactor()
					}, {
						x: newDateString(5),
						y: randomScalingFactor()
					}, {
						x: newDateString(7),
						y: randomScalingFactor()
					}, {
						x: newDateString(15),
						y: randomScalingFactor()
					}],
				}]
			},
			options: {
                title:{
                    text: "Mediciones Estaciones Telemétricas"
                },
				scales: {
					xAxes: [{
						type: "time",
						time: {
							format: timeFormat,
							// round: 'day'
							tooltipFormat: 'll HH:mm'
						},
						scaleLabel: {
							display: true,
							labelString: 'Tiempo'
						}
					}, ],
					yAxes: [{
						scaleLabel: {
							display: true,
							labelString: 'Valor'
						}
					}]
				},
			}
		};
    
    $(document).ready(function(){
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1; //January is 0!

            var yyyy = today.getFullYear();
            if(dd<10){
                dd='0'+dd;
            }
            if(mm<10){
                mm='0'+mm;
            }
            var today = yyyy + '-' + mm + '-' + dd;
            $("#fecha").val(today);
            $.ajax({
				url: "{{ URL::to('/') }}/getEstacionesMedicion",
				cache: false,
				crossDomain: true
			}).done(function(data){
			    var i = 0;
			    for(i = 0; i < data.length; i++)
			    {
			        $("#estaciones").append($("<option />").val(data[i].idestacion).text(data[i].nombre_estacion));
			    }
			    $("#estaciones").val('58');
		  });
    
		$.ajax({
				url: "{{ URL::to('/') }}/getParametrosTelemetricas",
				cache: false,
				crossDomain: true
			}).done(function(data){
			    var i = 0;
			    for(i = 0; i < data.length; i++)
			    {
			        $("#parametros").append($("<option />").val(data[i].idparametro).text(data[i].parametro));
			    }
			    $("#parametros").val('PC');
		});
      
		$.ajax({
				url: "{{ URL::to('/') }}/getMedicionesPorEstacion",
				cache: false,
				crossDomain: true,
				data: {"idestacion":"58","idparametro":"PC","fecha":today}
		}).done(function(data){
			    var i = 0;
          var misDatos = new Array();
			    var output = "<table class=\"table table-striped table-bordered\">";
			    output += "<thead>";
			    output += "<tr>";
			    output += "<th>Fecha - hora</th>";
			    output += "<th>Medici&oacute;n</th>";
			    output += "</tr>";
			    output += "</thead>";
			    output += "<tbody>";
			    for(i = 0; i < data.length; i++)
			    {
              output += "<tr>";
              output += "<td>" + data[i].fechahora + "</td>";
              output += "<td>" + data[i].medicion + "</td>";
              output += "</tr>";
              if(data[i].medicion * 1 > 0)
                misDatos.push({x:moment(data[i].fechahora).format(timeFormat), y:data[i].medicion * 1});
			    }
			    output += "</tbody>";
			    output += "</table>";
			    $("#table_mediciones").html(output);
          
          config.data.datasets[0].data = misDatos;
          var ctx = document.getElementById("canvas").getContext("2d");
			    window.myLine = new Chart(ctx, config);
		});
  });

        function updateTable()
        {
            $("#table_mediciones").html("<h3>Actualizando</h3>");
            var misDatos = new Array();
            $.ajax({
      				url: "{{ URL::to('/') }}/getMedicionesPorEstacion",
      				cache: false,
      				crossDomain: true,
      				data: {"idestacion":$("#estaciones").val(),"idparametro":$("#parametros").val(),"fecha":$("#fecha").val()}
      			}).done(function(data){
      			    var i = 0;
      			    var output = "<table class=\"table table-striped table-bordered\">";
      			    output += "<thead>";
      			    output += "<tr>";
      			    output += "<th>Fecha - hora</th>";
      			    output += "<th>Medici&oacute;n</th>";
      			    output += "</tr>";
      			    output += "</thead>";
      			    output += "<tbody>";
      			    for(i = 0; i < data.length; i++)
      			    {
                    output += "<tr>";
                    output += "<td>" + data[i].fechahora + "</td>";
                    output += "<td>" + data[i].medicion + "</td>";
                    output += "</tr>";
                    if(data[i].medicion * 1 > 0)
                        misDatos.push({x:moment(data[i].fechahora).format(timeFormat), y:data[i].medicion * 1});
      			    }
      			    output += "</tbody>";
      			    output += "</table>";
      			    $("#table_mediciones").html(output);
                config.data.datasets[0].data = misDatos;
                $('#canvas').remove();
                $('#canvas-container').append('<canvas id="canvas"><canvas>');
                var ctx = document.getElementById("canvas").getContext("2d");
			          window.myLine = new Chart(ctx, config);
      			});
        }
@endsection

@section('main_content')
   <div class="row">
    <div class="col-md-6">
      <div class="card">
        <div class="card-header">
         Mediciones
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-12">
                    <div class="form-group">
                        <label for="fecha">Fecha</label>
                        <input class="form-control" type="date" id="fecha" onchange="updateTable();" />
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="estaciones">Estaci&oacute;n</label>
                        <select  class="form-control" id="estaciones" onchange="updateTable();">
        
                        </select>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="parametros">Par&aacute;metro</label>
                        <select  class="form-control" id="parametros" onchange="updateTable();">
        
                        </select>
                    </div>
                </div>
            </div>
            <br />
            <div class="row">
                <div class="col-md-12">
                    <div id="table_mediciones" style="height:450px; overflow:auto;"></div>
                </div>
            </div>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card">
      <div class="card-header">
        Gr&aacute;fico
      </div>
      <div id="canvas-container" class="card-body">
        <canvas id="canvas"></canvas>
      </div>
      </div>
    </div>
   </div>
@endsection

@section('dialogs')

@endsection

@section('js_includes')

@endsection