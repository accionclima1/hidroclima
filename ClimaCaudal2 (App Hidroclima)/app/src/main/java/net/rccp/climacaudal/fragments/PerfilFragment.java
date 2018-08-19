package net.rccp.climacaudal.fragments;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.support.v7.widget.AppCompatEditText;
import android.support.v7.widget.AppCompatTextView;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import net.rccp.climacaudal.R;

import org.json.JSONObject;

import static android.content.Context.MODE_PRIVATE;

/**
 * Created by DavidEliseo on 4/22/2017.
 */

public class PerfilFragment extends Fragment {
    private View rootView;
    public static final String PREFS_NAME = "ClimaCaudal";
    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        rootView = inflater.inflate(R.layout.content_perfil,null);
        SharedPreferences settings = getActivity().getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        String user = settings.getString("usuario","");
        if(!user.equals(""))
        {
            try
            {
                JSONObject jsonObject = new JSONObject(user);
                ((AppCompatEditText) rootView.findViewById(R.id.edit_nombre_perfil)).setText(jsonObject.getString("name"));
                ((AppCompatEditText) rootView.findViewById(R.id.edit_apellido_perfil)).setText(jsonObject.getString("lastname"));
                ((AppCompatEditText) rootView.findViewById(R.id.edit_telefono_perfil)).setText(jsonObject.getString("telefono"));
                //((AppCompatEditText) rootView.findViewById(R.id.edit_email_perfil)).setText(jsonObject.getString("email"));
                ((AppCompatEditText) rootView.findViewById(R.id.edit_nombre_perfil)).setEnabled(false);
                ((AppCompatEditText) rootView.findViewById(R.id.edit_apellido_perfil)).setEnabled(false);
                ((AppCompatEditText) rootView.findViewById(R.id.edit_telefono_perfil)).setEnabled(false);
                //((AppCompatEditText) rootView.findViewById(R.id.edit_email_perfil)).setEnabled(false);
            }
            catch (Exception ex)
            {
                Log.i("Eliseo",ex.getMessage());
            }
        }
        return rootView;
    }
}
