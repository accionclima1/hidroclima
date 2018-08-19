package net.rccp.climacaudal.fragments;

import android.content.Intent;
import android.content.SharedPreferences;
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
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;

import net.rccp.climacaudal.R;
import net.rccp.climacaudal.WebAppInterfaceMensajes;

import org.json.JSONObject;

import java.io.IOException;

import okhttp3.MultipartBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

import static android.content.Context.MODE_PRIVATE;

/**
 * Created by DavidEliseo on 4/22/2017.
 */

public class ConsultaFragment extends Fragment {
    private View rootView;
    public static final String PREFS_NAME = "ClimaCaudal";
    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        rootView = inflater.inflate(R.layout.content_consulta,null);
        Button mEnviar = (Button) rootView.findViewById(R.id.btnEnviarMensaje);
        mEnviar.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                try {
                    SharedPreferences settings = getActivity().getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
                    String user = settings.getString("usuario", "");
                    JSONObject jsonObject = new JSONObject(user);
                    String mensaje = ((EditText) rootView.findViewById(R.id.txtMensaje)).getText().toString();
                    String id = jsonObject.getString("id");
                    sendMessage(id,mensaje);
                } catch (Exception ex) {

                }
            }
        });
        SharedPreferences settings = getActivity().getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        String user = settings.getString("usuario","");
        if(!user.equals("")){
            try {
                JSONObject jsonObject = new JSONObject(user);
                WebView myWebView = (WebView) rootView.findViewById(R.id.viewMensajes);
                myWebView.setWebViewClient(new WebViewClient());
                WebSettings s = myWebView.getSettings();
                s.setJavaScriptEnabled(true);
                myWebView.addJavascriptInterface(new WebAppInterfaceMensajes(this.getContext(),jsonObject.getInt("id")), "Android");

                if(android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.JELLY_BEAN) {
                    s.setAllowUniversalAccessFromFileURLs(true);
                }
                myWebView.loadUrl("file:///android_asset/html/mensajes.html");
            } catch (Exception ex) {

            }
        }
        return rootView;
    }

    static OkHttpClient client = new OkHttpClient();

    static String run(String url, String id, String mensaje) throws IOException {
        RequestBody requestBody = new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("id", id)
                .addFormDataPart("mensaje",mensaje)
                .build();
        Request request = new Request.Builder()
                .url(url)
                .method("POST", RequestBody.create(null, new byte[0]))
                .post(requestBody)
                .build();

        try {
            Response response = client.newCall(request).execute();
            return response.body().string();
        } catch (Exception ex) {

        }
        return null;
    }

    public void sendMessage(String id, String mensaje)
    {
        try
        {
            String[] parametros = new String[2];
            parametros[0] = id;
            parametros[1] = mensaje;
            new AsyncTask<String[], Void, String>() {
                @Override
                protected String doInBackground(String[]... params) {
                    String res = null;
                    String id = params[0][0];
                    String mensaje = params[0][1];
                    try {
                        res = run("http://hclima.org/public/sendMessageToAdmin",id,mensaje);
                        Log.i("Eliseo",res);
                        return res;

                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                    return res;
                }

                @Override
                protected void onPostExecute(String res) {

                    try
                    {
                        Log.i("Eliseo",res);
                    }catch(Exception ex)
                    {
                        Log.i("Eliseo","?-image" + ex.getMessage());
                    }
                }
            }.execute(parametros, null, null);
        }catch(Exception ex)
        {
            Log.i("Eliseo","?-image" + ex.getMessage());
        }
    }
}
