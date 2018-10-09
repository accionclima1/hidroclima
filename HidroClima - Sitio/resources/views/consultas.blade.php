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
            "order": [[ 0, "desc" ]],
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
    $("#idestacion").prop("disabled",false);
    $("#form1").submit();
  }

  function editar(id)
  {
    $("#form1")[0].reset();
    $("#form1 :input").prop("disabled", false);
    $("#btnNuevo").prop("disabled",true);
    $("#destinatario").val(id);
    $("#accion").val('nuevo');
  }

  function eliminar(id)
  {
    if(confirm("Realmente desea eliminar el registro seleccionado?"))
    {
      $("#form1")[0].reset();
      $("#form1 :input").prop("disabled", false);
      $("#idmensaje").val(id);
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
        <h3>:: Consultas</h3>&nbsp;&nbsp;
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-4">
            <form id="form1" name="form1" method="post">
                <div class="form-group">
                  <label>Destinatario</label>
                  <select class="form-control" id="destinatario" name="destinatario">
                    @if(isset($destinatarios))
                      @foreach($destinatarios as $item)
                        <option value="{{ $item->id }}">{{ $item->name }} {{ $item->lastname }} - {{ $item->email }}</option>
                      @endforeach
                    @endif
                  </select>
                </div>
                <div class="form-group">
                  <label for="exampleInputEmail1">Mensaje</label>
                  <textarea class="form-control" id="mensaje" name="mensaje" cols="45" rows="4"></textarea>
                  <input type="hidden" id="accion" name="accion" />
                  <input type="hidden" id="_token" name="_token" value="{{ csrf_token() }}" />
                  <input type="hidden" id="idmensaje" name="idmensaje" />
                </div>
                <div style="text-align:center;">
              <div class="btn-group" role="group" aria-label="...">
                <button id="btnNuevo" name="btnNuevo" type="button" class="btn btn-primary" onclick="nuevo();">Nuevo mensaje</button>
                <button id="btnCancelar" name="btnCancelar" type="button" class="btn btn-warning" onclick="cancelar();">Cancelar</button>
                <button id="btnGuardar" name="btnGuardar" type="button" class="btn btn-success" onclick="guardar();">Enviar</button>
              </div>
            </div>
            </form>
          </div>
          <div class="col-md-8">
            <div class="panel panel-default">
            <div class="panel-body">
            <table id="data_table" class="table table-striped table-bordered dt-responsive nowrap" width="100%" cellspacing="0">
              <thead>
                <tr>
                  <th>Fecha hora</th>
                  <th>Remitente</th>
                  <th>Mensaje</th>
                  <th>&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                @if(isset($mensajes))
                  @foreach($mensajes as $item)
                  <tr>
                    <td>{{ substr($item->fechahora,0,16) }}</td>
                    <td>{{ $item->idremitente }}</td>
                    <td>{{ $item->mensaje }}</td>
                    <td>
                      <div class="btn-group" role="group" aria-label="...">
                        <button type="button" class="btn btn-default"
                          onclick="editar('{{ $item->idremitente }}');">Responder</button>
                        <button type="button" class="btn btn-default" onclick="eliminar('{{ $item->id }}');">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                  @endforeach
                @endif
              </tbody>
              <tfoot>
                <tr>
                  <th>Fecha hora</th>
                  <th>Remitente</th>
                  <th>Mensaje</th>
                  <th>&nbsp;</th>
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

@endsection

@section('js_includes')

@endsection
