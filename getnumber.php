<?php
error_reporting(0);

#########################################################################
#		LDAP Settings
########################################################################
$ldap_host = "ldap.example.com";
$username="user@example.com";
$password="password";
$ldap_dn = "ou=divisions,dc=example,dc=com";

#########################################################################



$ldap = ldap_connect($ldap_host) or die("Could not connect to LDAP");
@ldap_bind($ldap, $username , $password) or die("Could not bind to LDAP");




$partialNumber =strtolower($_POST['partialNumber']);
if ( (strlen($partialNumber) < 3) || ($partialNumber == "and") || ($partialNumber == "the")  || ($partialNumber == "her") || ($partialNumber == "man") || ($partialNumber == "she")) {} else {


$results = ldap_search($ldap,$ldap_dn, "(&(objectclass=user)(objectcategory=person)(DisplayName=*". $partialNumber ."*))");
$entries = ldap_get_entries($ldap, $results);

$ran = array("1","2","3");

###################
#THESE ARE THE COLORS FOR THE BLOCKS
###################
$ran2 = array("#878988","#cc1921","#000000");
$comp = array("#a5a7a6","#991921","#3d3d3d");


for ($i = 0; $i < $entries["count"]; $i++) {
  $name = $entries[$i]["cn"][0];
  $givenname = $entries[$i]["givenname"][0];
  $sn = $entries[$i]["sn"][0];
  $email= $entries[$i]["mail"][0];
  $department= $entries[$i]["department"][0];
  $title= $entries[$i]["title"][0];
  $ipphone= $entries[$i]["ipphone"][0];


  $randomnum = array_rand($ran,1);
  $col = array_rand($ran2,1);
  $colour = $ran2[$col];
  $compcol = $comp[$col];
  $tiletype = $ran[$randomnum];
  $delay = rand(4000,4500);
  
  if ($tiletype == "1") {

		$string .=  "<div class='tiles' style='vertical-align:middle'><div class='live-tile' data-speed='750' data-delay='".$delay."'>";
		$string .=  "<div style='background-color:".$colour."';><span class='tile-title'><font size=2.5>".$department."</font><br>".$title."<br>" .$email."<br><br><br>".$ipphone."</span>".utf8_encode($givenname)."<br>".utf8_encode($sn) ."</div>";
		$string .=  "<div style='background-color:".$compcol."';><span class='tile-title'>".utf8_encode($name)."</span>Extension:<br>".$ipphone."</div></div></div><script type='text/javascript'>$('.live-tile, .flip-list').not('.exclude').liveTile();</script>";
	}	

	 if ($tiletype == "2") {

                $string .=  "<div class='tiles'><div class='live-tile' data-mode='flip' data-delay='".$delay."'>";
                $string .=  "<div style='background-color:".$colour."';><span class='tile-title'><font size=2.5>".$department."</font><br>".$title."<br>".$email."<br><br><br>".$ipphone."</span>".utf8_encode($givenname) ."<br>" . utf8_encode($sn)."</div>";
                $string .=  "<div style='background-color:".$compcol."';><span class='tile-title'>".utf8_encode($name)."</span>Extension:<br>".$ipphone."</div></div></div><script type='text/javascript'>$('.live-tile, .flip-list').not('.exclude').liveTile();</script>";
	}	
	 if ($tiletype == "3") {

                $string .=  "<div class='tiles'><div class='live-tile' data-mode='carousel' data-direction='horizontal' data-delay='".$delay."'>";
                $string .=  "<div style='background-color:".$colour."';><span class='tile-title'><font size=2.5>".$department."</font><br>".$title."<br>".$email."<br><br><br>".$ipphone."</span>".utf8_encode($givenname) ."<br>". utf8_encode($sn)."</div>";
                $string .=  "<div style='background-color:".$compcol."');><span class='tile-title'>".utf8_encode($name)."</span>Extension:<br>".$ipphone."</div></div></div><script type='text/javascript'>$('.live-tile, .flip-list').not('.exclude').liveTile();</script>";
	}


		}
	}

echo $string;

?>
