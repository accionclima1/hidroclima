@extends('layouts.main')

@section('extra_header_includes')

@endsection

@section('javascript_variables')
  /*$.extend( $.fn.dataTable.defaults, {
      responsive: true
  });*/
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
    $("#form1").submit();
  }

  function editar(puntoid,nombre,latitud,longitud,coeficiente_A,coeficiente_B,coeficiente_C)
  {
    $("#form1")[0].reset();
    $("#form1 :input").prop("disabled", false);
    $("#btnNuevo").prop("disabled",true);
    $("#puntoid").val(puntoid);
    $("#nombre").val(nombre);
    $("#latitud").val(latitud);
    $("#longitud").val(longitud);
    $("#coeficiente_A").val(coeficiente_A);
    $("#coeficiente_B").val(coeficiente_B);
    $("#coeficiente_C").val(coeficiente_C);
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
        <h3>:: Puntos de medici&oacute;n de nivel y ecuaciones de caudal</h3>&nbsp;&nbsp;
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-4">
            <form id="form1" name="form1" method="post">
            <div class="form-group">
              <label for="nombre">Nombre o identificador del punto de medici&oacute;n</label>
              <input type="text" class="form-control" id="nombre" name="nombre" placeholder="Nombre">
              <input type="hidden" id="puntoid" name="puntoid">
              <input type="hidden" id="accion" name="accion">
              <input type="hidden" id="_token" name="_token" value="{{ csrf_token() }}" >
            </div>
            <div class="form-group">
              <label for="latitud">Latitud</label>
              <input type="text" class="form-control" id="latitud" name="latitud" placeholder="Latitud">
            </div>
            <div class="form-group">
              <label for="longitud">Longitud</label>
              <input type="text" class="form-control" id="longitud" name="longitud" placeholder="Longitud">
            </div>
            <div class="form-group" style="margin-bottom:5px;">
            <span class="label label-default">Coeficientes ecuaci&oacute;n de Nivel - Caudal</span>
            </div>
            <div class="form-group">
              <label for="elevacion">A</label>
              <input type="text" class="form-control" id="coeficiente_A" name="coeficiente_A" placeholder="Coeficiente A">
            </div>
            <div class="form-group">
              <label for="elevacion">B</label>
              <input type="text" class="form-control" id="coeficiente_B" name="coeficiente_B" placeholder="Coeficiente B">
            </div>
            <div class="form-group">
              <label for="elevacion">C</label>
              <input type="text" class="form-control" id="coeficiente_C" name="coeficiente_C" placeholder="Coeficiente C">
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
                    <th>ID Punto</th>
                    <th>Nombre</th>
                    <th>Latitud</th>
                    <th>Longitud</th>
                    <th>Coef. A</th>
                    <th>Coef. B</th>
                    <th>Coef. C</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @if(isset($puntos))
                    @foreach($puntos as $punto)
                    <tr>
                      <td>{{ $punto->puntoid }}</td>
                      <td>{{ $punto->nombre }}</td>
                      <td>{{ $punto->latitud }}</td>
                      <td>{{ $punto->longitud }}</td>
                      <td>{{ $punto->coeficientes[0] }}</td>
                      <td>{{ $punto->coeficientes[1] }}</td>
                      <td>{{ $punto->coeficientes[2] }}</td>
                      <td>
                        <div class="btn-group" role="group" aria-label="...">
                          <button type="button" class="btn btn-default"
                            onclick="editar('{{ $punto->puntoid }}','{{ $punto->nombre }}','{{ $punto->latitud }}','{{ $punto->longitud }}','{{ $punto->coeficientes[0] }}','{{ $punto->coeficientes[1] }}','{{ $punto->coeficientes[2] }}');">Editar</button>
                          <button type="button" class="btn btn-default" onclick="eliminar('{{ $punto->puntoid }}');">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                    @endforeach
                  @endif
                </tbody>
                <tfoot>
                  <tr>
                    <th>ID Punto</th>
                    <th>Nombre</th>
                    <th>Latitud</th>
                    <th>Longitud</th>
                    <th>Coef. A</th>
                    <th>Coei. B</th>
                    <th>Coef. C</th>
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
