<!DOCTYPE html>
<html>

<head>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <title>.:: Visor geogr&aacute;fico Clima 3</title>

    <!-- Bootstrap Core CSS -->
    <link href="<?php echo asset('bower_components/bootstrap/dist/css/bootstrap.min.css'); ?>" rel="stylesheet" />

    <!-- MetisMenu CSS -->
    <link href="<?php echo asset('bower_components/metisMenu/dist/metisMenu.min.css'); ?>" rel="stylesheet" />

    <!-- Timeline CSS -->
    <link href="<?php echo asset('dist/css/timeline.css') ?>" rel="stylesheet" />

    <!-- Custom CSS -->
    <link href="<?php echo asset('dist/css/sb-admin-2.css') ?>" rel="stylesheet" />

    <!-- Morris Charts CSS -->
    <link href="<?php echo asset('bower_components/morrisjs/morris.css') ?>" rel="stylesheet" />

    <!-- Custom Fonts -->
    <link href="<?php echo asset('bower_components/font-awesome/css/font-awesome.min.css'); ?>" rel="stylesheet" type="text/css">

    <link href="<?php echo asset('bower_components/datatables/media/css/dataTables.bootstrap.min.css') ?>" rel="stylesheet" />

    <!--link href="<?php echo asset('bower_components/datatables/media/css/jquery.dataTables.min.css') ?>" rel="stylesheet" /-->

    <link href="<?php echo asset('bower_components/datatables-responsive/css/responsive.bootstrap.min.css') ?>" rel="stylesheet" />

    <!--link href="<?php echo asset('bower_components/datatables-responsive/css/responsive.dataTables.css') ?>" rel="stylesheet" /-->

    <style type="text/css" class="init">

        body { font-size: 140% }

        table.dataTable th,
        table.dataTable td {
            white-space: nowrap;
        }

    </style>

    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
        <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->

    <!-- jQuery -->
    <script src="<?php echo asset('bower_components/jquery/dist/jquery.min.js');?>"></script>

    <!-- Bootstrap Core JavaScript -->
    <script src="<?php echo asset('bower_components/bootstrap/dist/js/bootstrap.min.js');?>"></script>
    <script src="<?php echo asset('bower_components/raphael/raphael-min.js');?>"></script>
    <script src="<?php echo asset('bower_components/morrisjs/morris.min.js');?>"></script>
    <script src="<?php echo asset('bower_components/datatables/media/js/jquery.dataTables.min.js');?>"></script>
    <script src="<?php echo asset('bower_components/datatables-responsive/js/dataTables.responsive.js');?>"></script>
    <script src="<?php echo asset('bower_components/datatables/media/js/dataTables.bootstrap.min.js');?>"></script>
    <script src="https://code.jquery.com/ui/1.11.1/jquery-ui.js"></script>
    <link rel="stylesheet" href="https://code.jquery.com/ui/1.10.4/themes/flick/jquery-ui.css">
    <script src="js/jquery-ui-slider-pips.js"></script>
    <link rel="stylesheet" href="css/jquery-ui-slider-pips.css">
    @section('extra_header_includes')

    @show

    <script type="text/javascript">
        @section('javascript_variables')

        @show
    </script>
</head>

<body class="claro">

    <div id="wrapper">

        <!-- Navigation -->
        <nav class="navbar navbar-default navbar-static-top" role="navigation" style="margin-bottom: 0">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="{{ URL::to('/') }}/">Visor Geogr&aacute;fico Clima 3<!--img src="{{ URL::to('/') }}/imgs/title1.png" alt="escudo" /--></a>
            </div>
            <!-- /.navbar-header -->

              <!--ul class="nav navbar-top-links navbar-right">
                  @if(Auth::user()!=null && Auth::user()->usuarioid==1)
                  <li class="dropdown">
                      <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                          <i class="fa fa-ellipsis-v fa-fw"></i>  <i class="fa fa-caret-down"></i>
                      </a>
                      <ul class="dropdown-menu dropdown-messages">
                         <li>
                              <a href="{{URL::to('/')}}/modulos">
                                  <div>
                                      <i class="fa fa-cogs"></i>  M&oacute;dulos
                                  </div>
                              </a>
                          </li>
                          <li>
                              <a href="{{URL::to('/')}}/areasmonitoreo">
                                  <div>
                                      <i class="fa fa-cogs"></i>  &Aacute;rea de Monitoreo
                                  </div>
                              </a>
                          </li>
                          <li>
                              <a href="{{URL::to('/')}}/etapasobservatorio">
                                  <div>
                                      <i class="fa fa-cogs"></i>  Etapas por &Aacute;rea
                                  </div>
                              </a>
                          </li>
                          <li>
                              <a href="{{URL::to('/')}}/usuarios">
                                  <div>
                                      <i class="fa fa-cogs"></i>  Usuarios
                                  </div>
                              </a>
                          </li>
                          <li>
                              <a href="{{URL::to('/')}}/areasmodulos">
                                  <div>
                                      <i class="fa fa-cogs"></i>  Acceso m&oacute;dulo &aacute;rea
                                  </div>
                              </a>
                          </li>
                          <li class="divider"></li>
                          <li>
                              <a href="{{URL::to('/')}}/seccionesinforme">
                                  <div>
                                      <i class="fa fa-cogs"></i> Secciones informe integrado
                                  </div>
                              </a>
                          </li>
                      </ul>
                      
                  </li>
                  @endif
                  
                  <li class="dropdown">
                      <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                          <i class="fa fa-user fa-fw"></i>  <i class="fa fa-caret-down"></i>
                      </a>
                      <ul class="dropdown-menu dropdown-user">
                          <li><a href="{{ URL::to("/") . "/auth/logout" }}"><i class="fa fa-sign-out fa-fw"></i> Salir</a>
                          </li>
                      </ul>
                      
                  </li>
                  
              </ul-->

            <!-- /.navbar-top-links -->
            <div class="navbar-default sidebar" role="navigation">
                <div class="sidebar-nav navbar-collapse">
                    <ul class="nav" id="side-menu">
                        <li class="sidebar-search" style="text-align:center;">
                            <div class="input-group custom-search-form" style="margin:auto;">
                            <strong>Contenidos</strong>
                            </div>
                            <!-- /input-group -->
                        </li>

                            <li class="active">
                                <a href="#"><i class="fa fa-folder-o fa-fw"></i> Pron&oacute;stico <span class="fa arrow"></a>
                                <ul class="nav nav-second-level collapse-in">
                                    <li>
                                        <a class="active" href="#" onclick="showMiembro(1);"><i class="fa fa-map fa-fw"></i>Miembro 1</a>
                                    </li>
                                    <li>
                                        <a href="#" onclick="showMiembro(2);"><i class="fa fa-map fa-fw"></i>Miembro 2</a>
                                    </li>
                                    <li>
                                        <a href="#" onclick="showMiembro(3);"><i class="fa fa-map fa-fw"></i>Miembro 3</a>
                                    </li>
                                    <li>
                                        <a href="#" onclick="showMiembro(4);"><i class="fa fa-map fa-fw"></i>Miembro 4</a>
                                    </li>
                                </ul>
                            </li>
                               @if(isset($layer_groups))
                                <li>
                                    <a href="#"><i class="fa fa-folder-o fa-fw"></i> L&iacute;nea base <span class="fa arrow"></span></a>
                                    <ul class="nav nav-second-level collapse-in">
                                    @foreach($layer_groups as $item)
                                    <li>
                                        @if(!($item->layergroup=='DESVIACIONES_CHIRPS_PROMEDIO' || $item->layergroup=='DESVIACIONES_CHIRP_PROMEDIO'))
                                            <a href="#"><i class="fa fa-folder-o fa-fw"></i> {{ str_replace("_"," ",$item->layergroup) }} <span class="fa arrow"></span></a>
                                            <ul class="nav nav-third-level collapse-in">
                                                @for ($i = 2012; $i < 2017; $i++)
                                                <li>
                                                    <a href="#" onclick="getLayerGroupByYear('{{ $item->layergroup }}','{{ $i }}');"><i class="fa fa-map fa-fw"></i> Mapas mensuales a&ntilde;o {{ $i }}</span></a>
                                                </li>
                                                @endfor
                                            </ul>
                                        @else
                                            <a href="#" onclick="getLayerGroupByYear('{{ $item->layergroup }}','{{ $i }}');"><i class="fa fa-map fa-fw"></i>{{ str_replace("_"," ",$item->layergroup) }}</a>
                                        @endif
                                    </li>
                                    @endforeach
                                    </ul> 
                                </li>
                              @endif
                            
                    </ul>
                </div>
                <!-- /.sidebar-collapse -->
            </div>
            <!-- /.navbar-static-side -->
        </nav>

        <div id="page-wrapper">
        	@section('main_content')
        		Content
            @show
        </div>
        <!-- /#page-wrapper -->

    </div>
    <!-- /#wrapper -->
    @section('dialogs')
    	Dialogos
    @show
    <!-- Metis Menu Plugin JavaScript -->
    <script src="<?php echo asset('bower_components/metisMenu/dist/metisMenu.min.js');?>"></script>

    <!-- Custom Theme JavaScript -->
    <script src="<?php echo asset('dist/js/sb-admin-2.js');?>"></script>

    @section('js_includes')

    @show

</body>

</html>
