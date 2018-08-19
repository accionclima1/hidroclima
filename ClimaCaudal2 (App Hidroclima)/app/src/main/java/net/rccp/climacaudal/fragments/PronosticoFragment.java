package net.rccp.climacaudal.fragments;

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

import net.rccp.climacaudal.R;
import net.rccp.climacaudal.WebAppInterface;

/**
 * Created by DavidEliseo on 4/22/2017.
 */

public class PronosticoFragment extends Fragment {
    private static View rootView;
    private int idpch = 5;
    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        rootView = inflater.inflate(R.layout.content_pronostico,null);
        Bundle args = getArguments();
        Log.i("Eliseo",args.getString("idpch", "5"));
        int idpch = Integer.parseInt(args.getString("idpch", "5"));

        WebView myWebView = (WebView) rootView.findViewById(R.id.webViewPronostico);
        myWebView.setWebViewClient(new WebViewClient());
        WebSettings s = myWebView.getSettings();
        s.setJavaScriptEnabled(true);
        myWebView.addJavascriptInterface(new WebAppInterface(this.getContext(),idpch), "Android");

        if(android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.JELLY_BEAN) {
            s.setAllowUniversalAccessFromFileURLs(true);
        }
        myWebView.loadUrl("file:///android_asset/html/pronosticoq.html");
        return rootView;
    }
}