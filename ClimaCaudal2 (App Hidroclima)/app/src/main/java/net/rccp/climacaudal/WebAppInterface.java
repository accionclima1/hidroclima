package net.rccp.climacaudal;

import android.content.Context;
import android.util.Log;
import android.webkit.JavascriptInterface;

/**
 * Created by DavidEliseo on 5/20/2017.
 */

public class WebAppInterface {
    Context mContext;
    int idpch;

    public WebAppInterface(Context c, int _idpch) {
        mContext = c;
        idpch = _idpch;
    }

    @JavascriptInterface
    public int getIdPch() {
        Log.i("Eliseo",""+idpch);
        return idpch;
    }

}
