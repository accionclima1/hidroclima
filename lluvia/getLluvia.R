# Procesamiento de rasters geotiff provenientes del modelo WRF
# Propósito: Extracción de valores de lluvia para puntos específicos
# Elaborado por Ing. David Eliseo Martinez Castellanos el 11 de Junio 2018
library(raster)
library(rgdal)
setwd('/Users/emartinez/Desktop/lluvia/')
tmp = tempfile(fileext=".tif")
download.file(url = "http://srt.marn.gob.sv/salidaswrf/wrf_regional_norteca_5km/12/geotiff/lluvia_24h.tif",destfile = "lluvia.tif")

lluvia <- raster('lluvia.tif')

crs(lluvia) <- "+proj=longlat +datum=WGS84 +pm=360dw"

lluvia_projected <- projectRaster(lluvia,crs="+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs")

clipping_rectangle <- readOGR("clipping_rectangle.shp")

lluvia_clipped <- crop(lluvia_projected,extent(clipping_rectangle))

cuenca <- readOGR("grande_sonsonatewgs84.shp")

lluvia_resampled <- disaggregate(lluvia_clipped,fact=4,method='bilinear')

estaciones_pronostico <- readOGR('estaciones_pronostico.shp')

lluvia_estaciones <- extract(lluvia_resampled,coordinates(estaciones_pronostico)[,1:2],method='bilinear')

