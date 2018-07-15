<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor version="1.0.0" 
xmlns="http://www.opengis.net/sld" 
xmlns:ogc="http://www.opengis.net/ogc"
xmlns:xlink="http://www.w3.org/1999/xlink" 
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd">
  <NamedLayer>
    <Name>lluviaClima3</Name>
    <UserStyle>
      <Name>lluviaClima3</Name>
      <Title>Distribucion de lluvia acumulada Clima 3</Title>
      <FeatureTypeStyle>
        <Rule>
          <RasterSymbolizer>
            <Opacity>1.0</Opacity>
            <ColorMap>
              <ColorMapEntry color="#F0F7FF" quantity="0" />
              <ColorMapEntry color="#DEF1F8" quantity="100"/>
              <ColorMapEntry color="#CEEBF1" quantity="200"/>
              <ColorMapEntry color="#BCE5EB" quantity="300"/>
              <ColorMapEntry color="#94C4E8" quantity="400"/>
              <ColorMapEntry color="#7FB0EA" quantity="500"/>
              <ColorMapEntry color="#6B9CEB" quantity="600"/>
              <ColorMapEntry color="#5F84DC" quantity="700"/>
              <ColorMapEntry color="#576DC0" quantity="800"/>
              <ColorMapEntry color="#5055A6" quantity="900"/>
              <ColorMapEntry color="#483D8B" quantity="1000"/>
            </ColorMap>
          </RasterSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
