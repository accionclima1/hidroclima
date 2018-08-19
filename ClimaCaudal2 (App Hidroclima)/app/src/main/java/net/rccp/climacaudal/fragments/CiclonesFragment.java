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

/**
 * A simple {@link Fragment} subclass.
 */
public class CiclonesFragment extends Fragment {
    private View rootView;

    public CiclonesFragment() {
        // Required empty public constructor
    }


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        rootView = inflater.inflate(R.layout.fragment_presion, container, false);
        WebView myWebView = (WebView) rootView.findViewById(R.id.wvPresion);
        myWebView.setWebViewClient(new WebViewClient());
        WebSettings s = myWebView.getSettings();
        s.setJavaScriptEnabled(true);

        if(android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.JELLY_BEAN) {
            s.setAllowUniversalAccessFromFileURLs(true);
        }

        myWebView.loadUrl("file:///android_asset/html/ciclones.html");
        return rootView;
    }

}
