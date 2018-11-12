/* funciones JavaScript a ser incluidas en aplicacion shiny BDCAC */
/* Ing. David Eliseo Martinez */
document.title = "Visualizador BDCAC";

var mapsPlaceholder = [];

L.Map.addInitHook(function () {
  mapsPlaceholder.push(this); 
})

var legend = null;
var interpolacion = null;

Shiny.addCustomMessageHandler('interpolateIDW', function(message) {
    $('#' + message.map).loadingModal({text: 'Procesando...'});
    $('#' + message.map).loadingModal('show');
    if(legend!=null) legend.remove();
    if(interpolacion!=null) interpolacion.remove();
    $.getJSON('casimply.geo.json',function(data){
        var map = null;
        
        var myCustomStyle = {
            stroke: false,
            fill: true,
            fillColor: '#fff',
            fillOpacity: 0.7
        }

        for(i=0;i<mapsPlaceholder.length;i++)
        {
            if(mapsPlaceholder[i].id==message.map)
            {
                map = mapsPlaceholder[i];
            }
        }
        var mcolor = null;
        if(message.colorramp==1) 
            mcolor = ['#f7fcf0','#e0f3db','#ccebc5','#a8ddb5','#7bccc4','#4eb3d3','#2b8cbe','#0868ac','#084081'];
        else
            mcolor = ['#ffffe5','#fff7bc','#fee391','#fec44f','#fe9929','#ec7014','#cc4c02','#993404','#662506'];
        sizeCell = message.celda;
        var Features = new Array();
        for(i=0;i<message.estcodigobdcac.length;i++)
        {
            if(message.estcodigobdcac[i]!=50000771)
                Features.push({ "type": "Feature", "properties": { "mean": message.mean[i], "latitude": message.latitude[i], "longitude": message.longitude[i]}, "geometry":{"type": "Point", "coordinates": [ message.longitude[i], message.latitude[i] ]}});
        }
   
        var sampledPoints = {
            "type": "FeatureCollection",
            "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
            "features": Features
        };
  
        var options = {gridType: 'point', property: 'mean', units: 'kilometers'};
        var Grid = turf.interpolate(sampledPoints, sizeCell, options);

        L.geoJson(sampledPoints, {
            onEachFeature: function(feature, layer) {
            layer.bindPopup("Lluvia promedio " + Math.round(feature.properties.value * 100) / 100)
            }
        })

        var grdOptions = {'units':'kilometers','mask':data.features[0]};
        var hexCA = turf.squareGrid(turf.bbox(Grid),sizeCell,grdOptions);
        var valuedGrid = turf.collect(hexCA,Grid,'mean','mean');

        interpolacion = L.choropleth(valuedGrid, {
            valueProperty: 'mean',
            colors: mcolor,
            steps: 9,
            mode: 'q',
            style: {
            color: '#fff',
            weight: 0.1,
            fillOpacity: 0.5
            },
            onEachFeature: function(feature, layer) {
            layer.bindPopup("Lluvia promedio " + Math.round(feature.properties.mean * 100) / 100)
            }
        }).addTo(map)
 
        legend = L.control({
            position: 'bottomright'
        })
      
        legend.onAdd = function(map) {
            var div = L.DomUtil.create('div', 'info legend')
            var limits = interpolacion.options.limits.sort(function(a, b){return a - b})
            var colors = interpolacion.options.colors
            var labels = []
            // Add min & max
            div.innerHTML = '<div class="labels"><div class="min">' + Math.round(limits[0] * 100) / 100  + ' mm </div> \
                <div class="max">' + Math.round(limits[limits.length - 1] * 100) / 100 + ' mm</div></div>'
            limits.forEach(function(limit, index) {
            labels.push('<li style="background-color: ' + colors[index] + '"></li>')
            })
            div.innerHTML += '<ul>' + labels.join('') + '</ul>'
            return div
        }
        legend.addTo(map)
        $('#' + message.map).loadingModal('hide');
    });
});

Shiny.addCustomMessageHandler('removeInterpolacion', function(message) {
    if(legend!=null) legend.remove();
    if(interpolacion!=null) interpolacion.remove();
});