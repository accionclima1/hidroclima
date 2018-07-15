package net.rccp.climacaudal;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Handler;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.support.v7.widget.AppCompatButton;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.MapView;
import com.google.android.gms.maps.MapsInitializer;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.GroundOverlay;
import com.google.android.gms.maps.model.GroundOverlayOptions;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.LatLngBounds;
//import com.google.maps.android.kml.KmlLayer;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

/**
 * Created by DavidEliseo on 4/22/2017.
 */

public class RadarFragment extends Fragment implements OnMapReadyCallback {
    private static View rootView;
    private static GoogleMap myMap;
    MapView mMapView;
    private static ArrayList<Bitmap> images = new ArrayList<Bitmap>();
    private static ArrayList<String> labels = new ArrayList<String>();
    private static int imageindex = 0;
    private static GroundOverlay currentImage;
    private static boolean visible;
    @Override
    public void onDetach() {
        super.onDetach();
    }
    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        rootView = inflater.inflate(R.layout.content_radar,null);
        MapsInitializer.initialize(this.getActivity());
        mMapView = (MapView) rootView.findViewById(R.id.map);
        mMapView.onCreate(savedInstanceState);
        mMapView.getMapAsync(this);
        visible = true;
        AppCompatButton btnPausa = (AppCompatButton) rootView.findViewById(R.id.pausa);
        AppCompatButton btnAnterior = (AppCompatButton) rootView.findViewById(R.id.anterior);
        AppCompatButton btnSiguiente = (AppCompatButton) rootView.findViewById(R.id.siguiente);

        btnPausa.setText("Pausa");

        btnPausa.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Log.i("Eliseo",((AppCompatButton) rootView.findViewById(R.id.pausa)).getText().toString());
                if(((AppCompatButton) rootView.findViewById(R.id.pausa)).getText().toString().trim()=="Pausa") {
                    Log.i("Eliseo","True");
                    ((AppCompatButton) rootView.findViewById(R.id.siguiente)).setEnabled(true);
                    ((AppCompatButton) rootView.findViewById(R.id.anterior)).setEnabled(true);
                    ((AppCompatButton) rootView.findViewById(R.id.pausa)).setText("Reanudar");
                }
                else
                {
                    Log.i("Eliseo","False");
                    ((AppCompatButton) rootView.findViewById(R.id.siguiente)).setEnabled(false);
                    ((AppCompatButton) rootView.findViewById(R.id.anterior)).setEnabled(false);
                    ((AppCompatButton) rootView.findViewById(R.id.pausa)).setText("Pausa");
                    AnimateRadar();
                }
            }
        });

        btnAnterior.setOnClickListener(new View.OnClickListener(){
            @Override
            public void onClick(View view) {
                Log.i("Eliseo","ImageIndex antes:" + imageindex);
                imageindex-=1;
                if(imageindex<0) imageindex+=images.size();
                showRadarImage(imageindex);
                Log.i("Eliseo","ImageIndex despues:" + imageindex);
            }
        });

        btnSiguiente.setOnClickListener(new View.OnClickListener(){
            @Override
            public void onClick(View view) {
                Log.i("Eliseo","ImageIndex antes:" + imageindex);
                showRadarImage(imageindex);
                imageindex+=1;
                if(imageindex>=images.size()){
                    imageindex=0;
                }
                Log.i("Eliseo","ImageIndex despues:" + imageindex);
            }
        });

        return rootView;
    }

    @Override
    public void onPause() {
        super.onPause();
        mMapView.onPause();
        visible = false;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        mMapView.onDestroy();
        visible = false;
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
        visible = true;
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
    }

    @Override
    public void onMapReady(GoogleMap googleMap)
    {
        LatLng sydney = new LatLng(13.7620619, -89.743537);
        googleMap.setMapType(GoogleMap.MAP_TYPE_HYBRID);
        myMap = googleMap;
        googleMap.moveCamera(CameraUpdateFactory.newLatLng(sydney));
        try {
            //KmlLayer layer = new KmlLayer(myMap, R.raw.cuenca, getActivity().getApplicationContext());
            //layer.addLayerToMap();
        }
        catch (Exception ex)
        {

        }
        getJsonRadarImages();
    }

    public static void getJsonRadarImages()
    {
        Log.i("Eliseo","getJsonRadarImages");
        new AsyncTask<Void, Void, JSONArray>() {
            @Override
            protected JSONArray doInBackground(Void... params) {
                JSONArray jsonArray = null;
                try {
                    jsonArray = new JSONArray(getListOfImages());

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
                        labels.add(jsonObject.getString("fechahora"));
                        getRadarImage(jsonObject.getString("fileurl"));
                    }
                }catch(Exception ex)
                {
                    Log.i("Eliseo","?-image" + ex.getMessage());
                }
                AnimateRadar();
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

    public static String getListOfImages() {
        StringBuilder builder = new StringBuilder();
        try {
            return run("http://hclima.org/public/getRadarImagesLastHour");
        }
        catch(Exception ex)
        {

        }
        return null;
    }


    public static void getRadarImage(final String url)
    {
        Log.i("Eliseo","getRadarImage");
        new AsyncTask<Void, Void, Bitmap>() {
            @Override
            protected Bitmap doInBackground(Void... params) {

                return getBitmapFromURL(("http://hclima.org/images/" + url).replace("%20","_"));
            }

            @Override
            protected void onPostExecute(Bitmap bmp) {

                try
                {
                    if(bmp != null) images.add(bmp);

                }catch(Exception ex)
                {
                    Log.i("Eliseo","?" + ex.getMessage());
                }
            }
        }.execute(null, null, null);
    }

    public static Bitmap getBitmapFromURL(String link) {

        try {
            URL url = new URL(link);
            HttpURLConnection connection = (HttpURLConnection) url
                    .openConnection();
            connection.setDoInput(true);
            connection.connect();
            InputStream input = connection.getInputStream();
            Bitmap myBitmap = BitmapFactory.decodeStream(input);

            return myBitmap;

        } catch (IOException e) {
            e.printStackTrace();
            Log.e("getBmpFromUrl error: ", e.getMessage().toString());
            return null;
        }
    }

    public static void AnimateRadar()
    {

        final Handler handler = new Handler();

        handler.post(new Runnable() {

            @Override
            public void run() {
                try
                {
                    showRadarImage(imageindex);
                    imageindex+=1;
                    if(imageindex>=images.size()){
                        imageindex=0;
                    }
                }
                catch (Exception ex)
                {
                    Log.i("Eliseo","" + ex.getMessage());
                }

                if(((AppCompatButton) rootView.findViewById(R.id.pausa)).getText().toString().trim()=="Pausa" && visible == true) {
                    handler.postDelayed(this, 2500);
                }
            }
        });
    }

    public static void showRadarImage(int index)
    {
        Log.i("Eliseo","showRadarImage");
        if(currentImage!=null) currentImage.remove();
        if(images.get(index)!=null)
        {
            LatLngBounds radarBounds = new LatLngBounds(
                    new LatLng(12.96,-90.286),       // South west corner
                    new LatLng(14.704,-87.607));
            GroundOverlayOptions radar = new GroundOverlayOptions()
                    .image(BitmapDescriptorFactory.fromBitmap(images.get(index)))
                    .positionFromBounds(radarBounds)
                    .zIndex(50);

            currentImage = myMap.addGroundOverlay(radar);
            TextView label = (TextView)rootView.findViewById(R.id.textView3);
            label.setText("Imagen de: " + labels.get(index));
        }
    }
}
