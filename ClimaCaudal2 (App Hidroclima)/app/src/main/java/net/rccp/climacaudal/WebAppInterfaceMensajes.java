package net.rccp.climacaudal;

import android.content.Context;
import android.util.Log;
import android.webkit.JavascriptInterface;

/**
 * Created by DavidEliseo on 5/20/2017.
 */

public class WebAppInterfaceMensajes {
    Context mContext;
    int userid;

    WebAppInterfaceMensajes(Context c, int _userid) {
        mContext = c;
        userid = _userid;
    }

    @JavascriptInterface
    public int getUserId() {
        Log.i("Eliseo",""+userid);
        return userid;
    }

}
