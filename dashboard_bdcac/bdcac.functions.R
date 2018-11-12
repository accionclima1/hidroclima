getMes <- function(mesid) {
  meses <- c('Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Nomviembre','Diciembre')
  meses[mesid]
}

getColorEstacion <- function(selector,estacionid) {
  print(paste(selector,estacionid))
  if(selector==estacionid) { 
    color <- "#f47142"
  } else {
    color <- "#d8cd63"
  }
}
