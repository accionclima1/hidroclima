<?php
include("phplibdb.php");
date_default_timezone_set('America/El_Salvador');

$db = new db;
$db->connect("hidroclimadb");

# Captura de datos y calculo de caudal bruto

$pronostico24 = file_get_contents("http://163.172.134.91/lluvia/lluvia24h.txt");
$pronostico24 = explode(",",str_replace("\n",",",$pronostico24));
//print_r($pronostico24);
//exit;
$pronostico48 = file_get_contents("http://163.172.134.91/lluvia/lluvia48h.txt");
$pronostico48 = explode(",",str_replace("\n",",",$pronostico48));

$pronostico72 =  file_get_contents("http://163.172.134.91/lluvia/lluvia72h.txt");
$pronostico72 = explode(",",str_replace("\n",",",$pronostico72));

$query = "select * from pchs order by idpch";
$db->exec($query);

for($i=0;$i<$db->numrows();$i++)
{
	$pchs[] = $db->fobject();
	$db->moveNext();
}

$estaciones[0][0] = '1';
$estaciones[0][1] = 4;
$estaciones[1][0] = '2';
$estaciones[1][1] = 9;
$estaciones[2][0] = '3';
$estaciones[2][1] = 14;
$estaciones[3][0] = '4';
$estaciones[3][1] = 19;
$estaciones[4][0] = '5';
$estaciones[4][1] = 24;
$estaciones[5][0] = '6';
$estaciones[5][1] = 29;
$estaciones[6][0] = '7';
$estaciones[6][1] = 34;
$estaciones[7][0] = '8';
$estaciones[7][1] = 39;
$estaciones[8][0] = '9';
$estaciones[8][1] = 44;
$estaciones[9][0] = '10';
$estaciones[9][1] = 49;
$estaciones[10][0] = '11';
$estaciones[10][1] = 54;
$estaciones[11][0] = '12';
$estaciones[11][1] = 59;
$estaciones[12][0] = '13';
$estaciones[12][1] = 64;

$date = date('Y-m-d');
$mes = date('n');

/*$pronostico24[4] = 35.49;
$pronostico24[9] = 35.49;
$pronostico24[14] = 35.49;
$pronostico24[19] = 35.49;
$pronostico24[24] = 35.49;
$pronostico24[29] = 35.49;
$pronostico24[34] = 35.49;
$pronostico24[39] = 35.49;
$pronostico24[44] = 35.49;
$pronostico24[49] = 35.49;
$pronostico24[54] = 35.49;
$pronostico24[59] = 35.49;
$pronostico24[64] = 35.49;

$pronostico48[4] = 48.87;
$pronostico48[9] = 48.87;
$pronostico48[14] = 48.87;
$pronostico48[19] = 48.87;
$pronostico48[24] = 48.87;
$pronostico48[29] = 48.87;
$pronostico48[34] = 48.87;
$pronostico48[39] = 48.87;
$pronostico48[44] = 48.87;
$pronostico48[49] = 48.87;
$pronostico48[54] = 48.87;
$pronostico48[59] = 48.87;
$pronostico48[64] = 48.87;

$pronostico72[4] = 5.05;
$pronostico72[9] = 5.05;
$pronostico72[14] = 5.05;
$pronostico72[19] = 5.05;
$pronostico72[24] = 5.05;
$pronostico72[29] = 5.05;
$pronostico72[34] = 5.05;
$pronostico72[39] = 5.05;
$pronostico72[44] = 5.05;
$pronostico72[49] = 5.05;
$pronostico72[54] = 5.05;
$pronostico72[59] = 5.05;
$pronostico72[64] = 5.05;

$date = '2018-08-08';
$mes = 8;*/
//exit;
for($i=0;$i<count($pchs);$i++)
{
	for($j=0;$j<count($estaciones);$j++)
	{	
		$select = "select * from pch_area_estacion where idpch = " . $pchs[$i]->idpch . " and idestacion = '" . $estaciones[$j][0] . "'";
    $db->exec($select);
    $data = $db->fobject();
    
    #pronostico 24h
    $insert = "insert into pchs_pronostico (idpch,idestacion,fecha,nejecucion,variable,tiempo,valor) values ('" . $pchs[$i]->idpch . "','" . $estaciones[$j][0] . "','" . $date . "',1,'pronostico','24H'," . round(trim($pronostico24[$estaciones[$j][1]]),2) . ")";
		$db->exec($insert);
    
    #caudal bruto 24h    
    $insert = "insert into pchs_pronostico (idpch,idestacion,fecha,nejecucion,variable,tiempo,valor) values ('" . $pchs[$i]->idpch . "','" . $estaciones[$j][0] . "','" . $date . "',1,'qbruto','24H'," . ((trim($pronostico24[$estaciones[$j][1]]))/86.4) * $data->area_influencia . ")";
    $db->exec($insert);
    
    #precipitacion media
    $insert = "insert into pchs_pronostico (idpch,idestacion,fecha,nejecucion,variable,tiempo,valor) values ('" . $pchs[$i]->idpch . "','" . $estaciones[$j][0] . "','" . $date . "',1,'ppmedia','24H'," . ((trim($pronostico24[$estaciones[$j][1]]))) * ($data->porcentaje) . ")";
    $db->exec($insert);
    
    #pronostico 48h
 		$insert = "insert into pchs_pronostico (idpch,idestacion,fecha,nejecucion,variable,tiempo,valor) values ('" . $pchs[$i]->idpch . "','" . $estaciones[$j][0] . "','" . $date . "',1,'pronostico','48H'," . round(trim($pronostico48[$estaciones[$j][1]]),2) . ")";
    $db->exec($insert);

    #caudal bruto 48h    
    $insert = "insert into pchs_pronostico (idpch,idestacion,fecha,nejecucion,variable,tiempo,valor) values ('" . $pchs[$i]->idpch . "','" . $estaciones[$j][0] . "','" . $date . "',1,'qbruto','48H'," . ((trim($pronostico48[$estaciones[$j][1]]))/86.4) * $data->area_influencia . ")";
    $db->exec($insert);
    
    #precipitacion media
    $insert = "insert into pchs_pronostico (idpch,idestacion,fecha,nejecucion,variable,tiempo,valor) values ('" . $pchs[$i]->idpch . "','" . $estaciones[$j][0] . "','" . $date . "',1,'ppmedia','48H'," . ((trim($pronostico48[$estaciones[$j][1]]))) * ($data->porcentaje) . ")";
    $db->exec($insert);
    
    #pronostico 72h
    $insert = "insert into pchs_pronostico (idpch,idestacion,fecha,nejecucion,variable,tiempo,valor) values ('" . $pchs[$i]->idpch . "','" . $estaciones[$j][0] . "','" . $date . "',1,'pronostico','72H'," . round(trim($pronostico72[$estaciones[$j][1]]),2) . ")";
    $db->exec($insert);
    
    #caudal bruto 72h
    $insert = "insert into pchs_pronostico (idpch,idestacion,fecha,nejecucion,variable,tiempo,valor) values ('" . $pchs[$i]->idpch . "','" . $estaciones[$j][0] . "','" . $date . "',1,'qbruto','72H'," . ((trim($pronostico72[$estaciones[$j][1]]))/86.4) * $data->area_influencia . ")";
    $db->exec($insert);
    
    #precipitacion media
    $insert = "insert into pchs_pronostico (idpch,idestacion,fecha,nejecucion,variable,tiempo,valor) values ('" . $pchs[$i]->idpch . "','" . $estaciones[$j][0] . "','" . $date . "',1,'ppmedia','72H'," . ((trim($pronostico72[$estaciones[$j][1]]))) * ($data->porcentaje) . ")";
    $db->exec($insert);
	}
}

# Calculos
$db2 = new db;
$db2->connect("hidroclimadb");

$sql = "select a.idpch, a.fecha, a.nejecucion, a.tiempo, b.qecologico, b.qdiseno, b.area_influencia, b.altura_neta,
        b.factor, b.kmaquinaria,  sum(case when variable = 'qbruto' then a.valor else 0 end) as total, 
        sum(case when variable = 'ppmedia' then a.valor else 0 end) as total_ppmedia 
        from pchs_pronostico a inner join pchs b
        on a.idpch = b.idpch
        where a.fecha = '" . $date . "'
        group by a.idpch, a.fecha, a.nejecucion, a.tiempo, b.qecologico, b.qdiseno, b.area_influencia, b.altura_neta,b.factor,b.kmaquinaria
        order by a.idpch, a.tiempo";
        
$db->exec($sql);

for($i=0;$i<$db->numrows();$i++)
{
  $data = $db->fobject();
  
  $select = "select * from parametros_escorrentia_q where parametro = 'coeficiente' and mes = '" . $mes . "' and idpch = " . $data->idpch;
  $db2->exec($select);
  $d = $db2->fobject();
  $coeficiente = $d->valor;
  echo "Coeficiente " . $coeficiente . "\n";
  
  $select = "select * from parametros_escorrentia_q where parametro = 'qminimo' and mes = '" . $mes . "' and idpch = " . $data->idpch;
  $db2->exec($select);
  $d = $db2->fobject();
  $qminimo = $d->valor;
  echo "Qminimo " . $qminimo . "\n";
  
  $select = "select * from parametros_escorrentia_q where parametro = 'qmaximo' and mes = '" . $mes . "' and idpch = " . $data->idpch;
  $db2->exec($select);
  $d = $db2->fobject();
  $qmaximo = $d->valor;
  echo "Qmaximo " . $qmaximo . "\n";
  
  $qentrada = ($coeficiente / 100) * $data->total;

  if($qentrada < $qminimo) $qentrada = $qminimo;
  
  if($qentrada > $qmaximo) $qentrada = $qmaximo;
  
  if(($qentrada-$data->qecologico)>$data->qdiseno) $qcaptacion = $data->qdiseno; else $qcaptacion = $qentrada-$data->qecologico;
  
  $qexcedente = $qentrada - $data->qecologico - $qcaptacion;
  
  $qturbina = $qcaptacion;
  
  $qincremental = round(($qentrada/$data->area_influencia)*$data->factor,3);
  
  $qtramo = $data->qecologico + $qexcedente + $qincremental;
  
  $qsalida = $qtramo + $qturbina;
  
  $potencia = round(9.81 * $qturbina * $data->altura_neta * $data->kmaquinaria,0);
  
  $insert = "insert into pchs_caudal_potencia (idpch,
                                              fecha,
                                              tiempo,
                                              ppmedia,
                                              qentrada,
                                              qexcedente,
                                              qcaptacion,
                                              qincremental,
                                              qtramo,
                                              qturbina,
                                              qsalida,
                                              potencia) values (" . $data->idpch . ",'" . $date . "','" . $data->tiempo . "',
                                              " . round($data->total_ppmedia,2) . "," . round($qentrada,2) . "," . round($qexcedente,2) . ",
                                                " . round($qcaptacion,2) . "," . $qincremental . "," . round($qtramo,2) . ",
                                                " . round($qturbina,2) . "," . round($qsalida,2) . "," . $potencia . ")";
  $db2->exec($insert);
  
  $db->moveNext();
}

$db->close();
#$db2->close();
?>
