@extends('layouts.main')

@section('extra_header_includes')

@endsection

@section('javascript_variables')
  /*$.extend( $.fn.dataTable.defaults, {
      responsive: true
  }); */
  $(document).ready(function(){
    $("#form1 :input").prop("disabled", true);
    $("#btnNuevo").prop("disabled",false);
    /*$('#data_table').DataTable({
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
        });*/
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
    $("#idestacion").prop("disabled",false);
    $("#form1").submit();
  }

  function editar(idestacion,tipo,nombreestacion,latitud,longitud,elevacion)
  {
    $("#form1")[0].reset();
    $("#form1 :input").prop("disabled", false);
    $("#btnNuevo").prop("disabled",true);
    $("#idestacion").prop("disabled",true);
    $("#idestacion").val(idestacion);
    $("#tipoestacion").val(tipo);
    $("#nombreestacion").val(nombreestacion);
    $("#latitud").val(latitud);
    $("#longitud").val(longitud);
    $("#elevacion").val(elevacion);
    $("#accion").val('editar');
  }

  function eliminar(idestacion)
  {
    if(confirm("Realmente desea eliminar el registro seleccionado?"))
    {
      $("#form1")[0].reset();
      $("#form1 :input").prop("disabled", false);
      $("#idestacion").val(idestacion);
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
        <h3>:: Estaciones</h3>&nbsp;&nbsp;
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-4">
            <form id="form1" name="form1" method="post">
            <div class="form-group">
              <label for="idestacion">C&oacute;digo Estaci&oacute;n</label>
              <input type="text" class="form-control" id="idestacion" name="idestacion" placeholder="C&oacute;digo">
              <input type="hidden" id="accion" name="accion">
              <input type="hidden" id="_token" name="_token" value="{{ csrf_token() }}" >
            </div>
            <div class="form-group">
              <label for="tipoestacion">Tipo estaci&oacute;n</label>
              <select id="tipo" name="tipo" class="form-control">
                <option value="pronostico">Pron&oacute;stico</option>
                <option value="telemetrica">Telem&eacute;trica</option>
              </select>
            </div>
            <div class="form-group">
              <label for="nombreestacion">Nombre de la Estaci&oacute;n</label>
              <input type="text" class="form-control" id="nombreestacion" name="nombreestacion" placeholder="Nombre estaci&oacute;n">
            </div>
            <div class="form-group">
              <label for="latitud">Latitud</label>
              <input type="text" class="form-control" id="latitud" name="latitud" placeholder="Nombre estaci&oacute;n">
            </div>
            <div class="form-group">
              <label for="longitud">Longitud</label>
              <input type="text" class="form-control" id="longitud" name="longitud" placeholder="Nombre estaci&oacute;n">
            </div>
            <div class="form-group">
              <label for="elevacion">Elevaci&oacute;n</label>
              <input type="text" class="form-control" id="elevacion" name="elevacion" placeholder="Nombre estaci&oacute;n">
            </div>
            <div style="text-align:center;">
              <div class="btn-group" role="group" aria-label="...">
                <button id="btnNuevo" name="btnNuevo" type="button" class="btn btn-primary" onclick="nuevo();">Nuevo</button>
                <button id="btnCancelar" name="btnCancelar" type="button" class="btn btn-warning" onclick="cancelar();">Cancelar</button>
                <button id="btnGuardar" name="btnGuardar" type="button" class="btn btn-success" onclick="guardar();">Guardar</button>
              </div>
            </div>
           </form>
          </div>
          <div class="col-md-8" style="overflow:auto;">
            <div class="panel panel-default">
            <div class="panel-body">
            <div style="overflow:auto;">
              <table id="data_table" class="table table-striped table-bordered dt-responsive nowrap" cellspacing="0">
                <thead>
                  <tr>
                    <th>ID estaci&oacute;n</th>
                    <th>Tipo</th>
                    <th>Estaci&oacute;n</th>
                    <th>Latitud</th>
                    <th>Longitud</th>
                    <th>Elevaci&oacute;n</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @if(isset($estaciones))
                    @foreach($estaciones as $estacion)
                    <tr>
                      <td>{{ $estacion->idestacion }}</td>
                      <td>{{ $estacion->tipo }}</td>
                      <td>{{ $estacion->nombre_estacion }}</td>
                      <td>{{ $estacion->latitud }}</td>
                      <td>{{ $estacion->longitud }}</td>
                      <td>{{ $estacion->elevacion }}</td>
                      <td>
                        <div class="btn-group" role="group" aria-label="...">
                          <button type="button" class="btn btn-default"
                            onclick="editar('{{ $estacion->idestacion }}','{{ $estacion->tipo }}','{{ $estacion->nombre_estacion }}','{{ $estacion->latitud }}','{{ $estacion->longitud }}','{{ $estacion->elevacion }}');">Editar</button>
                          <button type="button" class="btn btn-default" onclick="eliminar('{{ $estacion->idestacion }}');">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                    @endforeach
                  @endif
                </tbody>
                <tfoot>
                  <tr>
                    <th>ID estaci&oacute;n</th>
                    <th>Tipo</th>
                    <th>Estaci&oacute;n</th>
                    <th>Latitud</th>
                    <th>Longitud</th>
                    <th>Elevaci&oacute;n</th>
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
</div>
@endsection

@section('dialogs')

@endsection

@section('js_includes')

@endsection
