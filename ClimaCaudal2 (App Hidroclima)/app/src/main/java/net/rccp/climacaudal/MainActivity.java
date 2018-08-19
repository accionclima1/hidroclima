package net.rccp.climacaudal;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentTransaction;
import android.util.Log;
import android.support.design.widget.NavigationView;
import android.support.v4.view.GravityCompat;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBarDrawerToggle;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.Menu;
import android.view.MenuItem;

import net.rccp.climacaudal.fragments.AcercaDeFragment;
import net.rccp.climacaudal.fragments.CiclonesFragment;
import net.rccp.climacaudal.fragments.NivelQFragment;
import net.rccp.climacaudal.fragments.PresionFragment;
import net.rccp.climacaudal.fragments.TemperaturaFragment;
import net.rccp.climacaudal.fragments.VientoFragment;
import net.rccp.climacaudal.fragments.ConsultaFragment;
import net.rccp.climacaudal.fragments.EstacionesFragment;
import net.rccp.climacaudal.fragments.PerfilFragment;
import net.rccp.climacaudal.fragments.PronosticoFragment;
import net.rccp.climacaudal.fragments.RadarFragment;

public class MainActivity extends AppCompatActivity
        implements NavigationView.OnNavigationItemSelectedListener {
        FragmentManager mFragmentManager;
    public static final String PREFS_NAME = "ClimaCaudal";
    private boolean viewIsAtHome;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        SharedPreferences settings = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        boolean logged = settings.getBoolean("logged", false);
        String user = settings.getString("usuario","");
        if(logged) {
            setContentView(R.layout.activity_main);
            Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
            setSupportActionBar(toolbar);

        /*FloatingActionButton fab = (FloatingActionButton) findViewById(R.id.fab);
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Snackbar.make(view, "Replace with your own action", Snackbar.LENGTH_LONG)
                        .setAction("Action", null).show();
            }
        });*/

            DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
            ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(
                    this, drawer, toolbar, R.string.navigation_drawer_open, R.string.navigation_drawer_close);
            drawer.setDrawerListener(toggle);
            toggle.syncState();

            NavigationView navigationView = (NavigationView) findViewById(R.id.nav_view);
            navigationView.setNavigationItemSelectedListener(this);

            Fragment fragment = null;
            fragment = new MainInitFragment();
            FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();
            transaction.replace(R.id.mainFrame, fragment,"Main");
            transaction.addToBackStack(null);
            transaction.commit();
        }
        else
        {
            // Launch Activity Login // Register
            Intent intent = new Intent(this, LoginActivity.class);
            startActivity(intent);
            finish();
        }
    }

    @Override
    public void onBackPressed() {
        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
        if (drawer.isDrawerOpen(GravityCompat.START)) {
            drawer.closeDrawer(GravityCompat.START);
        } else {
            Fragment myFragment = (Fragment)getSupportFragmentManager().findFragmentByTag("Main");
            if(myFragment == null || myFragment.isVisible() == false)
                super.onBackPressed();
            else finish();
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            Fragment fragment = null;
            fragment = new AcercaDeFragment();
            if(fragment!=null) {
                FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();
                transaction.replace(R.id.mainFrame, fragment);
                transaction.addToBackStack(null);
                transaction.commit();
            }
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    @SuppressWarnings("StatementWithEmptyBody")
    @Override
    public boolean onNavigationItemSelected(MenuItem item) {
        // Handle navigation view item clicks here.
        int id = item.getItemId();
        Fragment fragment = null;
        if (id == R.id.nav_perfil) {
            fragment = new PerfilFragment();
        } else if (id == R.id.nav_estaciones) {
            fragment = new EstacionesFragment();
        } else if (id == R.id.nav_radar) {
            fragment = new RadarFragment();
        } else if (id == R.id.nav_pronostico) {
            fragment = new PronosticoFragment();
            Bundle args = new Bundle();
            args.putString("idpch", "7");
            fragment.setArguments(args);
        } else if (id == R.id.nav_consultas) {
            fragment = new ConsultaFragment();
        } else if(id==R.id.nav_nivelq) {
            fragment = new NivelQFragment();
        }else if(id==R.id.nav_viento) {
            fragment = new VientoFragment();
        } else if(id==R.id.nav_presion) {
            fragment = new PresionFragment();
        } else if(id==R.id.nav_temperatura) {
            fragment = new TemperaturaFragment();
        } else if(id==R.id.nav_ciclones) {
            fragment = new CiclonesFragment();
        }  else if (id == R.id.nav_logout) {
            Log.i("Eliseo","Saliendo");
            SharedPreferences sharedPref = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = sharedPref.edit();
            editor.putBoolean("logged", false);
            editor.commit();
            Intent intent = new Intent(getApplicationContext(), LoginActivity.class);
            startActivity(intent);
            finish();
        }

        if(fragment!=null) {
            FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();
            transaction.replace(R.id.mainFrame, fragment);
            transaction.addToBackStack(null);
            transaction.commit();
        }

        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
        drawer.closeDrawer(GravityCompat.START);
        return true;
    }

}
