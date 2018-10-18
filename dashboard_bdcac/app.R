library(shiny)
library(shinydashboard)
library(leaflet)
library(ggplot2)
library(dplyr)

setwd('/Users/emartinez/Desktop/Hidroclima/dashboard_bdcac')

estaciones <- readRDS('data/estaciones.rds')
variables_estaciones <- readRDS('data/variables_estaciones.rds')
lluvia_anual_estacion <- readRDS('data/lluvia_anual_estacion.rds')
totales_mensuales <- readRDS('data/totales_mensuales.rds')
totales_mensuales_long <- readRDS('data/totales_mensuales_long.rds')

choices <- estaciones

ui <- dashboardPage(
  header <- dashboardHeader(
    tags$li(class = "dropdown",
            tags$style(".main-header {max-height: 75px}"),
            tags$style(".main-header .logo {height: 75px}"),
            tags$style(".main-header .navbar {padding-top: 10px}")
    ),
    titleWidth = '250px',
    title = tags$a(href='/', tags$img(class="logocrrh",src='http://blog.centroclima.org/wp-content/uploads/2018/08/cropped-logos-blog-1.png'))
  ),
  dashboardSidebar(
    tags$style(".left-side, .main-sidebar {padding-top: 75px}"),
    width = '250px',
    tags$div(
      class="titulo_sidebar",
      titlePanel("BDCAC")
    ),
    tags$hr(),
    sidebarMenu(
      menuItem("Gr\u00E1ficos Precipitaci\u00F3n Anual", tabName = "graficos_anuales", icon = icon("map")),
      menuItem("Gr\u00E1ficos Precipitaci\u00F3n Mensual", tabName = "graficos_mensuales", icon = icon("map"))
    )
  ),
  dashboardBody(
    tags$head(
      tags$link(rel = "stylesheet", type = "text/css", href = "app.css")
    ),
    tabItems(
      tabItem(tabName='graficos_anuales',
          fluidRow(
            column(width = 12,
                   box(width = NULL, solidHeader = TRUE,
                       fluidRow(
                         column(width=4,
                         selectInput("instituciones", "Instituci\u00F3n", distinct(data.frame(paste(estaciones$inspais, ' - ', estaciones$insnombre,sep=""))), selected = 1, multiple = FALSE, selectize = FALSE)),
                         column(width=6,
                         selectInput("estaciones", 'Estaci\u00F3n', choices = NULL))
                         
                       )
                   ),
                   box(width = NULL, solidHeader = TRUE,
                       fluidRow(
                         column(width=12, 
                          leafletOutput("main", height = 500)
                         )
                       )
                   ),
                   box(width = NULL,
                       column(width=12,
                              plotOutput("chart")
                       )
                   ),
                   box(width = NULL,
                       column(width=12,dataTableOutput("datosAnuales"))
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
                       box(width = NULL, solidHeader = TRUE,
                           fluidRow(
                             column(width=12, 
                                    leafletOutput("main_mes", height = 500)
                             )
                           )
                       ),
                       box(width=NULL,
                          column(width=12,
                            sliderInput("year","A\u00F1o",min=min(totales_mensuales$date_part[totales_mensuales$date_part>1900]),max=max(totales_mensuales$date_part[totales_mensuales$date_part>1900]),step=1,value=min(totales_mensuales$date_part[totales_mensuales$date_part>1900]))
                          )    
                       ),
                       box(width = NULL,
                           column(width=12,
                                  plotOutput("chart_mes")
                           )
                       ),
                       box(width = NULL,
                           column(width=12,dataTableOutput("datosMensuales"))
                       )
                )
              )
              )
    )
  )
)

server <- function(input, output, session) {
  output$chart <- renderPlot({
    ggplot(data = dplyr::filter(lluvia_anual_estacion,lluvia_anual_estacion$estnombre==input$estaciones), 
          aes_string(x = 'date_part', y = 'sum', color='count')) + geom_col(fill='#5688d8',alpha=0.7,size=1.5) +
      labs(title="Precipitaci\u00F3n total anual", x="A\u00F1o", y="Total", color="No. d\u00EDas de registro") + 
      scale_x_continuous(breaks=dplyr::filter(lluvia_anual_estacion,lluvia_anual_estacion$estnombre==input$estaciones)$date_part) +
      scale_colour_gradient(low = "#ef8d1c", high = "#2e39d3")
  })
  output$chart_mes <- renderPlot({
    ggplot(data = dplyr::filter(totales_mensuales_long,totales_mensuales_long$estnombre==input$estaciones_mes & totales_mensuales_long$year==input$year),  
           aes_string(x = 'month', y = 'total')) + geom_col(fill='#5688d8',alpha=0.7,size=1.5) +
      labs(title="Precipitaci\u00F3n mensual", x="Mes", y="Total") + 
      scale_x_continuous(breaks=c(1,2,3,4,5,6,7,8,9,10,11,12),labels=c('Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'))
  })
  output$datosAnuales <- renderDataTable(dplyr::filter(lluvia_anual_estacion,lluvia_anual_estacion$estnombre==input$estaciones) %>% select('A\u00F1o'='date_part','Total'='sum'),options = list(pageLength=10))
  output$datosMensuales <- renderDataTable(dplyr::filter(totales_mensuales_long,totales_mensuales_long$estnombre==input$estaciones_mes & totales_mensuales_long$year==input$year) %>% select('A\u00F1o'='year','Mes'='month','Total'='total','Dias registrados'='dias'),options = list(pageLength=12))
  output$main <- renderLeaflet({
    leaflet(options = leafletOptions(zoomControl = FALSE)) %>% setView(lng = -85.5, lat = 14, zoom = 5) %>%
      addProviderTiles(providers$Esri.WorldImagery,
                       options = providerTileOptions(noWrap = TRUE)
      ) %>%
      htmlwidgets::onRender("function(el, x) {
        L.control.zoom({ position: 'bottomleft' }).addTo(this)
      }") %>%
      addCircleMarkers(data = estaciones, lat=estaciones$estlatitude, lng=estaciones$estlongitude, 
                       label=estaciones$estnombre, radius=5, stroke = TRUE, fillOpacity = 0.5, color='#d8cd63',
                       layerId=estaciones$estnombre)
  })
  output$main_mes <- renderLeaflet({
    leaflet(options = leafletOptions(zoomControl = FALSE)) %>% setView(lng = -85.5, lat = 14, zoom = 5) %>%
      addProviderTiles(providers$Esri.WorldImagery,
                       options = providerTileOptions(noWrap = TRUE)
      ) %>%
      htmlwidgets::onRender("function(el, x) {
                            L.control.zoom({ position: 'bottomleft' }).addTo(this)
  }") %>%
      addCircleMarkers(data = estaciones, lat=estaciones$estlatitude, lng=estaciones$estlongitude, 
                       label=estaciones$estnombre, radius=5, stroke = TRUE, fillOpacity = 0.5, color='#d8cd63',
                       layerId=estaciones$estnombre)
  })
  observe({
    x <- input$instituciones
    updateSelectizeInput(session, "estaciones",
                      label = "Estaci\u00F3n",
                      choices = dplyr::filter(estaciones,estaciones$inspais==substr(input$instituciones,1,3))$estnombre,
                      selected = dplyr::filter(estaciones,estaciones$inspais==substr(input$instituciones,1,3))$estnombre[1]
    )
  })
  observe({
    x <- input$instituciones_mes
    updateSelectizeInput(session, "estaciones_mes",
                         label = "Estaci\u00F3n",
                         choices = dplyr::filter(estaciones,estaciones$inspais==substr(input$instituciones_mes,1,3))$estnombre,
                         selected = dplyr::filter(estaciones,estaciones$inspais==substr(input$instituciones_mes,1,3))$estnombre[1]
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
                         choices = distinct(data.frame(paste(estaciones$inspais, ' - ', estaciones$insnombre,sep=""))),
                         selected = paste(dplyr::filter(estaciones,estaciones$estnombre==click$id)$inspais,' - ',dplyr::filter(estaciones,estaciones$estnombre==click$id)$insnombre,sep=""))
    updateSelectizeInput(session, "estaciones",
                         label = "Estaciones",
                         choices = dplyr::filter(estaciones,estaciones$inspais==substr(input$instituciones,1,3))$estnombre,
                         selected = click$id
    )
  })
  observe({
    click<-input$main_mes_marker_click
    if(is.null(click))
      return()
    updateSelectizeInput(session, "instituciones_mes",
                         label = "Instituci\u00F3n",
                         choices = distinct(data.frame(paste(estaciones$inspais, ' - ', estaciones$insnombre,sep=""))),
                         selected = paste(dplyr::filter(estaciones,estaciones$estnombre==click$id)$inspais,' - ',dplyr::filter(estaciones,estaciones$estnombre==click$id)$insnombre,sep=""))
    updateSelectizeInput(session, "estaciones_mes",
                         label = "Estaciones",
                         choices = dplyr::filter(estaciones,estaciones$inspais==substr(input$instituciones_mes,1,3))$estnombre,
                         selected = click$id
    )
    updateSliderInput(session, "year", label="A\u00F1o", min=min(dplyr::filter(totales_mensuales_long,totales_mensuales_long$estnombre==input$estaciones_mes)$year), max=max(dplyr::filter(totales_mensuales_long,totales_mensuales_long$estnombre==input$estaciones_mes)$year))
  })
}

shinyApp(ui = ui, server = server)