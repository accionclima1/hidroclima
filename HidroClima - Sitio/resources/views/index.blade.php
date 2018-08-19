@extends('layouts.main')

@section('extra_header_includes')
<style type="text/css">
   .labels {
     color: black;
     background-color: white;
     font-family: "Lucida Grande", "Arial", sans-serif;
     font-size: 10px;
     font-weight: bold;
     text-align: center;
     width: 180px;     
     border: none;
     white-space: nowrap;
   }
</style>
<link rel="stylesheet" type="text/css" href="{{ URL::to('/') }}/css/jquery-ui.css">
<link rel="stylesheet" href="{{ URL::to('/') }}/css/toolkit-defaults.css">
<link rel="stylesheet" href="{{ URL::to('/') }}/css/toolkit-demo.css">
<link rel="stylesheet" href="{{ URL::to('/') }}/css/app2.css">
<!--link rel="stylesheet" href="{{ URL::to('/') }}/css/jquery-ui.css"-->	
<!--script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAYpz3xcHFOERJu2z9k1lYoSXUOl8ZUxZc"></script-->
<!--script src="{{ URL::to('/') }}/js/markerwithlabel.js" type="text/javascript"></script-->
<script src="{{ URL::to('/') }}/js/jquery-ui.min.js" type="text/javascript"></script>
<script src="{{ URL::to('/') }}/js/jsplumb.js"></script>
<script>
  var URL = "{{ URL::to('/') }}";
  var today = '{{ $fecha }}';
  var idpch = 5;
  var TOKEN = '{{ csrf_token() }}';
</script>
<script src="{{ URL::to('/') }}/js/app2.js"></script>
@endsection

@section('javascript_variables')
     
@endsection

@section('main_content')
<div class="row">
    <div class="col-md-12">
      <div id="map" style="height:430px;background-color:#cccccc"></div>
    </div>
</div>
<div class="row">
  <div class="col-md-4">
       <strong>Central:</strong>
       <select id="pch" name="pch" class="form-control" onchange="getData();">
       @if(isset($pchs))
        @foreach($pchs as $item)
          <option value="{{ $item->idpch }}">{{ $item->nombre_pch }}</option>
        @endforeach
       @endif
       </select>
  </div>
</div>
<div class="row">
  <div class="col-md-7">
    <div class="card">
      <div class="card-header">
        <div class="col-md-3"><h4>:: Pron&oacute;stico d&iacute;a: </h4>&nbsp;&nbsp;</div>
        <div class="col-md-9"><input class="form-control" type="text" size="10" id="fecha" style="margin:4px;" name="fecha" value="{{ substr($fecha,0,10) }}" onchange="getData();" /></div>
      </div>
      <div id="resultados" class="card-body" style="overflow:auto;">
        <table class="table table-striped table-bordered">
          <thead>
            <tr>
              <th rowspan="2">Estaci&oacute;n</th>
              <th colspan="3">Precipitaci&oacute;n</th>
              <th colspan="3">Caudal bruto</th>
            </tr>
            <tr>
              <th>24H</th>
              <th>48H</th>
              <th>72H</th>
              <th>24H</th>
              <th>48H</th>
              <th>72H</th>
            </tr>
          </thead>
          <tbody>
            @if(isset($pronosticos))
              <?php $row = $pronosticos[0]; ?>
                <tr>
                  <td colspan="7">{{ $row[0] }}</td>
                </tr>
                @foreach($row[1] as $estaciones)
                  <tr>
                    <td>{{ $estaciones->nombre_estacion }}</td>
                    <td>{{ round($estaciones->p24h,3) }}</td>
                    <td>{{ round($estaciones->p48h,3) }}</td>
                    <td>{{ round($estaciones->p72h,3) }}</td>
                    <td>{{ round($estaciones->qb24h,3) }}</td>
                    <td>{{ round($estaciones->qb48h,3) }}</td>
                    <td>{{ round($estaciones->qb72h,3) }}</td>
                  </tr>
                @endforeach
                <tr>
                  <td><strong>Totales</strong></td>
                  <td>{{ round($row[2][0]->pm24h,2) }}</td>
                  <td>{{ round($row[2][0]->pm48h,2) }}</td>
                  <td>{{ round($row[2][0]->pm72h,2) }}</td>
                  <td>{{ round($row[2][0]->qb24h,3) }}</td>
                  <td>{{ round($row[2][0]->qb48h,3) }}</td>
                  <td>{{ round($row[2][0]->qb72h,3) }}</td>
                </tr>
            @endif
          </tbody>
          <tfoot>
            <tr>
              <th>Estaci&oacute;n</th>
              <th>24H</th>
              <th>48H</th>
              <th>72H</th>
              <th>24H</th>
              <th>48H</th>
              <th>72H</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
  <div class="col-md-5">
    <div class="card">
      <div class="card-header">
        <h4>:: PCHs resultados</h4>&nbsp;&nbsp;
      </div>
      <div>
        <ul class="nav nav-tabs">
            <li role="presentation" class="active"><a id="tab0" onclick="setHrs(0);">24HRS</a></li>
            <li role="presentation"><a id="tab1" onclick="setHrs(1);">48HRS</a></li>
            <li role="presentation"><a id="tab2" onclick="setHrs(2);">72HRS</a></li>
        </ul>
      </div>
      <div class="canvas-wide flowchart-demo jtk-surface-nopan" style="position:relative;border-width:1px; border-style:none; width:340px; height:460px; margin:auto;" id="canvas">
          <div class="window jtk-node" id="flowchartWindow1">
						<strong>Q Entrada</strong><br />
						<div id="qentrada" style="font-size:11pt;margin-top:8px;">[]</div>
					</div>
          <div class="window jtk-node" id="flowchartWindow2">
						<strong>Q Captaci&oacute;n</strong><br />
						<div id="qcaptacion" style="font-size:11pt;margin-top:8px;">[]</div>
					</div>
          <div class="window jtk-node" id="flowchartWindow3">
						<strong>Q Ecol&oacute;gico</strong><br />
						<div id="qecologico" style="font-size:11pt;margin-top:8px;">[]</div>
					</div>
          <div class="window jtk-node" id="flowchartWindow4">
						<strong>Q Turbina</strong><br />
						<div id="qturbina" style="font-size:11pt;margin-top:8px;">[]</div>
					</div>
          <div class="window jtk-node" id="flowchartWindow5">
						<strong>Q Excedente</strong><br />
						<div id="qexcedente" style="font-size:11pt;margin-top:8px;">[]</div>
					</div>
          <div class="window jtk-node" id="flowchartWindow6">
						<strong>Q Incremental</strong><br />
						<div id="qincremental" style="font-size:11pt;margin-top:8px;">[]</div>
					</div>
          <div class="window jtk-node" id="flowchartWindow7">
						<strong>Q Salida</strong><br />
						<div id="qsalida" style="font-size:11pt;margin-top:8px;">[]</div>
					</div>
          <div class="window jtk-node" id="flowchartWindow8">
						<strong>Q Tramo</strong><br />
						<div id="qtramo" style="font-size:11pt;margin-top:8px;">[]</div>
					</div>
      </div>
      <br />
      <div style="margin:25px;text-align:center;" class="text-success" id="potencia"></div>
      <br />
      <div id="potencia_tabla" class="card-body">

        <table class="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Resultados del pron&oacute;stico</th>
              <th>24H</th>
              <th>48H</th>
              <th>72H</th>
            </tr>
          </thead>                                            
          <tbody>
            @if(isset($resultados))
            <?php
            $row = $resultados[0];
            for($i=0;$i<count($row);$i++)
            {
              if($i==0)
              {
                ?>
                <tr><td colspan="4"><h4>{{ $row[0] }}</h4></td></tr>
                <?php
              }
              if($i==1)
              {
                ?>
                <tr>
                  <td>Precipitaci&oacute;n media</td>
                  <td>{{ $row[1][0] }}</td>
                  <td>{{ $row[1][1] }}</td>
                  <td>{{ $row[1][2] }}</td>
                </tr>
                <?php
              }
              if($i==2)
              {
                ?>
                <tr>
                  <td>Escorrent&iacute;a dique</td>
                  <td>{{ $row[2][0] }}</td>
                  <td>{{ $row[2][1] }}</td>
                  <td>{{ $row[2][2] }}</td>
                </tr>
                <?php
              }
              if($i==3)
              {
                ?>
                <tr>
                  <td>Caudal turbinado</td>
                  <td>{{ $row[3][0] }}</td>
                  <td>{{ $row[3][1] }}</td>
                  <td>{{ $row[3][2] }}</td>
                </tr>
                <?php
              }
              if($i==4)
              {
                ?>
                <tr>
                  <td>Potencia estimada</td>
                  <td>{{ $row[4][0] }}</td>
                  <td>{{ $row[4][1] }}</td>
                  <td>{{ $row[4][2] }}</td>
                </tr>
                <?php
              }
            }
            ?>
            @endif
          </tbody>
          <tfoot>
            <tr>
              <th>Resultados del pronostico</th>
              <th>24H</th>
              <th>48H</th>
              <th>72H</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</div>
@endsection

@section('dialogs')

@endsection

@section('js_includes')

@endsection
