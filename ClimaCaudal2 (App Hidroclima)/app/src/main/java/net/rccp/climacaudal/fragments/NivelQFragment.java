package net.rccp.climacaudal.fragments;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import net.rccp.climacaudal.R;
import net.rccp.climacaudal.WebAppInterfaceRegistrar;

import org.json.JSONObject;

import static android.content.Context.MODE_PRIVATE;

/**
 * Created by DavidEliseo on 4/22/2017.
 */

public class NivelQFragment extends Fragment {
    private View rootView;
    public static final String PREFS_NAME = "ClimaCaudal";
    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        rootView = inflater.inflate(R.layout.content_nivelq, container, false);
        WebView myWebView = (WebView) rootView.findViewById(R.id.wvNivelCaudal);
        myWebView.setWebViewClient(new WebViewClient());
        WebSettings s = myWebView.getSettings();
        s.setJavaScriptEnabled(true);
        SharedPreferences settings = getActivity().getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        String user = settings.getString("usuario","");
        int registro_habilitado = 0;
        if(!user.equals(""))
        {
            try
            {
                JSONObject jsonObject = new JSONObject(user);
                registro_habilitado = jsonObject.getInt("registrar_nivel");
            }
            catch(Exception ex)
            {

            }
        }
        myWebView.addJavascriptInterface(new WebAppInterfaceRegistrar(this.getContext(),registro_habilitado), "Android");
        if(android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.JELLY_BEAN) {
            s.setAllowUniversalAccessFromFileURLs(true);
        }
        myWebView.loadUrl("file:///android_asset/html/nivelq.html");
        return rootView;
    }
}
