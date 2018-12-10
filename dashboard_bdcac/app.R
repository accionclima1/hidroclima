library(shiny)
library(shinydashboard)
library(leaflet)
library(ggplot2)
library(dplyr)
library(shinyjs)
Sys.setlocale("LC_ALL", "ES_ES.UTF-8")

setwd('/Users/emartinez/Desktop/Hidroclima/dashboard_bdcac')

source(file='bdcac.functions.R')

estaciones <- readRDS('data/estaciones.rds')
estacionesWeb <- readRDS('data/estacionesWeb.rds')
institucionesList <- distinct(data.frame(paste(estaciones$inspais, ' - ', estaciones$insnombre,sep=""))) %>% select('Pa\u00CDs - Instituci\u00F3n'=1) 
variables_estaciones <- readRDS('data/variables_estaciones.rds')
lluvia_anual_estacion <- readRDS('data/lluvia_anual_estacion.rds')
totales_mensuales <- readRDS('data/totales_mensuales.rds')
totales_mensuales_long <- readRDS('data/totales_mensuales_long.rds')
periodos_perspectiva <- readRDS('data/periodos_perspectiva.rds')
maximos_diarios <- readRDS('data/maximos_diarios.rds')
datosDiarios <- readRDS('data/datosDiarios.rds')
header <- dashboardHeader(
  tags$li(class = "dropdown",
          tags$style(".main-header {max-height: 75px}"),
          tags$style(".main-header .logo {height: 75px}"),
          tags$style(".main-header .navbar {padding-top: 10px}")
  ),
  titleWidth = '300px',
  title = 'Visualizador BDCAC'
)
header$children[[2]]$children <- tags$a(href='/', tags$img(class="logocrrh",src='http://blog.centroclima.org/wp-content/uploads/2018/08/cropped-logos-blog-1.png')) 
ui <- dashboardPage(
  header,
  dashboardSidebar(
    tags$style(".left-side, .main-sidebar {padding-top: 75px}"),
    width = '300px',
    tags$div(
      class="titulo_sidebar",
      titlePanel("BDCAC")
    ),
    tags$hr(),
    sidebarMenu(
      id='tabs',
      menuItem("Gr\u00E1ficos Precipitaci\u00F3n Anual", tabName = "graficos_anuales", icon = icon("map")),
      menuItem("Gr\u00E1ficos Precipitaci\u00F3n Mensual", tabName = "graficos_mensuales", icon = icon("map")),
      menuItem("Gr\u00E1ficos Precipitaci\u00F3n Mensual Promedio", tabName = "graficos_mensuales_promedio", icon = icon("map")),
      menuItem("D\u00EDas con lluvia", tabName = "dias_lluvia", icon=icon("map")),
      menuItem("Per\u00EDodos de referencia cambio clim\u00E1ftico", tabName="periodos_referencia", icon=icon("map"))
    )
  ),
  dashboardBody(
    tags$head(
      tags$link(rel = "stylesheet", type = "text/css", href = "jquery.loadingModal.min.css"),
      tags$link(rel = "stylesheet", type = "text/css", href = "jquery-ui.min.css"),
      tags$script(src="jquery-ui.min.js"),
      tags$script(src="jquery.loadingModal.min.js"),
      tags$script(src = "turf.min.js"),
      tags$script(src = "choropleth.js"),
      tags$script(src = "app.js"),
      tags$link(rel = "stylesheet", type = "text/css", href = "app.css")
    ),
    useShinyjs(),
    fluidRow(
      column(width=9,
             tabItems(
               tabItem(tabName='graficos_anuales',
                       fluidRow(
                         column(width = 12,
                                box(width = NULL, solidHeader = TRUE,
                                    fluidRow(
                                      column(width=4,
                                             selectInput("instituciones", "Pa\u00CDs - Instituci\u00F3n", institucionesList, selected = 1, multiple = FALSE, selectize = FALSE)),
                                      column(width=8,
                                             selectInput("estaciones", 'Estaci\u00F3n', choices = NULL))
                                      
                                    )
                                ),
                                box(width = NULL, solidHeader = TRUE, status = 'info',
                                    fluidRow(
                                      column(width=12, 
                                             leafletOutput("main", height = 660)
                                      )
                                    )
                                ),
                                box(width = NULL, status = 'primary',
                                    column(width=12,
                                           plotOutput("chart")
                                    )
                                )
                         )
                       ),
                       fluidRow(
                         column(width=6,
                                box(width = NULL, title="Totales Anuales", solidHeader = TRUE, status='primary',
                                    tags$div(class="divScroll",dataTableOutput("datosAnuales"))
                                )
                         ),
                         column(width=6,
                                box(width=NULL,title="M\u00E1ximo de 24 horas por a\u00F1o",solidHeader=TRUE,status='primary',
                                    tags$div(class="divScroll",dataTableOutput("maximosAnuales"))
                                )
                         )
                       )
               ),
               tabItem(tabName="graficos_mensuales",
                       fluidRow(
                         column(width = 12,
                                box(width = NULL, solidHeader = TRUE,
                                    fluidRow(
                                      column(width=4,
                                             selectInput("instituciones_mes", "Instituci\u00F3n", distinct(data.frame(paste(estaciones$inspais, ' - ', estaciones$insnombre,sep=""))), selected = 1, multiple = FALSE, selectize = FALSE)),
                                      column(width=6,
                                             selectInput("estaciones_mes", 'Estaci\u00F3n', choices = NULL))
                                      
                                    )
                                ),
                                box(width = NULL, solidHeader = TRUE, status='info',
                                    fluidRow(
                                      column(width=12, 
                                             leafletOutput("main_mes", height = 660)
                                      )
                                    )
                                ),
                                box(width=NULL,
                                    column(width=12,
                                           sliderInput("year","A\u00F1o",min=min(totales_mensuales$date_part[totales_mensuales$date_part>1900]),max=max(totales_mensuales$date_part[totales_mensuales$date_part>1900]),step=1,value=min(totales_mensuales$date_part[totales_mensuales$date_part>1900]))
                                    )    
                                ),
                                box(width = NULL, status='primary',
                                    column(width=12,
                                           plotOutput("chart_mes")
                                    )
                                ),
                                box(width = NULL, status='primary',
                                    tags$div(class="divScroll",dataTableOutput("datosMensuales"))
                                )
                         )
                       )
               ),
               tabItem("graficos_mensuales_promedio",
                       fluidRow(
                         column(width=12,
                                box(width = NULL, solidHeader = TRUE,
                                    fluidRow(
                                      column(width=4,
                                             selectInput("instituciones_mes_promedio", "Instituci\u00F3n", distinct(data.frame(paste(estaciones$inspais, ' - ', estaciones$insnombre,sep=""))), selected = 1, multiple = FALSE, selectize = FALSE)),
                                      column(width=6,
                                             selectInput("estaciones_mes_promedio", 'Estaci\u00F3n', choices = NULL))
                                      
                                    )
                                ),
                                box(width = NULL, solidHeader = TRUE, status='info',
                                    fluidRow(
                                      column(width=12, 
                                             leafletOutput("main_mes_promedio", height = 660)
                                      )
                                    )
                                ),
                                box(width = NULL, info='primary',
                                    column(width=12,
                                           plotOutput("chart_mes_promedio")
                                    )
                                )
                         )
                       ),
                       fluidRow(
                         column(width=4,
                                box(width = NULL, title="Promedio meses m\u00e1s lluviosos", solidHeader = TRUE, status = 'primary',
                                    #column(width=12,dataTableOutput("datosMensualesPromedioLluviosos"))
                                    tags$div(class="divScroll", dataTableOutput("datosMensualesPromedioLluviosos"))
                                )
                         ),
                         column(width=4,
                                box(width=NULL, title="Promedio meses menos lluviosos", solidHeader = TRUE, status = 'primary',
                                    tags$div(class="divScroll", dataTableOutput("datosMensualesPromedioSecos"))     
                                )  
                         ),
                         column(width=4,
                                box(width=NULL,  title="M\u00e1ximo registrado", solidHeader = TRUE, status = 'primary',
                                    tags$div(class="divScroll", dataTableOutput("datosMensualesMaximo"))
                                )
                         )
                       ),
                       fluidRow(
                         column(width=6,
                                box(width=NULL, title="Límite Tercil Inferior periodos MJJ, ASO, DEFM", solidHeader = TRUE, status = 'primary',
                                    tags$div(class="divScroll", dataTableOutput("tercilInferior")),
                                    HTML("<i class=\"fa fa-info-circle\" title=\"MJJ - Mayo Junio Julio, ASO - Agosto Septiembre Octubre, DEFM - Diciembre Enero Febrero Marzo\"></i>")
                                )
                         ),
                         column(width=6,
                                box(width=NULL, title="Límite Tercil Superior periodos MJJ, ASO, DEFM", solidHeader = TRUE, status = 'primary',
                                    tags$div(class="divScroll", dataTableOutput("tercilSuperior")),
                                    HTML("<i class=\"fa fa-info-circle\" title=\"MJJ - Mayo Junio Julio, ASO - Agosto Septiembre Octubre, DEFM - Diciembre Enero Febrero Marzo\"></i>")
                                )
                         )
                       )
               ),
               tabItem("dias_lluvia",
                       fluidRow(
                         column(width = 12,
                                box(width = NULL, solidHeader = TRUE,
                                    fluidRow(
                                      column(width=4,
                                             selectInput("instituciones_dias_lluvia", "Instituci\u00F3n", distinct(data.frame(paste(estaciones$inspais, ' - ', estaciones$insnombre,sep=""))), selected = 1, multiple = FALSE, selectize = FALSE)),
                                      column(width=6,
                                             selectInput("estaciones_dias_lluvia", 'Estaci\u00F3n', choices = NULL))
                                      
                                    )
                                ),
                                box(width = NULL, solidHeader = TRUE, status='info',
                                    fluidRow(
                                      column(width=12, 
                                             leafletOutput("main_dias_lluvia", height = 660)
                                      )
                                    )
                                )
                         )
                       ),
                       fluidRow(
                         column(width=12,
                                box(width=NULL,
                                    column(width=12,
                                           sliderInput("mmlluvia","Lluvia mm",min=0,max=100,step=1,value=50))
                                ),    
                                box(width = NULL,title=textOutput('title'),status='primary', solidHeader = TRUE,
                                    tags$div(class="divScroll",dataTableOutput("datosDias"))
                                )
                         )
                       )
               ),
               tabItem("periodos_referencia",
                       fluidRow(
                         column(width = 12,
                                box(width = NULL, solidHeader = TRUE,
                                    fluidRow(
                                      column(width=4,
                                             selectInput("instituciones_periodos", "Instituci\u00F3n", distinct(data.frame(paste(estaciones$inspais, ' - ', estaciones$insnombre,sep=""))), selected = 1, multiple = FALSE, selectize = FALSE)),
                                      column(width=6,
                                             selectInput("estaciones_periodos", 'Estaci\u00F3n', choices = NULL))
                                      
                                    )
                                ),
                                box(width = NULL, solidHeader = TRUE, status='info',
                                    fluidRow(
                                      column(width=12, 
                                             leafletOutput("main_periodos", height = 660)
                                      )
                                    )
                                )
                         )
                       ),
                       fluidRow(
                         column(width=6,
                                box(width=NULL, title="Promedio de per\u00EDodo de referencia", solidHeader = TRUE, status = 'primary',
                                    tags$div(class="divScroll", dataTableOutput('referencia'))   
                                )
                         ),
                         column(width=6,
                                box(width=NULL, title="Gr\u00E1fico", solidHeader = TRUE, status = 'primary',
                                    column(width=12, plotOutput('plot_referencia'))
                                )    
                         )
                       )
               )
             )
        ),
        column(width=3,
               box(width=NULL, solidHeader = TRUE, title="Capas", status='primary', collapsible = FALSE,
                   #column(width=12,
                          tags$div(class="divScroll",
                            checkboxInput("main_estaciones","Estaciones",value=TRUE),
                            wellPanel(
                              checkboxInput("main_promedios_anuales","Lluvia promedio anual",value=FALSE),
                              sliderInput('main_year_selector','A\u00F1o',min=min(lluvia_anual_estacion$date_part),max=max(lluvia_anual_estacion$date_part),value=max(lluvia_anual_estacion$date_part))
                            ),
                            wellPanel(
                              #tags$div(class="divScroll",
                                checkboxInput("main_promedio_septiembre","Lluvia promedio meses lluviosos y meses secos",value=FALSE),
                                selectInput('main_mes_select',label='Mes',choices=c('Septiembre','Octubre','Marzo','Abril'))
                              #)
                            ),
                            wellPanel(
                              #tags$div(class="divScroll",
                                checkboxInput("main_periodos_perspectiva","Lluvia promedio periodos",value=FALSE),
                                selectInput('main_periodos_select',label='Período',choices=c('MJJ','ASO','DEFM')),
                                HTML("<i class=\"fa fa-info-circle\" title=\"MJJ - Mayo Junio Julio, ASO - Agosto Septiembre Octubre, DEFM - Diciembre Enero Febrero Marzo\"></i>")
                              #)
                            ),
                            wellPanel(
                              #tags$div(class="divScroll",
                                checkboxInput("main_limite_terciles","Limite de terciles periodos MMJ, ASO, DEFM",value=FALSE),
                                selectInput('main_tercil_periodo',label='Período',choices=c('MJJ','ASO','DEFM')),
                                selectInput('main_tercil_valor',label='Tercil',choices=c('Tercil inferior','Tercil superior')),
                                HTML("<i class=\"fa fa-info-circle\" title=\"MJJ - Mayo Junio Julio, ASO - Agosto Septiembre Octubre, DEFM - Diciembre Enero Febrero Marzo\"></i>")
                              #)
                            ),
                            wellPanel(
                              #tags$div(class="divScroll",
                                checkboxInput("main_promedio_dias","Número de dias con lluvia mayor a",value=FALSE),
                                sliderInput('main_mm_lluvia','Lluvia mm',min=0,max=100,value=50)
                              #)
                            ),
                            wellPanel(
                              #tags$div(class="divScroll",
                                checkboxInput("main_periodos_30","Promedio periodos de 30 a\u00F1os",value=FALSE),
                                selectInput('main_periodo_30',label='Período',choices=c('1971 - 2000','1981 - 2010'))
                              #)
                            ),
                            tags$hr(),
                            wellPanel(
                              tags$h4('Opciones del mapa'),
                              selectInput('celda',label='Tama\u00F1o de celda (km)',choices=c(15,25,50),selected=50),
                              selectInput('colorramp',label="Escala de colores",choices=c('Opción 1'=1,'Opción 2'=2),selected=1),
                              tags$div(id='opcion1',class='legend2',
                                HTML("<ul><li style='background-color: #f7fcf0'></li><li style='background-color: #e0f3db'></li><li style='background-color: #ccebc5'></li><li style='background-color: #a8ddb5'></li><li style='background-color: #7bccc4'></li><li style='background-color: #4eb3d3'></li><li style='background-color: #2b8cbe'></li><li style='background-color: #0868ac'></li><li style='background-color: #084081'></li><ul>")),
                              tags$div(id='opcion2',class='legend2',
                                HTML("<ul><li style='background-color: #ffffe5'></li><li style='background-color: #fff7bc'></li><li style='background-color: #fee391'></li><li style='background-color: #fec44f'></li><li style='background-color: #fe9929'></li><li style='background-color: #ec7014'></li><li style='background-color: #cc4c02'></li><li style='background-color: #993404'></li><li style='background-color: #662506'></li><ul>"))
                            )
                            
                      )
                   #)
               )
        )
      ),
      fluidRow(
        column(width=12,
               tags$div(class="alert alert-success",
                 "En el caso de elementos en los que el valor mensual es la suma de los valores diarios en lugar de un valor medio (por ejemplo, lluvia), un valor mensual solo debería calcularse si se dispone de todas las observaciones diarias o si se incorporan todos los días en los que falten datos en una observación que incluya el período de los datos ausentes en el día en el que se reinician las observaciones. (Guia de practices climatológicas OMM 100 2011 capitulo 4.) por tanto se recomienda no calcular un valor mensual si faltan más de 10 valores diarios o 5 o más valores diarios consecutivos."
               )
        )
      )
    )
)

server <- function(input, output, session) {
  output$chart <- renderPlot({
    ggplot(data = dplyr::filter(lluvia_anual_estacion,lluvia_anual_estacion$estnombre==input$estaciones), 
          aes_string(x = 'date_part', y = 'sum', color='count')) + geom_col(fill='#5688d8',alpha=0.7,size=1.5) +
      labs(title="Precipitaci\u00F3n total anual", x="A\u00F1o", y="Total (mm)", color="No. d\u00EDas de registro") + 
      scale_x_continuous(breaks=dplyr::filter(lluvia_anual_estacion,lluvia_anual_estacion$estnombre==input$estaciones)$date_part) +
      scale_colour_gradient(low = "#ef8d1c", high = "#2e39d3") + theme(plot.title = element_text(hjust=0.5, size = 25, face = "bold"), axis.text.x = element_text(angle = 90, hjust = 1))
  })
  
  output$chart_mes <- renderPlot({
    ggplot(data = dplyr::filter(totales_mensuales_long,totales_mensuales_long$estnombre==input$estaciones_mes & totales_mensuales_long$year==input$year),  
           aes_string(x = 'month', y = 'total')) + geom_col(fill='#5688d8',alpha=0.7,size=1.5) +
      labs(title="Precipitaci\u00F3n mensual", x="Mes", y="Total (mm)") + 
      scale_x_continuous(breaks=c(1,2,3,4,5,6,7,8,9,10,11,12),labels=c('Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic')) + 
      theme(plot.title = element_text(hjust=0.5, size = 25, face = "bold"))
  })
  
  output$chart_mes_promedio <- renderPlot({
    ggplot(data = dplyr::filter(totales_mensuales_long,totales_mensuales_long$estnombre==input$estaciones_mes_promedio) %>%
             group_by(month) %>% summarise(mean=mean(total)),  
           aes_string(x = 'month', y = 'mean')) + geom_col(fill='#5688d8',alpha=0.7,size=1.5) +
      labs(title="Precipitaci\u00F3n mensual promedio", x="Mes", y="Total (mm)") + 
      scale_x_continuous(breaks=c(1,2,3,4,5,6,7,8,9,10,11,12),labels=c('Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic')) + 
      theme(plot.title = element_text(hjust=0.5, size = 25, face = "bold"))
  })
  
  output$plot_referencia <- renderPlot({
    ggplot(data=rbind(data.frame('1971 - 2000',lluvia_anual_estacion %>% filter(estnombre==input$estaciones_periodos & date_part >= 1971 & date_part <= 2000) %>% summarize(mean=mean(sum),count=n())) %>% select('Periodo'=1,'Promedio'=mean, 'A\u00F1os'=count),data.frame('1981 - 2010',lluvia_anual_estacion %>% filter(estnombre==input$estaciones_periodos & date_part >= 1981 & date_part <= 2010) %>% summarize(mean=mean(sum),count=n())) %>% select('Periodo'=1,'Promedio'=mean, 'A\u00F1os'=count)),
           aes_string(x='Periodo',y='Promedio')) + geom_col(fill='#5688d8',alpha=0.7,size=1.5,width=0.3) + 
            labs(title="Precipitaci\u00F3n promedio periodo de referencia", x="Periodo", y="Promedio (mm)") + 
      theme(plot.title = element_text(hjust=0.5, size = 14, face = "bold"))
  })
  
  output$datosAnuales <- renderDataTable(dplyr::filter(lluvia_anual_estacion,lluvia_anual_estacion$estnombre==input$estaciones) %>% select('A\u00F1o'='date_part','Total (mm)'='sum','Dias disponibles'='count'),options = list(pageLength=10,info=FALSE,language = list(url = '//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json')))
  
  output$datosMensuales <- renderDataTable(dplyr::filter(totales_mensuales_long,totales_mensuales_long$estnombre==input$estaciones_mes & totales_mensuales_long$year==input$year) %>% select('A\u00F1o'='year','Mes'='month','Total (mm)'='total','Dias registrados'='dias'),options = list(pageLength=12,info=FALSE,language = list(url = '//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json')))
  
  output$datosMensualesPromedioLluviosos <- renderDataTable(data.frame(c('Septiembre','Octubre'),dplyr::filter(totales_mensuales_long,totales_mensuales_long$estnombre==input$estaciones_mes_promedio) %>%
                                                                         group_by(month) %>% summarise(mean=mean(total)) %>% filter(month==9 | month==10) %>% select('Promedio'='mean')) %>% select('Meses'=1,'Promedio (mm)'=2), options=list(paging=FALSE,searching=FALSE,info=FALSE,language = list(url = '//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json')))
  
  output$datosMensualesPromedioSecos <- renderDataTable(data.frame(c('Marzo','Abril'),dplyr::filter(totales_mensuales_long,totales_mensuales_long$estnombre==input$estaciones_mes_promedio) %>%
                                                                         group_by(month) %>% summarise(mean=mean(total)) %>% filter(month==3 | month==4) %>% select('Promedio'='mean')) %>% select('Meses' = 1,'Promedio (mm)' = 2),options=list(paging=FALSE,searching=FALSE,info=FALSE,language = list(url = '//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json')))
  
  output$datosMensualesMaximo <- renderDataTable(data.frame(dplyr::filter(totales_mensuales_long,totales_mensuales_long$estnombre==input$estaciones_mes_promedio)[which.max(dplyr::filter(totales_mensuales_long,totales_mensuales_long$estnombre==input$estaciones_mes_promedio)$total),],getMes(dplyr::filter(totales_mensuales_long,totales_mensuales_long$estnombre==input$estaciones_mes_promedio)[which.max(dplyr::filter(totales_mensuales_long,totales_mensuales_long$estnombre==input$estaciones_mes_promedio)$total),]$month)) %>% select('A\u00F1o'=5,'Mes'=9,'Valor (mm)'=7),options=list(paging=FALSE,searching=FALSE,info=FALSE,language = list(url = '//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json')))
  
  output$tercilInferior <- renderDataTable((data.frame(input$estaciones_mes_promedio,quantile((periodos_perspectiva %>% filter(estnombre==input$estaciones_mes_promedio))$mjj,0.33,na.rm=TRUE),
              quantile((periodos_perspectiva %>% filter(estnombre==input$estaciones_mes_promedio))$aso,0.33,na.rm=TRUE),
              quantile((periodos_perspectiva %>% filter(estnombre==input$estaciones_mes_promedio))$defm,0.33,na.rm=TRUE)) 
              %>% select ('Estacion'=1,'MJJ (mm)'=2,'ASO (mm)'=3,'DEFM (mm)'=4)),options=list(paging=FALSE,searching=FALSE,info=FALSE,language = list(url = '//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json')))
  
  output$tercilSuperior <- renderDataTable((data.frame(input$estaciones_mes_promedio,quantile((periodos_perspectiva %>% filter(estnombre==input$estaciones_mes_promedio))$mjj,0.66,na.rm=TRUE),
                                                       quantile((periodos_perspectiva %>% filter(estnombre==input$estaciones_mes_promedio))$aso,0.66,na.rm=TRUE),
                                                       quantile((periodos_perspectiva %>% filter(estnombre==input$estaciones_mes_promedio))$defm,0.66,na.rm=TRUE)) 
                                            %>% select ('Estacion'=1,'MJJ (mm)'=2,'ASO (mm)'=3,'DEFM (mm)'=4)),options=list(paging=FALSE,searching=FALSE,info=FALSE,language = list(url = '//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json')))
  
  output$maximosAnuales <- renderDataTable({
        nmaximos_diarios <- maximos_diarios %>% inner_join((lluvia_anual_estacion %>% select('estcodigobdcac'=1,'estnombre'=2,'yyyy'=5,'count'=7)),by=c('estcodigobdcac','yyyy'))
        dplyr::filter(nmaximos_diarios,estnombre.x==input$estaciones) %>% select('Fecha'=diafecha,'Valor (mm)'=diavalor,'Dias disponibles'=count)},options=list(pageLength=10,info=FALSE,language = list(url = '//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json'))
    )
  
  output$datosDias <- renderDataTable(datosDiarios %>% filter(estnombre==input$estaciones_dias_lluvia & diavalor >= input$mmlluvia) %>% group_by(yyyy) %>% summarise(count=n()) %>% select('A\u00F1o'=yyyy,'No. Dias'=count),options=list(pageLength=10,info=FALSE,language = list(url = '//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json')))
  
  output$referencia <- renderDataTable(rbind(data.frame('1971 - 2000',lluvia_anual_estacion %>% filter(estnombre==input$estaciones_periodos & date_part >= 1971 & date_part <= 2000) %>% summarize(mean=mean(sum),count=n())) %>% select('Periodo'=1,'Promedio'=mean, 'A\u00F1os'=count),data.frame('1981 - 2010',lluvia_anual_estacion %>% filter(estnombre==input$estaciones_periodos & date_part >= 1981 & date_part <= 2010) %>% summarize(mean=mean(sum),count=n())) %>% select('Periodo'=1,'Promedio'=mean, 'A\u00F1os'=count)) %>% select('Periodo'=1,'Promedio (mm)'=2, 'A\u00F1os'=3),options=list(info=FALSE,paging=FALSE,searching=FALSE,language = list(url = '//cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json')))
  
  output$main <- renderLeaflet({
    leaflet(options = leafletOptions(zoomControl = FALSE)) %>% setView(lng = -85.5, lat = 11.5, zoom = 6) %>%
      addProviderTiles(providers$Esri.WorldImagery,
                       options = providerTileOptions(noWrap = TRUE), group="Imagery"
      ) %>%
      addProviderTiles(providers$CartoDB.PositronOnlyLabels,options = providerTileOptions(noWrap = TRUE), group="Imagery") %>%
      htmlwidgets::onRender("function(el, x) {
        L.control.zoom({ position: 'bottomleft' }).addTo(this)
      }") %>%
      addCircleMarkers(data = estaciones, lat=estaciones$estlatitude, lng=estaciones$estlongitude, 
                       label=estaciones$estnombre, radius=ifelse(estaciones$estnombre==input$estaciones,10,5), stroke = ifelse(estaciones$estnombre==input$estaciones,TRUE,FALSE), fillOpacity = 0.5, color=ifelse(estaciones$estnombre==input$estaciones,'#43b757','#d8cd63'),
                       layerId=estaciones$estnombre, group="Estaciones") 
  })
  
  output$main_mes <- renderLeaflet({
    leaflet(options = leafletOptions(zoomControl = FALSE)) %>% setView(lng = -85.5, lat = 11.5, zoom = 6) %>%
      addProviderTiles(providers$Esri.WorldImagery,
                       options = providerTileOptions(noWrap = TRUE)
      ) %>%
      addProviderTiles(providers$CartoDB.PositronOnlyLabels,options = providerTileOptions(noWrap = TRUE), group="Imagery") %>%
      htmlwidgets::onRender("function(el, x) {
                            L.control.zoom({ position: 'bottomleft' }).addTo(this)
  }") %>%
      addCircleMarkers(data = estaciones, lat=estaciones$estlatitude, lng=estaciones$estlongitude, 
                       label=estaciones$estnombre, radius=ifelse(estaciones$estnombre==input$estaciones_mes,10,5), stroke = ifelse(estaciones$estnombre==input$estaciones_mes,TRUE,FALSE), fillOpacity = 0.5, color=ifelse(estaciones$estnombre==input$estaciones_mes,'#43b757','#d8cd63'),
                       layerId=estaciones$estnombre)
  })
  
  output$main_mes_promedio <- renderLeaflet({
    leaflet(options = leafletOptions(zoomControl = FALSE)) %>% setView(lng = -85.5, lat = 11.5, zoom = 6) %>%
      addProviderTiles(providers$Esri.WorldImagery,
                       options = providerTileOptions(noWrap = TRUE)
      ) %>%
      addProviderTiles(providers$CartoDB.PositronOnlyLabels,options = providerTileOptions(noWrap = TRUE), group="Imagery") %>%
      htmlwidgets::onRender("function(el, x) {
                            L.control.zoom({ position: 'bottomleft' }).addTo(this)
  }") %>%
      addCircleMarkers(data = estaciones, lat=estaciones$estlatitude, lng=estaciones$estlongitude, 
                       label=estaciones$estnombre, radius=ifelse(estaciones$estnombre==input$estaciones_mes_promedio,10,5), stroke = ifelse(estaciones$estnombre==input$estaciones_mes_promedio,TRUE,FALSE), fillOpacity = 0.5, color=ifelse(estaciones$estnombre==input$estaciones_mes_promedio,'#43b757','#d8cd63'),
                       layerId=estaciones$estnombre)
  })
  
  output$main_dias_lluvia <- renderLeaflet({
    leaflet(options = leafletOptions(zoomControl = FALSE)) %>% setView(lng = -85.5, lat = 11.5, zoom = 6) %>%
      addProviderTiles(providers$Esri.WorldImagery,
                       options = providerTileOptions(noWrap = TRUE)
      ) %>%
      addProviderTiles(providers$CartoDB.PositronOnlyLabels,options = providerTileOptions(noWrap = TRUE), group="Imagery") %>%
      htmlwidgets::onRender("function(el, x) {
                            L.control.zoom({ position: 'bottomleft' }).addTo(this)
  }") %>%
      addCircleMarkers(data = estaciones, lat=estaciones$estlatitude, lng=estaciones$estlongitude, 
                       label=estaciones$estnombre, radius=ifelse(estaciones$estnombre==input$estaciones_dias_lluvia,10,5), stroke = ifelse(estaciones$estnombre==input$estaciones_dias_lluvia,TRUE,FALSE), fillOpacity = 0.5, color=ifelse(estaciones$estnombre==input$estaciones_dias_lluvia,'#43b757','#d8cd63'),
                       layerId=estaciones$estnombre)
  })
  
  output$main_periodos <- renderLeaflet({
    leaflet(options = leafletOptions(zoomControl = FALSE)) %>% setView(lng = -85.5, lat = 11.5, zoom = 6) %>%
      addProviderTiles(providers$Esri.WorldImagery,
                       options = providerTileOptions(noWrap = TRUE)
      ) %>%
      addProviderTiles(providers$CartoDB.PositronOnlyLabels,options = providerTileOptions(noWrap = TRUE), group="Imagery") %>%
      htmlwidgets::onRender("function(el, x) {
                            L.control.zoom({ position: 'bottomleft' }).addTo(this)
  }") %>%
      addCircleMarkers(data = estaciones, lat=estaciones$estlatitude, lng=estaciones$estlongitude, 
                       label=estaciones$estnombre, radius=ifelse(estaciones$estnombre==input$estaciones_periodos,10,5), stroke = ifelse(estaciones$estnombre==input$estaciones_periodos,TRUE,FALSE), fillOpacity = 0.5, color=ifelse(estaciones$estnombre==input$estaciones_periodos,'#43b757','#d8cd63'),
                       layerId=estaciones$estnombre)
  })
  
  output$title <- renderText(paste('Dias con lluvia acumulada mayor a: ',input$mmlluvia,' mm',sep=''))
  
  observe({ 
    x <- input$instituciones
    updateSelectizeInput(session, "estaciones",
                      label = "Estaci\u00F3n",
                      choices = dplyr::filter(estacionesWeb,estacionesWeb$inspais==substr(input$instituciones,1,3))$estnombre,
                      selected = dplyr::filter(estacionesWeb,estacionesWeb$inspais==substr(input$instituciones,1,3))$estnombre[1]
    )
  })
  
  observe({
    x <- input$instituciones_mes
    updateSelectizeInput(session, "estaciones_mes",
                         label = "Estaci\u00F3n",
                         choices = dplyr::filter(estacionesWeb,estacionesWeb$inspais==substr(input$instituciones_mes,1,3))$estnombre,
                         selected = dplyr::filter(estacionesWeb,estacionesWeb$inspais==substr(input$instituciones_mes,1,3))$estnombre[1]
    )
  })
  
  observe({
    x <- input$instituciones_mes_promedio
    updateSelectizeInput(session, "estaciones_mes_promedio",
                         label = "Estaci\u00F3n",
                         choices = dplyr::filter(estacionesWeb,estacionesWeb$inspais==substr(input$instituciones_mes_promedio,1,3))$estnombre,
                         selected = dplyr::filter(estacionesWeb,estacionesWeb$inspais==substr(input$instituciones_mes_promedio,1,3))$estnombre[1]
    )
  })
  
  observe({
    x <- input$instituciones_dias_lluvia
    updateSelectizeInput(session, "estaciones_dias_lluvia",
                         label = "Estaci\u00F3n",
                         choices = dplyr::filter(estacionesWeb,estacionesWeb$inspais==substr(input$instituciones_dias_lluvia,1,3))$estnombre,
                         selected = dplyr::filter(estacionesWeb,estacionesWeb$inspais==substr(input$instituciones_dias_lluvia,1,3))$estnombre[1]
    )
  })
  
  observe({
    x <- input$instituciones_periodos
    updateSelectizeInput(session, "estaciones_periodos",
                         label = "Estaci\u00F3n",
                         choices = dplyr::filter(estacionesWeb,estacionesWeb$inspais==substr(input$instituciones_periodos,1,3))$estnombre,
                         selected = dplyr::filter(estacionesWeb,estacionesWeb$inspais==substr(input$instituciones_periodos,1,3))$estnombre[1]
    )
  })
  
  observe({
    x <- input$estaciones_mes
    updateSliderInput(session, "year", label="A\u00F1o", min=min(dplyr::filter(totales_mensuales_long,totales_mensuales_long$estnombre==input$estaciones_mes)$year), max=max(dplyr::filter(totales_mensuales_long,totales_mensuales_long$estnombre==input$estaciones_mes)$year))
  })
  
  observe({
    click<-input$main_marker_click
    if(is.null(click))
      return()
    updateSelectizeInput(session, "instituciones",
                         label = "Instituci\u00F3n",
                         choices = distinct(data.frame(paste(estacionesWeb$inspais, ' - ', estacionesWeb$insnombre,sep=""))),
                         selected = paste(dplyr::filter(estacionesWeb,estacionesWeb$estnombre==click$id)$inspais,' - ',dplyr::filter(estacionesWeb,estacionesWeb$estnombre==click$id)$insnombre,sep=""))
    updateSelectizeInput(session, "estaciones",
                         label = "Estaciones",
                         choices = dplyr::filter(estacionesWeb,estacionesWeb$inspais==substr(input$instituciones,1,3))$estnombre,
                         selected = click$id
    )
  })
  
  observe({
    click<-input$main_mes_marker_click
    if(is.null(click))
      return()
    updateSelectizeInput(session, "instituciones_mes",
                         label = "Instituci\u00F3n",
                         choices = distinct(data.frame(paste(estacionesWeb$inspais, ' - ', estacionesWeb$insnombre,sep=""))),
                         selected = paste(dplyr::filter(estacionesWeb,estacionesWeb$estnombre==click$id)$inspais,' - ',dplyr::filter(estacionesWeb,estacionesWeb$estnombre==click$id)$insnombre,sep=""))
    updateSelectizeInput(session, "estaciones_mes",
                         label = "Estaciones",
                         choices = dplyr::filter(estacionesWeb,estacionesWeb$inspais==substr(input$instituciones_mes,1,3))$estnombre,
                         selected = click$id
    )
    updateSliderInput(session, "year", label="A\u00F1o", min=min(dplyr::filter(totales_mensuales_long,totales_mensuales_long$estnombre==input$estaciones_mes)$year), max=max(dplyr::filter(totales_mensuales_long,totales_mensuales_long$estnombre==input$estaciones_mes)$year))
  })
  
  observe({
    click<-input$main_mes_promedio_marker_click
    if(is.null(click))
      return()
    updateSelectizeInput(session, "instituciones_mes_promedio",
                         label = "Instituci\u00F3n",
                         choices = distinct(data.frame(paste(estacionesWeb$inspais, ' - ', estacionesWeb$insnombre,sep=""))),
                         selected = paste(dplyr::filter(estacionesWeb,estacionesWeb$estnombre==click$id)$inspais,' - ',dplyr::filter(estacionesWeb,estacionesWeb$estnombre==click$id)$insnombre,sep=""))
    updateSelectizeInput(session, "estaciones_mes_promedio",
                         label = "Estaciones",
                         choices = dplyr::filter(estacionesWeb,estacionesWeb$inspais==substr(input$instituciones_mes_promedio,1,3))$estnombre,
                         selected = click$id
    )
  })
  
  observe({
    click<-input$main_periodos_marker_click
    if(is.null(click))
      return()
    updateSelectizeInput(session, "instituciones_periodos",
                         label = "Instituci\u00F3n",
                         choices = distinct(data.frame(paste(estacionesWeb$inspais, ' - ', estacionesWeb$insnombre,sep=""))),
                         selected = paste(dplyr::filter(estacionesWeb,estacionesWeb$estnombre==click$id)$inspais,' - ',dplyr::filter(estacionesWeb,estacionesWeb$estnombre==click$id)$insnombre,sep=""))
    updateSelectizeInput(session, "estaciones_periodos",
                         label = "Estaciones",
                         choices = dplyr::filter(estacionesWeb,estacionesWeb$inspais==substr(input$instituciones_periodos,1,3))$estnombre,
                         selected = click$id
    )
  })
  
  observe({
    x <- input$main_estaciones
    if(x==TRUE){
      leafletProxy("main") %>% showGroup("Estaciones")
    } else {
      leafletProxy("main") %>% hideGroup("Estaciones")
    }
  })
  
  observe({
    x <- input$main_promedios_anuales
    map <- "main"
    if(input$tabs=='graficos_anuales') map <- "main"
    if(input$tabs=='graficos_mensuales') map <- "main_mes"
    if(input$tabs=='graficos_mensuales_promedio') map <- "main_mes_promedio"
    if(input$tabs=='dias_lluvia') map <- "main_dias_lluvia"
    if(input$tabs=='periodos_referencia') map <- "main_periodos"
    if(x==TRUE) {
      message <- c('map'=map,'celda'=input$celda,'colorramp'=input$colorramp,inner_join(lluvia_anual_estacion %>% filter(date_part == input$main_year_selector),estaciones,by=c('estcodigobdcac')) %>% select('estcodigobdcac'='estcodigobdcac','latitude'='estlatitude','longitude'='estlongitude','mean'='sum'))
      session$sendCustomMessage('interpolateIDW', message)
    } else {
      message <- c('map'=map)
      session$sendCustomMessage('removeInterpolacion',message)
    }
  })
  
  observe({
    x <- input$main_promedio_septiembre
    map <- "main"
    if(input$tabs=='graficos_anuales') map <- "main"
    if(input$tabs=='graficos_mensuales') map <- "main_mes"
    if(input$tabs=='graficos_mensuales_promedio') map <- "main_mes_promedio"
    if(input$tabs=='dias_lluvia') map <- "main_dias_lluvia"
    if(input$tabs=='periodos_referencia') map <- "main_periodos"
    if(x==TRUE) {
      smes <- 9
      if(input$main_mes_select=='Septiembre') smes <- 9
      if(input$main_mes_select=='Octubre') smes <- 10
      if(input$main_mes_select=='Marzo') smes <- 3
      if(input$main_mes_select=='Abril') smes <- 4
      message <- c('map'=map,'celda'=input$celda,'colorramp'=input$colorramp,inner_join(totales_mensuales_long %>% 
                   group_by(estcodigobdcac,month) %>% 
                   summarise(mean=mean(total)) %>% 
                   filter(month==smes),estaciones,by=c('estcodigobdcac')) %>% select('estcodigobdcac'='estcodigobdcac','latitude'='estlatitude','longitude'='estlongitude','mean'='mean'))
      session$sendCustomMessage('interpolateIDW', message)
    } else {
      message <- c('map'=map)
      session$sendCustomMessage('removeInterpolacion',message)
    }
  })
  observe({
    x <- input$main_periodos_perspectiva
    print(x)
    map <- "main"
    if(input$tabs=='graficos_anuales') map <- "main"
    if(input$tabs=='graficos_mensuales') map <- "main_mes"
    if(input$tabs=='graficos_mensuales_promedio') map <- "main_mes_promedio"
    if(input$tabs=='dias_lluvia') map <- "main_dias_lluvia"
    if(input$tabs=='periodos_referencia') map <- "main_periodos"
    if(x==TRUE) {
      if(input$main_periodos_select=='MJJ') {
        message <- c('map'=map,'celda'=input$celda,'colorramp'=input$colorramp,inner_join(periodos_perspectiva %>% 
                                            group_by(estnombre) %>% 
                                            summarise(mean=mean(mjj,na.rm=TRUE)),estaciones,by=c('estnombre')) %>% select('estcodigobdcac'='estcodigobdcac','latitude'='estlatitude','longitude'='estlongitude','mean'='mean'))
      }
      if(input$main_periodos_select=='ASO') {
        message <- c('map'=map,'celda'=input$celda,'colorramp'=input$colorramp,inner_join(periodos_perspectiva %>% 
                                            group_by(estnombre) %>% 
                                            summarise(mean=mean(aso,na.rm=TRUE)),estaciones,by=c('estnombre')) %>% select('estcodigobdcac'='estcodigobdcac','latitude'='estlatitude','longitude'='estlongitude','mean'='mean'))
      }
      if(input$main_periodos_select=='DEFM') {
        message <- c('map'=map,'celda'=input$celda,'colorramp'=input$colorramp,inner_join(periodos_perspectiva %>% 
                                            group_by(estnombre) %>% 
                                            summarise(mean=mean(defm,na.rm=TRUE)),estaciones,by=c('estnombre')) %>% select('estcodigobdcac'='estcodigobdcac','latitude'='estlatitude','longitude'='estlongitude','mean'='mean'))
      }
      session$sendCustomMessage('interpolateIDW', message)
    } else {
      message <- c('map'=map)
      session$sendCustomMessage('removeInterpolacion',message)
    }
  })
  observe({
    x <- input$main_limite_terciles
    print(x)
    map <- "main"
    if(input$tabs=='graficos_anuales') map <- "main"
    if(input$tabs=='graficos_mensuales') map <- "main_mes"
    if(input$tabs=='graficos_mensuales_promedio') map <- "main_mes_promedio"
    if(input$tabs=='dias_lluvia') map <- "main_dias_lluvia"
    if(input$tabs=='periodos_referencia') map <- "main_periodos"
    tercil <- 0.33
    if(input$main_tercil_valor=="Primer tercil"){
      tercil <- 0.33
    } else {
      tercil <- 0.66
    }
    if(x==TRUE)
    {
      if(input$main_tercil_periodo=='MJJ') {
        message <- c('map'=map,'celda'=input$celda,'colorramp'=input$colorramp,inner_join(periodos_perspectiva %>% group_by(estnombre) %>% summarise(mean=quantile(mjj,tercil,na.rm=TRUE)),estaciones,by=c('estnombre')) %>% select('estcodigobdcac'='estcodigobdcac','latitude'='estlatitude','longitude'='estlongitude','mean'='mean'))
      }
      if(input$main_tercil_periodo=='ASO') {
        message <- c('map'=map,'celda'=input$celda,'colorramp'=input$colorramp,inner_join(periodos_perspectiva %>% group_by(estnombre) %>% summarise(mean=quantile(aso,tercil,na.rm=TRUE)),estaciones,by=c('estnombre')) %>% select('estcodigobdcac'='estcodigobdcac','latitude'='estlatitude','longitude'='estlongitude','mean'='mean'))
      }
      if(input$main_tercil_periodo=='DEFM') {
        message <- c('map'=map,'celda'=input$celda,'colorramp'=input$colorramp,inner_join(periodos_perspectiva %>% group_by(estnombre) %>% summarise(mean=quantile(defm,tercil,na.rm=TRUE)),estaciones,by=c('estnombre')) %>% select('estcodigobdcac'='estcodigobdcac','latitude'='estlatitude','longitude'='estlongitude','mean'='mean'))
      }
      session$sendCustomMessage('interpolateIDW', message)
    } else {
      message <- c('map'=map)
      session$sendCustomMessage('removeInterpolacion',message)
    }
  })
  observe({
    x <- input$main_promedio_dias
    mm <- input$main_mm_lluvia
    map <- "main"
    if(input$tabs=='graficos_anuales') map <- "main"
    if(input$tabs=='graficos_mensuales') map <- "main_mes"
    if(input$tabs=='graficos_mensuales_promedio') map <- "main_mes_promedio"
    if(input$tabs=='dias_lluvia') map <- "main_dias_lluvia"
    if(input$tabs=='periodos_referencia') map <- "main_periodos"
    if(x==TRUE) {
      message <- c('map'=map,'celda'=input$celda,'colorramp'=input$colorramp,inner_join(datosDiarios %>% filter(diavalor >= mm) %>% group_by(estcodigobdcac,yyyy) %>% summarise(count=n()) %>% group_by(estcodigobdcac) %>% summarise(mean=mean(count)),estaciones,by=c('estcodigobdcac')) %>% select('estcodigobdcac'='estcodigobdcac','latitude'='estlatitude','longitude'='estlongitude','mean'='mean'))
      session$sendCustomMessage('interpolateIDW', message)
    } else {
      message <- c('map'=map)
      session$sendCustomMessage('removeInterpolacion',message)
    }
  })
  observe({
    x <- input$main_periodos_30
    map <- "main"
    if(input$tabs=='graficos_anuales') map <- "main"
    if(input$tabs=='graficos_mensuales') map <- "main_mes"
    if(input$tabs=='graficos_mensuales_promedio') map <- "main_mes_promedio"
    if(input$tabs=='dias_lluvia') map <- "main_dias_lluvia"
    if(input$tabs=='periodos_referencia') map <- "main_periodos"
    if(x==TRUE) {
      if(input$main_periodo_30=='1971 - 2000'){
        message <- c('map'=map,'celda'=input$celda,'colorramp'=input$colorramp,inner_join(lluvia_anual_estacion %>% filter(date_part >= 1971 & date_part <= 2000) %>% group_by(estcodigobdcac) %>% summarise(mean=mean(sum)),estaciones,by=c('estcodigobdcac')) %>% select('estcodigobdcac'='estcodigobdcac','latitude'='estlatitude','longitude'='estlongitude','mean'='mean'))
      } else {
        message <- c('map'=map,'celda'=input$celda,'colorramp'=input$colorramp,inner_join(lluvia_anual_estacion %>% filter(date_part >= 1981 & date_part <= 2010) %>% group_by(estcodigobdcac) %>% summarise(mean=mean(sum)),estaciones,by=c('estcodigobdcac')) %>% select('estcodigobdcac'='estcodigobdcac','latitude'='estlatitude','longitude'='estlongitude','mean'='mean'))
      }
      session$sendCustomMessage('interpolateIDW', message)
    } else {
      message <- c('map'=map)
      session$sendCustomMessage('removeInterpolacion',message)
    }
    
  })
  observe(
    {
      x <- input$colorramp
      if(x=='1') {
        show(id='opcion1')
        hide(id='opcion2')
      } else {
        show(id='opcion2')
        hide(id='opcion1')
      }
    }
  )
}

shinyApp(ui = ui, server = server)

