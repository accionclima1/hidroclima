/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package net.rccp.climacaudal;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.AsyncTask;
import android.util.Log;

import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.FirebaseInstanceIdService;

import org.json.JSONObject;

import java.io.IOException;

import okhttp3.MultipartBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;


public class MyFirebaseInstanceIDService extends FirebaseInstanceIdService {

    private static final String TAG = "MyFirebaseIIDService";
    public static final String PREFS_NAME = "ClimaCaudal";
    static OkHttpClient client = new OkHttpClient();
    /**
     * Called if InstanceID token is updated. This may occur if the security of
     * the previous token had been compromised. Note that this is called when the InstanceID token
     * is initially generated so this is where you would retrieve the token.
     */
    // [START refresh_token]
    @Override
    public void onTokenRefresh() {
        // Get updated InstanceID token.
        String refreshedToken = FirebaseInstanceId.getInstance().getToken();
        Log.d(TAG, "Refreshed token: " + refreshedToken);

        // If you want to send messages to this application instance or
        // manage this apps subscriptions on the server side, send the
        // Instance ID token to your app server.
        sendRegistrationToServer(refreshedToken);
    }
    // [END refresh_token]

    /**
     * Persist token to third-party servers.
     *
     * Modify this method to associate the user's FCM InstanceID token with any server-side account
     * maintained by your application.
     *
     * @param token The new token.
     */
    private void sendRegistrationToServer(String token) {
        SharedPreferences settings = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        boolean logged = settings.getBoolean("logged", false);
        String user = settings.getString("usuario","");
        if(!user.equals(""))
        {
            try{
                JSONObject jsonObject = new JSONObject(user);
                String[] parametros = new String[2];
                parametros[1] = jsonObject.getString("id");
                parametros[0] = token;
                try
                {
                    new AsyncTask<String[], Void, String>() {
                        @Override
                        protected String doInBackground(String[]... params) {
                            String res = null;
                            String token = params[0][0];
                            String id = params[0][1];
                            try {
                                res = runTokenUpdate("http://hclima.org/public/updateToken",id,token);
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
            catch(Exception ex)
            {

            }
        }
    }

    static String runTokenUpdate(String url, String Id, String token) throws IOException {
        RequestBody requestBody = new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("id",token)
                .addFormDataPart("token",token)
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
}
