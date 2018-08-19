package net.rccp.climacaudal.fragments;


import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import net.rccp.climacaudal.R;
import net.rccp.climacaudal.WebAppInterfaceMensajes;

import org.json.JSONObject;

/**
 * A simple {@link Fragment} subclass.
 */
public class VientoFragment extends Fragment {
    private View rootView;

    public VientoFragment() {
        // Required empty public constructor
    }


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        rootView = inflater.inflate(R.layout.fragment_condiciones, container, false);
        WebView myWebView = (WebView) rootView.findViewById(R.id.wvCondiciones);
        myWebView.setWebViewClient(new WebViewClient());
        WebSettings s = myWebView.getSettings();
        s.setJavaScriptEnabled(true);

        if(android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.JELLY_BEAN) {
            s.setAllowUniversalAccessFromFileURLs(true);
        }

        myWebView.loadUrl("file:///android_asset/html/viento.html");
        return rootView;
    }

}
