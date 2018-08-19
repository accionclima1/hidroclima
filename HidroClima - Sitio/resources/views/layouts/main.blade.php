<!DOCTYPE html>
<html>
<head>
  <title>.:: Hidro Clima</title>
  
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <link rel="stylesheet" type="text/css" href="{{ URL::to('/') }}/css/vendor.css">
  <link rel="stylesheet" type="text/css" href="{{ URL::to('/') }}/css/flat-admin.css">

  <!-- Theme -->
  <link rel="stylesheet" type="text/css" href="{{ URL::to('/') }}/css/theme/blue-sky.css">
  <script type="text/javascript" src="{{ URL::to('/') }}/js/jquery.min.js"></script>
  <script type="text/javascript" src="{{ URL::to('/') }}/js/leaflet.js"></script>
  <link href="{{ URL::to('/') }}/js/leaflet.css" rel="stylesheet" />
  <link href="<?php echo asset('components/datatables/media/css/dataTables.bootstrap.min.css') ?>" rel="stylesheet" />
  <link href="<?php echo asset('components/datatables-responsive/css/responsive.bootstrap.min.css') ?>" rel="stylesheet" />
  <script src="<?php echo asset('components/datatables/media/js/jquery.dataTables.min.js');?>"></script>
  <script src="<?php echo asset('components/datatables-responsive/js/dataTables.responsive.js');?>"></script>
  <script src="<?php echo asset('components/datatables/media/js/dataTables.bootstrap.min.js');?>"></script>
    
  @section('extra_header_includes')

  @show
  <script type="text/javascript">
    @section('javascript_variables')

    @show
  </script>
</head>
<body>
  <div class="app app-blue-sky">
    <aside class="app-sidebar" id="sidebar">
    <div class="sidebar-header">
      <a class="sidebar-brand" href="#"><img width="130px" src="{{ URL::to('/') }}/images/icon.png" class="img-responsive" alt="LOGO" /></a>
      <button type="button" class="sidebar-toggle">
        <i class="fa fa-times"></i>
      </button>
    </div>
    <div class="sidebar-menu">
          <ul class="sidebar-nav">
            <li class="active">
              <a href="{{ URL::to('/') }}">
                <div class="icon">
                  <i class="fa fa-tasks" aria-hidden="true"></i>
                </div>
                <div class="title">Tablero</div>
              </a>
            </li>
            <li class="@@menu.messaging">
              <a href="{{ URL::to('/') }}/consultas">
                <div class="icon">
                  <i class="fa fa-comments" aria-hidden="true"></i>
                </div>
                <div class="title">Consultas</div>
              </a>
            </li>
            <li class="@@menu.messaging">
              <a href="{{ URL::to('/') }}/consultaestaciones">
                <div class="icon">
                  <i class="fa fa-bar-chart" aria-hidden="true"></i>
                </div>
                <div class="title">Estaciones</div>
              </a>
            </li>
            @if(isset($nivel) && $nivel==1)
              <li class="dropdown ">
                <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                  <div class="icon">
                    <i class="fa fa-cube" aria-hidden="true"></i>
                  </div>
                  <div class="title">Configuraciones</div>
                </a>
                <div class="dropdown-menu">
                  <ul>
                    <li class="section"><i class="fa fa-database" aria-hidden="true"></i> Base de datos</li>
                    <li><a href="{{ URL::to('/') }}/estaciones">Estaciones</a></li>
                    <li><a href="{{ URL::to('/') }}/pchs">PCHs</a></li>
                    <li><a href="{{ URL::to('/') }}/puntosnivel">Puntos de medici&oacute;n de nivel</a></li>
                    <li class="line"></li>
                  </ul>
                </div>
              </li>
            @endif
          </ul>
        </div>
  </aside>

  <div class="app-container">
  
    <nav class="navbar navbar-default" id="navbar">
      <div class="container-fluid">
        <div class="navbar-collapse collapse in">
          <ul class="nav navbar-nav navbar-mobile">
            <li>
              <button type="button" class="sidebar-toggle">
                <i class="fa fa-bars"></i>
              </button>
            </li>
            <li class="logo">
              <a class="navbar-brand" href="#"><img width="130px" src="{{ URL::to('/') }}/images/icon.png" class="img-responsive" alt="LOGO" /></a>
            </li>
            <li>
    
            </li>
          </ul>
    
          <ul class="nav navbar-nav navbar-right">
               <img src="{{ URL::to('/') }}/images/gota.png" class="img-responsive" alt="logo" />
          </ul>
        </div>
      </div>
    </nav>

    @section('main_content')
		  Content
    @show
  </div>

  </div>
@section('dialogs')
	Dialogos
@show
  
  <script type="text/javascript" src="{{ URL::to('/') }}/js/vendor.js"></script>
  <script type="text/javascript" src="{{ URL::to('/') }}/js/app.js"></script>
  <script src="{{ URL::to('/') }}/js/jquery-ui.min.js" type="text/javascript"></script>
@section('js_includes')
  
@show
</body>
</html>
