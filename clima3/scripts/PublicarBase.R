# Automatizacion de la publicacion de raster linea base Clima3 utilizando API REST de GeoServer
# Elaborado por Ing. Mg. David Eliseo Martinez Castellanos
# 30-06-2017

# Creacion del espacio de trabajo Clima3Base
library('httr')
library('XML')
library('raster')
library(RPostgreSQL)
drv <- dbDriver("PostgreSQL")
con <- dbConnect(drv, host="localhost", port="9001", dbname="clima3db", user="emartinez", password="gis$developer")

urlgeoserver <- "http://localhost:9002/geoserver/rest"
dir_productos <- paste(getwd(),'/Desktop/clima3/productos',sep="")
dir_productos_server <- "file:///home/geoserver/clima3/productos/"
workspace <- "clima3base"

# delete workspace
responseDeleteWorkspace <- DELETE(url=paste(urlgeoserver,'/workspaces/',workspace,'?recurse=true',sep=""),authenticate('admin','gis$developer'),content_type_xml())

# create workspace

Body <- "<?xml version=\"1.0\" encoding=\"UTF-8\"?><workspace>"
Body <- paste(Body,"<name>",workspace,"</name>","</workspace>",sep="")

responsePostWorkspace <- POST(url=paste(urlgeoserver,'/workspaces',sep=""),accept('text/html'),body=Body,authenticate('admin','gis$developer'),content_type_xml())

# delete style if registered

responseDeleteStyle <- DELETE(url=paste(urlgeoserver,'/styles/lluviaClima3','?recurse=true',sep=""),authenticate('admin','gis$developer'),content_type_xml())

# create style lluviaClima3
Body <- "<style>"
Body <- paste(Body,"<name>lluviaClima3</name>",sep="")
Body <- paste(Body,"<filename>lluviaClima3.sld</filename>",sep="")
Body <- paste(Body,"</style>",sep="")

responseStyle <- POST(url=paste(urlgeoserver,'/styles',sep=""),accept('application/xml'),body=Body,authenticate('admin','gis$developer'),content_type_xml())

sld <- upload_file(paste(getwd(),'/Desktop/clima3/lluviaClima3.sld',sep=""),type="application/vnd.ogc.sld+xml")
responseStyle <- PUT(url=paste(urlgeoserver,'/styles/lluviaClima3',sep=""),accept('application/vnd.ogc.sld+xml'),body=sld,authenticate('admin','gis$developer'),content_type('application/vnd.ogc.sld+xml'))

# create CoverageStores, Coverages y Layers

files <- list.files(path=dir_productos,recursive=TRUE,include.dirs=TRUE)

for(i in 1:length(files))
{
  ext = substr(files[i],nchar(files[i])-2,nchar(files[i]))
  if(ext=="tif"){
    parts <- strsplit(files[i],"/")[[1]]
    parts2 <- strsplit(parts[2],"[.]")[[1]]
    folder <- parts[1]
    name <- paste(folder,"_",parts2[1],sep="")
    description <- ""
    storeurl <- paste(dir_productos_server,files[i],sep="")
    
    Body <- "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
    Body <- paste(Body,"<coverageStore>",sep="")
    Body <- paste(Body,"<name>",name,"</name>",sep="")
    Body <- paste(Body,"<type>GeoTIFF</type>",sep="")
    Body <- paste(Body,"<workspace>",workspace,"</workspace>",sep="")
    Body <- paste(Body,"<url>",storeurl,"</url>",sep="")
    Body <- paste(Body,"<enabled>true</enabled>",sep="")
    Body <- paste(Body,"</coverageStore>",sep="")
    
    responseCoverageStore <- POST(url=paste(urlgeoserver,'/workspaces/',workspace,"/coveragestores",sep=""),accept('text/html'),body=Body,authenticate('admin','gis$developer'),content_type_xml())
    
    esteRaster <- raster(paste(dir_productos,"/",files[i],sep=""))
    
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
    Body <- paste(Body,"<minx>",xmin(esteRaster),"</minx>",sep="")
    Body <- paste(Body,"<maxx>",xmax(esteRaster),"</maxx>",sep="")
    Body <- paste(Body,"<miny>",ymin(esteRaster),"</miny>",sep="")
    Body <- paste(Body,"<maxy>",ymax(esteRaster),"</maxy>",sep="")
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
    
    # insert into database layer index
    sql <- "insert into clima3_layer_index (layerclass,layergroup,layername,filepath,createdate) "
    sql <- paste(sql,"values('linea_base','",folder,"','",workspace,":",name,"','",storeurl,"',now())",sep="")
    
    rs <- dbSendQuery(con,sql)
    
  }
}

dbDisconnect(con)
dbUnloadDriver(drv)





