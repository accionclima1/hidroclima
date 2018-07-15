package net.rccp.climacaudal;

import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentTransaction;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.MapView;
import com.google.android.gms.maps.MapsInitializer;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.gms.maps.model.TileOverlay;
import com.google.android.gms.maps.model.TileOverlayOptions;
import com.google.android.gms.maps.model.TileProvider;
import com.google.maps.android.data.kml.KmlLayer;
import com.google.maps.android.ui.BubbleIconFactory;
import com.google.maps.android.ui.IconGenerator;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

/**
 * Created by DavidEliseo on 4/22/2017.
 */

public class MainInitFragment extends Fragment implements GoogleMap.OnMarkerClickListener,
        OnMapReadyCallback {
    private View rootView;
    GoogleMap myMap;
    MapView mMapView;
    private Marker myMarker;
    private static TileOverlay mTilesLayer1;
    private static TileProvider wmsTileProvider;

    @Override
    public void onDetach() {
        super.onDetach();
    }

    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        rootView = inflater.inflate(R.layout.content_main_init, null);
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
    public void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        mMapView.onSaveInstanceState(outState);
    }

    @Override
    public void onLowMemory() {
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
    public void onMapReady(GoogleMap googleMap) {
        myMap = googleMap;
        LatLng sydney = new LatLng(13.817077, -89.722251);
        googleMap.setMapType(GoogleMap.MAP_TYPE_HYBRID);
        googleMap.moveCamera(CameraUpdateFactory.newLatLng(sydney));
        try {
            KmlLayer layer = new KmlLayer(myMap, R.raw.cuenca, getActivity().getApplicationContext());
            layer.addLayerToMap();
        } catch (Exception ex) {

        }
        getPchs();
        myMap.setOnMarkerClickListener(this);
    }

    public void getPchs() {
        Log.i("Eliseo", "getPchs");
        new AsyncTask<Void, Void, JSONArray>() {
            @Override
            protected JSONArray doInBackground(Void... params) {
                JSONArray jsonArray = null;
                try {
                    jsonArray = new JSONArray(getListOfPchs());

                } catch (Exception e) {
                    e.printStackTrace();
                }
                return jsonArray;
            }

            @Override
            protected void onPostExecute(JSONArray jsonArray) {

                try {
                    for (int i = 0; i < jsonArray.length(); i++) {
                        JSONObject jsonObject = jsonArray.getJSONObject(i);
                        int marker = 0;
                        IconGenerator icnGenerator = new IconGenerator(getContext());
                        icnGenerator.setTextAppearance(R.style.iconGenText);
                        //icnGenerator.setBackground(new ColorDrawable(Color.argb(255,38,147,255)));
                        if(jsonObject.getString("nombre_pch").trim().equals("PAPALOATE DE NAHUIZALCO I") || jsonObject.getString("nombre_pch").trim().equals("CUCUMACAYAN")) {
                            icnGenerator.setContentRotation(180);
                            icnGenerator.setRotation(180);
                        }
                        Bitmap iconBitmap = icnGenerator.makeIcon(jsonObject.getString("nombre_pch"));

                        marker = R.drawable.pch;

                        myMarker = myMap.addMarker(new MarkerOptions()
                                .position(new LatLng(Double.parseDouble(jsonObject.getString("latitud")), Double.parseDouble(jsonObject.getString("longitud"))))
                                .title("PCH " + jsonObject.getString("nombre_pch")));
                        myMarker.setIcon(BitmapDescriptorFactory.fromResource(marker));
                        myMarker.setTag(jsonObject.getString("idpch"));

                        myMarker = myMap.addMarker(new MarkerOptions()
                                .position(new LatLng(Double.parseDouble(jsonObject.getString("latitud")), Double.parseDouble(jsonObject.getString("longitud"))))
                                .title("PCH " + jsonObject.getString("nombre_pch")));
                        myMarker.setIcon(BitmapDescriptorFactory.fromBitmap(iconBitmap));
                        myMarker.setTag(jsonObject.getString("idpch"));

                        if(jsonObject.getString("nombre_pch").trim().equals("PAPALOATE DE NAHUIZALCO I") || jsonObject.getString("nombre_pch").trim().equals("CUCUMACAYAN")) {
                            myMarker.setAnchor(0.5f,0.1f);
                        } else {
                            myMarker.setAnchor(0.5f,1.5f);
                        }

                    }
                } catch (Exception ex) {
                    Log.i("Eliseo", "?-image" + ex.getMessage());
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
        } catch (Exception ex) {

        }
        return null;
    }

    public static String getListOfPchs() {
        StringBuilder builder = new StringBuilder();
        try {
            return run("http://hclima.org/public/getPCHs");
        } catch (Exception ex) {

        }
        return null;
    }

    public void getMediciones() {
        WebView myWebView = (WebView) rootView.findViewById(R.id.webView);
        WebSettings s = myWebView.getSettings();
        s.setJavaScriptEnabled(true);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.JELLY_BEAN) {
            s.setAllowUniversalAccessFromFileURLs(true);
        }
        myWebView.loadUrl("file:///android_asset/html/mediciones.html");
    }

    @Override
    public boolean onMarkerClick(final Marker marker) {
        Log.i("Eliseo","Marker click");
        String tag = (String) marker.getTag();
        if (tag != null) {
            Fragment fragment = new PronosticoFragment();

            Bundle args = new Bundle();
            args.putString("idpch", tag);
            fragment.setArguments(args);

            if(fragment!=null) {
                FragmentTransaction transaction = getFragmentManager().beginTransaction();
                transaction.replace(R.id.mainFrame, fragment);
                transaction.addToBackStack(null);
                transaction.commit();
            }
        }
        return false;
    }
}