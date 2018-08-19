package net.rccp.climacaudal;

import android.content.Context;
import android.util.Log;
import android.webkit.JavascriptInterface;

public class WebAppInterfaceRegistrar {
    Context mContext;
    int registro_habilitado;

    public WebAppInterfaceRegistrar(Context c, int registro_habilitado) {
        mContext = c;
        this.registro_habilitado = registro_habilitado;
    }

    @JavascriptInterface
    public int getRegistroHabilitado() {
        Log.i("Eliseo",""+registro_habilitado);
        return registro_habilitado;
    }
}
