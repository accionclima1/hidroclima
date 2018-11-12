library(RPostgreSQL)
library(dplyr)
setwd('/Users/emartinez/Desktop/Hidroclima/dashboard_bdcac/')
con <- dbConnect(PostgreSQL(), dbname = "bdcac", user = "desarrollador",
                 host = "localhost", port = "9003",
                 password = "desbdcac")

sql <- "select b.estcodigobdcac, b.estnombre, a.*, date_part('year',a.diafecha) as yyyy from bdcac.datodia a inner join bdcac.estacion b on a.diaestacion = b.estcodigobdcac
        where a.diavariable = 4 and a.diavalor >= 0 and a.diafecha > '1900-01-01 00:00'
        order by a.diafecha, a.diaestacion, a.diavariable"

datosDiarios <- dbGetQuery(con,sql)

estaciones <- unique(datosDiarios$diaestacion)
maximos_diarios <- NULL

for(i in 1:length(estaciones)) {
  datos_diarios_estacion <- datosDiarios %>% filter(diaestacion==estaciones[i])
  years = unique(datos_diarios_estacion$yyyy)
  for(j in 1:length(years))
  {
    datos_diarios_estacion_yyyy = datos_diarios_estacion %>% filter(yyyy==years[j])
    if(is.null(maximos_diarios)){
      maximos_diarios <- datos_diarios_estacion_yyyy[which.max(datos_diarios_estacion_yyyy$diavalor),]
    } else {
      maximos_diarios <- rbind(maximos_diarios,datos_diarios_estacion_yyyy[which.max(datos_diarios_estacion_yyyy$diavalor),])
    }
  }
}

saveRDS(datosDiarios,'data/datosDiarios.rds')
saveRDS(maximos_diarios,'data/maximos_diarios.rds')
