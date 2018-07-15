@extends('layouts.main')

@section('extra_header_includes')

@endsection

@section('javascript_variables')
  $.extend( $.fn.dataTable.defaults, {
      responsive: true
  });
  $(document).ready(function(){
    $("#form1 :input").prop("disabled", true);
    $("#btnNuevo").prop("disabled",false);
    $('#data_table').DataTable({
            language: {
                processing:     "Procesando...",
                search:         "Buscar:",
                lengthMenu:     "Mostrar _MENU_ filas",
                info:           "Mostrando fila _START_ a _END_ de _TOTAL_ filas",
                infoEmpty:      "Mostrando fila 0 a 0 de 0 filas",
                infoFiltered:   "(filtradas de _MAX_ filas totales)",
                infoPostFix:    "",
                loadingRecords: "Cargando...",
                zeroRecords:    "Ning&uacute;n registro que mostrar",
                emptyTable:     "Tabla vac&iacute;a",
                paginate: {
                   first:      "Primero",
                    previous:   "Anterior",
                    next:       "Siguiente",
                    last:       "Ultimo"
                }
            }
        });
  });

  function nuevo()
  {
    $("#form1 :input").prop("disabled", false);
    $("#btnNuevo").prop("disabled",true);
    $("#accion").val("nuevo");
  }

  function cancelar()
  {
    $("#form1")[0].reset();
    $("#form1 :input").prop("disabled", true);
    $("#btnNuevo").prop("disabled",false);
  }

  function guardar()
  {
    $("#form1").submit();
  }

  function guardar_parametros()
  {
    $("#form1 :input").prop("disabled", false);
    $("#form2").submit();
  }

  function editar_escorrentia(idpch,nombrepch)
  {
    $("#form2")[0].reset();
    $("#idpch_").val(idpch);
    $("#lblpch").html(nombrepch);
    $.post("{{ URL::to('/') }}/getParametrosEscorrentiaByPCH",{idpch:idpch,"_token":'{{ csrf_token() }}'},function(data){
      var i = 0;
      for(i=0;i<data.length;i++)
      {
        $("#" + data[i].parametro + "_" + data[i].mes).val(data[i].valor);
      }
      $("#myModal").modal('toggle');
    });
  }

  function editar(idpch,nombrepch,qecologico,qdiseno,area_influencia,altura_neta,latitud,longitud)
  {
    $("#form1")[0].reset();
    $("#form1 :input").prop("disabled", false);
    $("#btnNuevo").prop("disabled",true);
    $("#idpch").val(idpch);
    $("#nombrepch").val(nombrepch);
    $("#qecologico").val(qecologico);
    $("#qdiseno").val(qdiseno);
    $("#area_influencia").val(area_influencia);
    $("#altura_neta").val(altura_neta);
    $("#latitud").val(latitud);
    $("#longitud").val(longitud);
    $("#accion").val('editar');
    $.post("{{ URL::to('/') }}/getAreasEstacionByPCH",{idpch:idpch,"_token":"{{ csrf_token() }}"},function(data){
      var i = 0;
      for(i=0;i<data.length;i++)
      {
        $("#estacion_area_" + data[i].idestacion).val(data[i].area_influencia);
        $("#estacion_porcentaje_" + data[i].idestacion).val(data[i].porcentaje);
      }
    });
  }

  function eliminar(idpch)
  {
    if(confirm("Realmente desea eliminar el registro seleccionado?"))
    {
      $("#form1")[0].reset();
      $("#form1 :input").prop("disabled", false);
      $("#idpch").val(idpch);
      $("#accion").val('eliminar');
      $("#form1").submit();
    }
  }
@endsection

@section('main_content')
<div class="row">
  <div class="col-md-12">
    <div class="card">
      <div class="card-header">
        <h3>:: PCHs</h3>&nbsp;&nbsp;
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-5">
            <form id="form1" name="form1" method="post">
            <div class="form-group">
              <label for="nombrepch">Nombre PCH</label>
              <input type="text" class="form-control" id="nombrepch" name="nombrepch" placeholder="Nombre PCH">
              <input type="hidden" id="idpch" name="idpch">
              <input type="hidden" id="accion" name="accion">
              <input type="hidden" id="_token" name="_token" value="{{ csrf_token() }}" >
            </div>
            <div class="form-group">
              <label for="qecologico">Caudal ecol&oacute;gico</label>
              <input name="qecologico" id="qecologico" type="text" class="form-control" />
            </div>
            <div class="form-group">
               <label for="qdiseno">Caudal de dise&ntilde;o</label>
               <input name="qdiseno" id="qdiseno" type="text" class="form-control" />
            </div>
            <div class="form-group">
              <label for="area_influencia">&Aacute;rea de influencia</label>
              <input name="area_influencia" id="area_influencia" type="text" class="form-control" />
            </div>
            <div class="form-group">
              <label for="altura_neta">Altura neta</label>
              <input id="altura_neta" name="altura_neta" type="text" class="form-control" />
            </div>
            <div class="form-group">
              <label for="latitud">Latitud</label>
              <input name="latitud" id="latitud" type="text" class="form-control" />
            </div>
            <div class="form-group">
              <label for="longitud">Longitud</label>
              <input name="longitud" id="longitud" type="text" class="form-control" />
            </div>
            <table class="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>Estaci&oacute;n</th>
                  <th>&Aacute;rea de influencia</th>
                  <th>Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                @if(isset($estaciones_areas))
                  @foreach($estaciones_areas as $estacion)
                    <tr>
                      <td>{{ $estacion->nombre_estacion }}</td>
                      <td><input id="estacion_area_{{ $estacion->idestacion }}" name="estacion_area[{{ $estacion->idestacion }}]" type="text" class="form-control"></td>
                      <td><input id="estacion_porcentaje_{{ $estacion->idestacion }}" name="estacion_porcentaje[{{ $estacion->idestacion }}]" type="text" class="form-control"></td>
                    </tr>
                  @endforeach
                @endif
              </tbody>
            </table>
            <div style="text-align:center;">
              <div class="btn-group" role="group" aria-label="...">
                <button id="btnNuevo" name="btnNuevo" type="button" class="btn btn-primary" onclick="nuevo();">Nuevo</button>
                <button id="btnCancelar" name="btnCancelar" type="button" class="btn btn-warning" onclick="cancelar();">Cancelar</button>
                <button id="btnGuardar" name="btnGuardar" type="button" class="btn btn-success" onclick="guardar();">Guardar</button>
              </div>
            </div>
           </form>
          </div>
          <div class="col-md-7">
            <div class="panel panel-default">
            <div class="panel-body">
            <table id="data_table" class="table table-striped table-bordered dt-responsive nowrap" width="100%" cellspacing="0">
              <thead>
                <tr>
                  <th>ID PCH</th>
                  <th>PCH</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                @if(isset($pchs))
                  @foreach($pchs as $pch)
                  <tr>
                    <td>{{ $pch->idpch }}</td>
                    <td>{{ $pch->nombre_pch }}</td>
                    <td>
                      <div class="btn-group" role="group" aria-label="...">
                        <button type="button" class="btn btn-default"
                          onclick="editar('{{ $pch->idpch }}','{{ $pch->nombre_pch }}','{{ $pch->qecologico }}','{{ $pch->qdiseno }}','{{ $pch->area_influencia }}','{{ $pch->altura_neta }}','{{ $pch->latitud }}','{{ $pch->longitud }}');">Editar</button>
                        <button type="button" class="btn btn-default" onclick="editar_escorrentia('{{ $pch->idpch }}','{{ $pch->nombre_pch }}');">Editar par&aacute;metros escorrent&iacute;a</button>
                        <button type="button" class="btn btn-default" onclick="eliminar('{{ $pch->idpch }}');">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                  @endforeach
                @endif
              </tbody>
              <tfoot>
                <tr>
                  <th>ID PCH</th>
                  <th>PCH</th>
                  <th>Acciones</th>
                </tr>
              </tfoot>
            </table>
          </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
@endsection

@section('dialogs')
<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">Escorrent&iacute;a Caudales M&iacute;nimos PCH: <label id="lblpch"/></h4>
      </div>
      <div class="modal-body">
        <form id="form2" method="post">
        <div style="border-style:solid;border-width:1px;overflow:auto;">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Par&aacute;metro</th>
                <th>Enero</th>
                <th>Febrero</th>
                <th>Marzo</th>
                <th>Abril</th>
                <th>Mayo</th>
                <th>Junio</th>
                <th>Julio</th>
                <th>Agosto</th>
                <th>Septiembre</th>
                <th>Octubre</th>
                <th>Noviembre</th>
                <th>Diciembre</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Coeficiente</td>
                <td><input type="text" size="5" id="coeficiente_1" name="coeficiente[1]"></td>
                <td><input type="text" size="5" id="coeficiente_2" name="coeficiente[2]"></td>
                <td><input type="text" size="5" id="coeficiente_3" name="coeficiente[3]"></td>
                <td><input type="text" size="5" id="coeficiente_4" name="coeficiente[4]"></td>
                <td><input type="text" size="5" id="coeficiente_5" name="coeficiente[5]"></td>
                <td><input type="text" size="5" id="coeficiente_6" name="coeficiente[6]"></td>
                <td><input type="text" size="5" id="coeficiente_7" name="coeficiente[7]"></td>
                <td><input type="text" size="5" id="coeficiente_8" name="coeficiente[8]"></td>
                <td><input type="text" size="5" id="coeficiente_9" name="coeficiente[9]"></td>
                <td><input type="text" size="5" id="coeficiente_10" name="coeficiente[10]"></td>
                <td><input type="text" size="5" id="coeficiente_11" name="coeficiente[11]"></td>
                <td><input type="text" size="5" id="coeficiente_12" name="coeficiente[12]"></td>
              </tr>
              <tr>
                <td>Q m&iacute;nimo</td>
                <td><input type="text" size="5" id="qminimo_1" name="qminimo[1]"></td>
                <td><input type="text" size="5" id="qminimo_2" name="qminimo[2]"></td>
                <td><input type="text" size="5" id="qminimo_3" name="qminimo[3]"></td>
                <td><input type="text" size="5" id="qminimo_4" name="qminimo[4]"></td>
                <td><input type="text" size="5" id="qminimo_5" name="qminimo[5]"></td>
                <td><input type="text" size="5" id="qminimo_6" name="qminimo[6]"></td>
                <td><input type="text" size="5" id="qminimo_7" name="qminimo[7]"></td>
                <td><input type="text" size="5" id="qminimo_8" name="qminimo[8]"></td>
                <td><input type="text" size="5" id="qminimo_9" name="qminimo[9]"></td>
                <td><input type="text" size="5" id="qminimo_10" name="qminimo[10]"></td>
                <td><input type="text" size="5" id="qminimo_11" name="qminimo[11]"></td>
                <td><input type="text" size="5" id="qminimo_12" name="qminimo[12]"></td>
              </tr>
              <tr>
                <td>Q m&aacute;ximo</td>
                <td><input type="text" size="5" id="qmaximo_1" name="qmaximo[1]"></td>
                <td><input type="text" size="5" id="qmaximo_2" name="qmaximo[2]"></td>
                <td><input type="text" size="5" id="qmaximo_3" name="qmaximo[3]"></td>
                <td><input type="text" size="5" id="qmaximo_4" name="qmaximo[4]"></td>
                <td><input type="text" size="5" id="qmaximo_5" name="qmaximo[5]"></td>
                <td><input type="text" size="5" id="qmaximo_6" name="qmaximo[6]"></td>
                <td><input type="text" size="5" id="qmaximo_7" name="qmaximo[7]"></td>
                <td><input type="text" size="5" id="qmaximo_8" name="qmaximo[8]"></td>
                <td><input type="text" size="5" id="qmaximo_9" name="qmaximo[9]"></td>
                <td><input type="text" size="5" id="qmaximo_10" name="qmaximo[10]"></td>
                <td><input type="text" size="5" id="qmaximo_11" name="qmaximo[11]"></td>
                <td><input type="text" size="5" id="qmaximo_12" name="qmaximo[12]"></td>
              </tr>
            </tbody>
          </table>
          <input type="hidden" id="accion_" name="accion_" value="editar_parametros">
          <input type="hidden" id="idpch_" name="idpch_">
          <input type="hidden" id="_token" name="_token" value="{{ csrf_token() }}">
        </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-sm btn-default" data-dismiss="modal">Cerrar</button>
        <button type="button" class="btn btn-sm btn-success" onclick="guardar_parametros();">Guardar cambios</button>
      </div>
    </div>
  </div>
</div>
@endsection

@section('js_includes')

@endsection
