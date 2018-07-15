package net.rccp.climacaudal;

import android.content.Context;
import android.content.Intent;
import android.os.AsyncTask;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.support.v7.widget.AppCompatButton;
import android.support.v7.widget.AppCompatEditText;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.firebase.iid.FirebaseInstanceId;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;

import okhttp3.MultipartBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class Register extends AppCompatActivity {

    private String mNombre;
    private String mApellido;
    private String mEmail;
    private String mTelefono;
    private String mClave;
    private String mClave2;
    private String mToken;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);
        ((AppCompatButton) findViewById(R.id.regButton)).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                doRegister();
            }
        });
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

    public static String getToken() {
        try {
            return run("http://hclima.org/public/getToken");
        } catch (Exception ex) {

        }
        return null;
    }

    static String runRegister(String url, String name, String lastname, String telephone, String email, String clave, String token) throws IOException {
        RequestBody requestBody = new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("gmdtoken",token)
                .addFormDataPart("nombre",name)
                .addFormDataPart("apellido",lastname)
                .addFormDataPart("telefono",telephone)
                .addFormDataPart("email", email)
                .addFormDataPart("clave",clave)
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

    private void doRegister()
    {
        Log.i("Eliseo","Registro");
        mNombre = ((AppCompatEditText) findViewById(R.id.edit_nombre)).getText().toString();
        mApellido = ((AppCompatEditText) findViewById(R.id.edit_apellido)).getText().toString();
        mEmail = ((AppCompatEditText) findViewById(R.id.edit_email)).getText().toString();
        mTelefono = ((AppCompatEditText) findViewById(R.id.edit_telefono)).getText().toString();
        mClave = ((AppCompatEditText) findViewById(R.id.edit_clave)).getText().toString();
        mClave2 = ((AppCompatEditText) findViewById(R.id.confirmar_clave)).getText().toString();
        mToken = String.valueOf(FirebaseInstanceId.getInstance().getToken());

        // TODO: Validar Ingreso de datos

        CharSequence text = "";
        Toast toast;
        Context context = getApplicationContext();
        int duration = Toast.LENGTH_SHORT;

        if(mNombre.equals("")){
            text = "Debe ingresar su nombre.";
            toast = Toast.makeText(context, text, duration);
            toast.show();
            return;
        }

        if(mApellido.equals("")) {
            text = "Debe ingresar su apellido.";
            toast = Toast.makeText(context, text, duration);
            toast.show();
            return;
        }

        if(mEmail.equals("")){
            text = "Debe ingresar un correo electrónico válido.";
            toast = Toast.makeText(context, text, duration);
            toast.show();
            return;
        }

        if(mClave.equals("")){
            text = "Debe ingresar una clave para acceso.";
            toast = Toast.makeText(context, text, duration);
            toast.show();
            return;
        }

        if(!mClave.equals(mClave2))
        {
            text = "Las claves no coinciden.";
            toast = Toast.makeText(context, text, duration);
            toast.show();
            return;
        }

        new AsyncTask<Void, Void, String>() {
            @Override
            protected String doInBackground(Void... params) {
                String res = null;
                try {
                    res = getToken();

                } catch (Exception e) {
                    e.printStackTrace();
                }
                return res;
            }

            @Override
            protected void onPostExecute(String token) {

                try
                {
                    new AsyncTask<String, Void, String>() {
                        @Override
                        protected String doInBackground(String... params) {
                            String res = null;
                            String token = params[0];
                            try {
                                res = runRegister("http://hclima.org/public/registrarUsuario",mNombre,mApellido,mTelefono,mEmail,mClave,mToken);
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

                                if(res.equals("OK")) {
                                    Intent intent = new Intent(getApplicationContext(), LoginActivity.class);
                                    startActivity(intent);
                                    finish();
                                }
                                else
                                {
                                    CharSequence text = "El correo  proporcionada ya se encuentra registrado.";
                                    Toast toast;
                                    Context context = getApplicationContext();
                                    int duration = Toast.LENGTH_SHORT;
                                    toast = Toast.makeText(context, text, duration);
                                    toast.show();
                                }
                            }catch(Exception ex)
                            {
                                Log.i("Eliseo","?-image" + ex.getMessage());
                            }
                        }
                    }.execute(token, null, null);
                }catch(Exception ex)
                {
                    Log.i("Eliseo","?-image" + ex.getMessage());
                }
            }
        }.execute(null, null, null);
    }
}
