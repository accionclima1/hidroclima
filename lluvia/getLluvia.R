# Procesamiento de rasters geotiff provenientes del modelo WRF
# Proposito: Extraccion de valores de lluvia para puntos especificos
# Elaborado por Ing. David Eliseo Martinez Castellanos el 11 de Junio 2018
library(raster)
library(rgdal)
setwd('/Users/emartinez/Desktop/Hidroclima/lluvia/')
tmp = tempfile(fileext=".tif")
download.file(url = "http://srt.marn.gob.sv/salidaswrf/wrf_regional_norteca_5km/12/geotiff/lluvia_24h.tif",destfile = "lluvia.tif")

lluvia <- raster('lluvia.tif')

crs(lluvia) <- "+proj=longlat +datum=WGS84 +pm=360dw"

lluvia_projected <- projectRaster(lluvia,crs="+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs")

clipping_rectangle <- readOGR("clipping_rectangle.shp")

lluvia_clipped <- crop(lluvia_projected,extent(clipping_rectangle))

cuenca <- readOGR("grande_sonsonatewgs84.shp")

lluvia_resampled <- disaggregate(lluvia_clipped,fact=6,method='bilinear')

estaciones_pronostico <- readOGR('estaciones_pronostico.shp')

lluvia_estaciones <- extract(lluvia_resampled,coordinates(estaciones_pronostico)[,1:2],method='bilinear')

fileConn<-file("/Users/emartinez/Desktop/Hidroclima/lluvia/lluvia24h.txt")
lines <- c(paste("1, Apaneca, 13.859167, -89.804444,",lluvia_estaciones[1],sep=""))
lines <- c(lines,paste("2, Buena Vista, 13.893333, -89.769722,",lluvia_estaciones[2],sep=""))
lines <- c(lines,paste("3, Cordillera, 13.897222, -89.707778,",lluvia_estaciones[3],sep=""))
lines <- c(lines,paste("4, Los Naranjos, 13.876111, -89.673889,",lluvia_estaciones[4],sep=""))
lines <- c(lines,paste("5, Juayua, 13.842778, -89.746944,",lluvia_estaciones[5],sep=""))
lines <- c(lines,paste("6, La Majada, 13.848611, -89.7025,",lluvia_estaciones[6],sep=""))
lines <- c(lines,paste("7, Salcoatitan, 13.829722, -89.759444,",lluvia_estaciones[7],sep=""))
lines <- c(lines,paste("8, Chaparron, 13.811111, -89.684167,",lluvia_estaciones[8],sep=""))
lines <- c(lines,paste("9, Nahuizalco, Norte, 13.796667, -89.7275,",lluvia_estaciones[9],sep=""))
lines <- c(lines,paste("10, Sonzacate, Noroeste, 13.794722, -89.690556,",lluvia_estaciones[10],sep=""))
lines <- c(lines,paste("11, Cucumacayan, 13.764167, -89.723889,",lluvia_estaciones[11],sep=""))
lines <- c(lines,paste("12, Sonzacate, Suroeste, 13.744167, -89.690556,",lluvia_estaciones[12],sep=""))
lines <- c(lines,paste("13, Sonsonate, 13.7175, -89.725,",lluvia_estaciones[13],sep=""))
writeLines(lines, fileConn)
close(fileConn)

download.file(url = "http://srt.marn.gob.sv/salidaswrf/wrf_regional_norteca_5km/12/geotiff/lluvia_48h.tif",destfile = "lluvia.tif")

lluvia <- raster('lluvia.tif')

crs(lluvia) <- "+proj=longlat +datum=WGS84 +pm=360dw"

lluvia_projected <- projectRaster(lluvia,crs="+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs")

clipping_rectangle <- readOGR("clipping_rectangle.shp")

lluvia_clipped <- crop(lluvia_projected,extent(clipping_rectangle))

cuenca <- readOGR("grande_sonsonatewgs84.shp")

lluvia_resampled <- disaggregate(lluvia_clipped,fact=6,method='bilinear')

estaciones_pronostico <- readOGR('estaciones_pronostico.shp')

lluvia_estaciones <- extract(lluvia_resampled,coordinates(estaciones_pronostico)[,1:2],method='bilinear')

fileConn<-file("/Users/emartinez/Desktop/Hidroclima/lluvia/lluvia84h.txt")
lines <- c(paste("1, Apaneca, 13.859167, -89.804444,",lluvia_estaciones[1],sep=""))
lines <- c(lines,paste("2, Buena Vista, 13.893333, -89.769722,",lluvia_estaciones[2],sep=""))
lines <- c(lines,paste("3, Cordillera, 13.897222, -89.707778,",lluvia_estaciones[3],sep=""))
lines <- c(lines,paste("4, Los Naranjos, 13.876111, -89.673889,",lluvia_estaciones[4],sep=""))
lines <- c(lines,paste("5, Juayua, 13.842778, -89.746944,",lluvia_estaciones[5],sep=""))
lines <- c(lines,paste("6, La Majada, 13.848611, -89.7025,",lluvia_estaciones[6],sep=""))
lines <- c(lines,paste("7, Salcoatitan, 13.829722, -89.759444,",lluvia_estaciones[7],sep=""))
lines <- c(lines,paste("8, Chaparron, 13.811111, -89.684167,",lluvia_estaciones[8],sep=""))
lines <- c(lines,paste("9, Nahuizalco, Norte, 13.796667, -89.7275,",lluvia_estaciones[9],sep=""))
lines <- c(lines,paste("10, Sonzacate, Noroeste, 13.794722, -89.690556,",lluvia_estaciones[10],sep=""))
lines <- c(lines,paste("11, Cucumacayan, 13.764167, -89.723889,",lluvia_estaciones[11],sep=""))
lines <- c(lines,paste("12, Sonzacate, Suroeste, 13.744167, -89.690556,",lluvia_estaciones[12],sep=""))
lines <- c(lines,paste("13, Sonsonate, 13.7175, -89.725,",lluvia_estaciones[13],sep=""))
writeLines(lines, fileConn)
close(fileConn)

download.file(url = "http://srt.marn.gob.sv/salidaswrf/wrf_regional_norteca_5km/12/geotiff/lluvia_72h.tif",destfile = "lluvia.tif")

lluvia <- raster('lluvia.tif')

crs(lluvia) <- "+proj=longlat +datum=WGS84 +pm=360dw"

lluvia_projected <- projectRaster(lluvia,crs="+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs")

clipping_rectangle <- readOGR("clipping_rectangle.shp")

lluvia_clipped <- crop(lluvia_projected,extent(clipping_rectangle))

cuenca <- readOGR("grande_sonsonatewgs84.shp")

lluvia_resampled <- disaggregate(lluvia_clipped,fact=6,method='bilinear')

estaciones_pronostico <- readOGR('estaciones_pronostico.shp')

lluvia_estaciones <- extract(lluvia_resampled,coordinates(estaciones_pronostico)[,1:2],method='bilinear')

fileConn<-file("/Users/emartinez/Desktop/Hidroclima/lluvia/lluvia72h.txt")
lines <- c(paste("1, Apaneca, 13.859167, -89.804444,",lluvia_estaciones[1],sep=""))
lines <- c(lines,paste("2, Buena Vista, 13.893333, -89.769722,",lluvia_estaciones[2],sep=""))
lines <- c(lines,paste("3, Cordillera, 13.897222, -89.707778,",lluvia_estaciones[3],sep=""))
lines <- c(lines,paste("4, Los Naranjos, 13.876111, -89.673889,",lluvia_estaciones[4],sep=""))
lines <- c(lines,paste("5, Juayua, 13.842778, -89.746944,",lluvia_estaciones[5],sep=""))
lines <- c(lines,paste("6, La Majada, 13.848611, -89.7025,",lluvia_estaciones[6],sep=""))
lines <- c(lines,paste("7, Salcoatitan, 13.829722, -89.759444,",lluvia_estaciones[7],sep=""))
lines <- c(lines,paste("8, Chaparron, 13.811111, -89.684167,",lluvia_estaciones[8],sep=""))
lines <- c(lines,paste("9, Nahuizalco, Norte, 13.796667, -89.7275,",lluvia_estaciones[9],sep=""))
lines <- c(lines,paste("10, Sonzacate, Noroeste, 13.794722, -89.690556,",lluvia_estaciones[10],sep=""))
lines <- c(lines,paste("11, Cucumacayan, 13.764167, -89.723889,",lluvia_estaciones[11],sep=""))
lines <- c(lines,paste("12, Sonzacate, Suroeste, 13.744167, -89.690556,",lluvia_estaciones[12],sep=""))
lines <- c(lines,paste("13, Sonsonate, 13.7175, -89.725,",lluvia_estaciones[13],sep=""))
writeLines(lines, fileConn)
close(fileConn)           
