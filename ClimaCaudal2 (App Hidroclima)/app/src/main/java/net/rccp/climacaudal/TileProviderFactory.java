package net.rccp.climacaudal;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Locale;

import net.rccp.climacaudal.WMSTileProvider;

import android.util.Log;

public class TileProviderFactory {
	
	public static WMSTileProvider getOsgeoWmsTileProvider(int Mode) {
		
		String strResource = "";
		String strLayer = "";
		
		if(Mode==0)
		{
			strResource = "getTile";
			strLayer = "RAS_GOES";
		}

		final String OSGEO_WMS =
				"http://mapas.snet.gob.sv/scripts/mapserv.exe?MAP=/VirtualSites/mapas/wms2010/CuencaSensunapanwms.map&" + strResource + "?" +
	    		"layers=" + strLayer +
	    		"&bbox=%f,%f,%f,%f";
		
		WMSTileProvider tileProvider = new WMSTileProvider(256,256) {
        	
	        @Override
	        public synchronized URL getTileUrl(int x, int y, int zoom) {
	        	double[] bbox = getBoundingBox(x, y, zoom);
	            String s = String.format(Locale.US, OSGEO_WMS, bbox[MINX], 
	            		bbox[MINY], bbox[MAXX], bbox[MAXY]);
	            Log.d("WMSDEMO", s);
	            URL url = null;
	            try {
	                url = new URL(s);
	            } catch (MalformedURLException e) {
	                throw new AssertionError(e);
	            }
	            return url;
	        }
		};
		
		return tileProvider;
	}
}

