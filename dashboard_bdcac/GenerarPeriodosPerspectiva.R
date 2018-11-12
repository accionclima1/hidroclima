library(dplyr)
setwd('/Users/emartinez/Desktop/Hidroclima/dashboard_bdcac')
estaciones <- unique(totales_mensuales$estnombre)
totales_mensuales <- readRDS('data/totales_mensuales.rds')
periodos_perspectiva <- data.frame(estnombre = character(nrow(totales_mensuales)+1), yyyy=character(nrow(totales_mensuales)+1), mjj = numeric(nrow(totales_mensuales)+1), 
                 aso = numeric(nrow(totales_mensuales)+1), defm = numeric(nrow(totales_mensuales)+1), stringsAsFactors = FALSE)
k <- 1
for(i in 1:length(estaciones)) {
  totales_mensuales_estacion <- totales_mensuales %>% filter(estnombre==estaciones[i])
  
  if(nrow(totales_mensuales_estacion)>0){
    for(j in 1:nrow(totales_mensuales_estacion))
    {
      estnombre <- totales_mensuales_estacion$estnombre[j]
      
      if(totales_mensuales_estacion$days_may[j] >= 20 & 
         totales_mensuales_estacion$days_jun[j] >= 20 & 
         totales_mensuales_estacion$days_jul[j] >= 20)
      {
        mjj <- totales_mensuales_estacion$may[j] + totales_mensuales_estacion$jun[j] + totales_mensuales_estacion$jul[j]
      } else {
        mjj <- NA
      }
      
      if(totales_mensuales_estacion$days_ago[j] >= 20 & 
         totales_mensuales_estacion$days_sep[j] >= 20 & 
         totales_mensuales_estacion$days_oct[j] >= 20)
      {
        aso <- totales_mensuales_estacion$ago[j] + totales_mensuales_estacion$sep[j] + totales_mensuales_estacion$oct[j]
      } else {
        aso <- NA
      }
      
      defm <- NULL
      yyyy <- totales_mensuales_estacion$date_part[j]
      
      if(!is.na(totales_mensuales_estacion$date_part[j+1]))
      {
        yyyy2 <- totales_mensuales_estacion$date_part[j+1]
        if(yyyy2-yyyy==1) {
          if(totales_mensuales_estacion$days_dic[j] >= 20 & 
             totales_mensuales_estacion$days_ene[j + 1] >= 17 & 
             totales_mensuales_estacion$days_feb[j + 1] >= 20 &
             totales_mensuales_estacion$days_mar[j + 1] >= 20)
          {
          defm <- totales_mensuales_estacion$dic[j] + totales_mensuales_estacion$ene[j+1] + 
           totales_mensuales_estacion$feb[j+1] + totales_mensuales_estacion$mar[j+1] 
          } else {
            defm <- NA
          }
        }
      }
      periodos_perspectiva$estnombre[k] <- estnombre
      periodos_perspectiva$yyyy[k] <- yyyy
      periodos_perspectiva$mjj[k] <- mjj
      periodos_perspectiva$aso[k] <- aso
      if(!is.null(defm))
        periodos_perspectiva$defm[k] <- defm
      else
        periodos_perspectiva$defm[k] <- NA
      k <- k + 1
    }
  }
}
saveRDS(periodos_perspectiva,'data/periodos_perspectiva.rds')
