# Automatizacion de la descarga, procesamiento y publicación productos clima 3
# Elaborado por Ing. Mg. David Eliseo Martinez Castellanos
# 02-07-2018

library('httr')
library('XML')
library('raster')
library(RPostgreSQL)
library(rgdal)
library(lubridate)

urlgeoserver <- "http://localhost:9002/geoserver/rest"
processDir <- paste(getwd(),"/Desktop/clima3/procesamiento/",sep="")
desviacionesDir <- paste(getwd(),"/Desktop/clima3/productos/DESVIACIONES_CHIRPS_PROMEDIO/",sep="")
procesar <- c('m1_mes1','m1_mes2','m1_mes3','m2_mes1','m3_mes1','m4_mes1')
urlsalidas <- "http://centroclima.org/samre3/salidas/"
workspace <- "c3pronostico"

# get workspaces
responseGetWorkspace <- GET(url=paste(urlgeoserver,'/workspaces',sep=""),authenticate('admin','gis$developer'),content_type_json())

r <- content(responseGetWorkspace,"text")

if(!grepl(r,workspace,fixed=TRUE))
{
  # create workspace

  Body <- "<?xml version=\"1.0\" encoding=\"UTF-8\"?><workspace>"
  Body <- paste(Body,"<name>",workspace,"</name>","</workspace>",sep="")

  responsePostWorkspace <- POST(url=paste(urlgeoserver,'/workspaces',sep=""),accept('text/html'),body=Body,authenticate('admin','gis$developer'),content_type_xml())
}

for(i in 1:length(procesar))
{
  # i <- 1
  download.file(url = paste(urlsalidas,procesar[i],"/acum_general.tif",sep=""), destfile = paste(processDir,procesar[i],"_","acumulado_general.tif",sep=""))
  current_month <- month(Sys.Date()) - 1
  avgdev_month <- current_month + 1 
  
  if(i==2)
  {
    avgdev_month <- current_month + 2
  }
  
  if(i==3)
  {
    avgdev_month <- current_month + 3
  } 
  
  process_month <- paste("0",as.character(avgdev_month),sep="")
  process_month <- substr(process_month, nchar(process_month)-1, nchar(process_month))
  
  lluvia_acumulada <- raster(paste(processDir,procesar[i],"_","acumulado_general.tif",sep=""))
  crs(lluvia_acumulada) <- "+proj=longlat +datum=WGS84 +pm=360dw"
  
  lluvia_acumulada <- projectRaster(lluvia_acumulada, crs="+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs")
  
  raster_desviacion_promedio <- raster(paste(desviacionesDir,process_month,".tif",sep=""))
  crs(raster_desviacion_promedio) <- "+proj=longlat +datum=WGS84 +pm=360dw"
  raster_desviacion_promedio <- projectRaster(raster_desviacion_promedio, crs="+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs")
  
  lluvia_acumulada <- resample(lluvia_acumulada,raster_desviacion_promedio,method='bilinear')
  lluvia_acumulada <- mask(lluvia_acumulada,raster_desviacion_promedio)
  
  lluvia_acumulada_ajustado <- lluvia_acumulada
  lluvia_acumulada_ajustado[raster_desviacion_promedio>0] = lluvia_acumulada[raster_desviacion_promedio>0] - raster_desviacion_promedio[raster_desviacion_promedio>0]
  lluvia_acumulada_ajustado[!raster_desviacion_promedio>0] = lluvia_acumulada[!raster_desviacion_promedio>0] + raster_desviacion_promedio[!raster_desviacion_promedio>0]
  lluvia_acumulada_ajustado[lluvia_acumulada_ajustado<0]=lluvia_acumulada[lluvia_acumulada_ajustado<0]
  writeRaster(lluvia_acumulada_ajustado,paste(processDir,procesar[i],'_',avgdev_month,'_acu_gen_ajus.tif',sep=""),'GTiff')
  
  name <- paste(procesar[i],"_",avgdev_month,sep="")
  storeurl <- paste(processDir,procesar[i],'-',avgdev_month,'_acu_gen_ajus.tif',sep="") 
  
  responseDeleteCoverageStore <- DELETE(url=paste(urlgeoserver,'/workspaces/',workspace,'/coveragestores/',name,'?recurse=true',sep=""),authenticate('admin','gis$developer'),content_type_xml())
    
  Body <- "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
  Body <- paste(Body,"<coverageStore>",sep="")
  Body <- paste(Body,"<name>",name,"</name>",sep="")
  Body <- paste(Body,"<type>GeoTIFF</type>",sep="")
  Body <- paste(Body,"<workspace>",workspace,"</workspace>",sep="")
  Body <- paste(Body,"<url>",storeurl,"</url>",sep="")
  Body <- paste(Body,"<enabled>true</enabled>",sep="")
  Body <- paste(Body,"</coverageStore>",sep="")
  
  responseCoverageStore <- POST(url=paste(urlgeoserver,'/workspaces/',workspace,"/coveragestores",sep=""),accept('text/html'),body=Body,authenticate('admin','gis$developer'),content_type_xml())
  
  Body <- "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
  Body <- paste(Body,"<coverage>",sep="")
  Body <- paste(Body,"<name>",name,"</name>",sep="")
  Body <- paste(Body,"<title>",name,"</title>",sep="")
  Body <- paste(Body,"<nativeCRS>",sep="")
  Body <- paste(Body,"GEOGCS[\"WGS 84\", DATUM[\"World Geodetic System 1984\", SPHEROID[\"WGS 84\", 6378137.0, 298.257223563, AUTHORITY[\"EPSG\",\"7030\"]], AUTHORITY[\"EPSG\",\"6326\"]],",sep="")
  Body <- paste(Body,"PRIMEM[\"Greenwich\", 0.0, AUTHORITY[\"EPSG\",\"8901\"]], UNIT[\"degree\", 0.017453292519943295], AXIS[\"Geodetic longitude\", EAST], AXIS[\"Geodetic latitude\", NORTH], AUTHORITY[\"EPSG\",\"4326\"]]",sep="")
  Body <- paste(Body,"</nativeCRS>",sep="")
  Body <- paste(Body,"<srs>EPSG:4326</srs>",sep="")
  Body <- paste(Body,"<latLonBoundingBox>",sep="")
  Body <- paste(Body,"<minx>",xmin(lluvia_acumulada_ajustado),"</minx>",sep="")
  Body <- paste(Body,"<maxx>",xmax(lluvia_acumulada_ajustado),"</maxx>",sep="")
  Body <- paste(Body,"<miny>",ymin(lluvia_acumulada_ajustado),"</miny>",sep="")
  Body <- paste(Body,"<maxy>",ymax(lluvia_acumulada_ajustado),"</maxy>",sep="")
  Body <- paste(Body,"<crs>EPSG:4326</crs>",sep="")
  Body <- paste(Body,"</latLonBoundingBox>",sep="")
  Body <- paste(Body,"<enabled>true</enabled>",sep="")
  Body <- paste(Body,"<interpolationMethods>",sep="")
  Body <- paste(Body,"<string>nearest neighbor</string>",sep="")
  Body <- paste(Body,"<string>bilinear</string>",sep="")
  Body <- paste(Body,"<string>bicubic</string>",sep="")
  Body <- paste(Body,"</interpolationMethods>",sep="")
  Body <- paste(Body,"<defaultInterpolationMethod>bilinear</defaultInterpolationMethod>",sep="")
  Body <- paste(Body,"</coverage>",sep="")
  
  responseCoverage <- POST(url=paste(urlgeoserver,'/workspaces/',workspace,"/coveragestores/",name,"/coverages",sep=""),accept('text/html'),body=Body,authenticate('admin','gis$developer'),content_type_xml())
  
  Body <- "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
  Body <- paste(Body,"<layer>",sep="")
  Body <- paste(Body,"<defaultStyle>",sep="")
  Body <- paste(Body,"<name>lluviaClima3</name>",sep="")
  Body <- paste(Body,"</defaultStyle>",sep="")
  Body <- paste(Body,"<styles>",sep="")
  Body <- paste(Body,"<style>",sep="")
  Body <- paste(Body,"<name>lluviaClima3</name>",sep="")
  Body <- paste(Body,"</style>",sep="")
  Body <- paste(Body,"</styles>",sep="")
  Body <- paste(Body,"</layer>",sep="")
  
  responseLayer <- PUT(url=paste(urlgeoserver,'/layers/',name,sep=""),accept('text/html'),body=Body,authenticate('admin','gis$developer'),content_type_xml())
}
