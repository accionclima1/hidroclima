library(shiny)
library(shinydashboard)
library(leaflet)
library(ggplot2)

load(url("http://s3.amazonaws.com/assets.datacamp.com/production/course_4850/datasets/movies.Rdata"))

choices <- c('San Salvador','Santa Ana','San Miguel')

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
      menuItem("Mapas Anuales", tabName = "mapas_anuales", icon = icon("map")),
      menuItem("Mapas Mensuales", tabName = "mapas_mensuales", icon = icon("map"))
    )
  ),
  dashboardBody(
    tags$head(
      tags$link(rel = "stylesheet", type = "text/css", href = "app.css")
    ),
    fluidRow(
      column(width = 12,
             box(width = NULL, solidHeader = TRUE,
                 fluidRow(
                   column(width=10,
                   selectizeInput("busqueda", "", choices, selected = NULL, multiple = TRUE,
                                  options = list(maxOptions = 5))),
                   column(width=2,tags$div(class="btnbuscar",actionButton("buscar", label = "Buscar")))
                 )
             ),
             box(width = NULL, solidHeader = TRUE,
                 fluidRow(
                   column(width=9, 
                    leafletOutput("main", height = 500)
                   ),
                   column(width=3,
                    plotOutput("chart")
                   )
                 )
             ),
             box(width = NULL,
                 sliderInput("slider1", label = 'Mes', min = 0, 
                             max = 100, value = 50)
             )
      )
    )
  )
)

server <- function(input, output) {
  output$chart <- renderPlot({
    ggplot(data = movies, aes_string(x = 'critics_score', y = 'audience_score',
                                     color = 'mpaa_rating')) + geom_point()
  })
  output$main <- renderLeaflet({
    leaflet(options = leafletOptions(zoomControl = FALSE)) %>% setView(lng = -85.5, lat = 14, zoom = 5) %>%
      addProviderTiles(providers$Esri.WorldImagery,
                       options = providerTileOptions(noWrap = TRUE)
      ) %>%
      htmlwidgets::onRender("function(el, x) {
        L.control.zoom({ position: 'bottomleft' }).addTo(this)
      }")
  })
}

shinyApp(ui = ui, server = server)