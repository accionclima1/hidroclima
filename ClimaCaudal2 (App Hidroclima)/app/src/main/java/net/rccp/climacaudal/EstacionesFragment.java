package net.rccp.climacaudal;

import android.os.AsyncTask;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.MapView;
import com.google.android.gms.maps.MapsInitializer;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

/**
 * Created by DavidEliseo on 4/22/2017.
 */

public class EstacionesFragment extends Fragment implements OnMapReadyCallback {
    private View rootView;
    GoogleMap myMap;
    MapView mMapView;

    @Override
    public void onDetach() {
        super.onDetach();
    }

    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        rootView = inflater.inflate(R.layout.content_estaciones,null);
        MapsInitializer.initialize(this.getActivity());
        mMapView = (MapView) rootView.findViewById(R.id.map);
        mMapView.onCreate(savedInstanceState);
        mMapView.getMapAsync(this);
        return rootView;
    }

    @Override
    public void onPause() {
        super.onPause();
        mMapView.onPause();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        mMapView.onDestroy();
    }

    @Override
    public void onSaveInstanceState(Bundle outState)
    {
        super.onSaveInstanceState(outState); mMapView.onSaveInstanceState(outState);
    }

    @Override
    public void onLowMemory()
    {
        super.onLowMemory();
        mMapView.onLowMemory();
    }

    @Override
    public void onResume() {
        super.onResume();
        mMapView.onResume();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
    }

    @Override
    public void onMapReady(GoogleMap googleMap)
    {
        myMap = googleMap;
        LatLng sydney = new LatLng(13.7620619, -89.743537);
        googleMap.setMapType(GoogleMap.MAP_TYPE_HYBRID);
        googleMap.moveCamera(CameraUpdateFactory.newLatLng(sydney));
        try {
            //KmlLayer layer = new KmlLayer(myMap, R.raw.cuenca, getActivity().getApplicationContext());
            //layer.addLayerToMap();
        }
        catch (Exception ex)
        {

        }
        getEstaciones();
        getMediciones();
    }

    public void getEstaciones()
    {
        Log.i("Eliseo","getEstaciones");
        new AsyncTask<Void, Void, JSONArray>() {
            @Override
            protected JSONArray doInBackground(Void... params) {
                JSONArray jsonArray = null;
                try {
                    jsonArray = new JSONArray(getListOfEstaciones());

                } catch (Exception e) {
                    e.printStackTrace();
                }
                return jsonArray;
            }

            @Override
            protected void onPostExecute(JSONArray jsonArray) {

                try
                {
                    for(int i = 0;i<jsonArray.length();i++)
                    {
                        JSONObject jsonObject = jsonArray.getJSONObject(i);
                        int marker = 0;


                        marker = R.drawable.raingauge40;
                        myMap.addMarker(new MarkerOptions()
                                .position(new LatLng(Double.parseDouble(jsonObject.getString("latitud")), Double.parseDouble(jsonObject.getString("longitud"))))
                                .title("Estación Telemétrica " + jsonObject.getString("nombre_estacion")))
                                .setIcon(BitmapDescriptorFactory.fromResource(marker));
                    }
                }catch(Exception ex)
                {
                    Log.i("Eliseo","?-image" + ex.getMessage());
                }
            }
        }.execute(null, null, null);
    }

    static OkHttpClient client = new OkHttpClient();

    static String run(String url) throws IOException {
        Request request = new Request.Builder()
                .url(url)
                .build();

        try {
            Response response = client.newCall(request).execute();
            return response.body().string();
        } catch (Exception ex){

        }
        return null;
    }

    public static String getListOfEstaciones() {
        StringBuilder builder = new StringBuilder();
        try {
            return run("http://hclima.org/public/getEstacionesMedicion");
        }
        catch(Exception ex)
        {

        }
        return null;
    }

    public void getMediciones()
    {
        WebView myWebView = (WebView) rootView.findViewById(R.id.webView);
        WebSettings s = myWebView.getSettings();
        s.setJavaScriptEnabled(true);
        if(android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.JELLY_BEAN) {
            s.setAllowUniversalAccessFromFileURLs(true);
        }
        myWebView.loadUrl("file:///android_asset/html/mediciones.html");
    }
}
