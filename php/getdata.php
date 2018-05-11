<?php

 $con = mysql_connect('localhost:3306','root','mulky915');
 if (!$con)
 {
	die('连接MYSQL服务器失败： ' . mysql_error());
	 
 }
 
 mysql_select_db("account", $con);
 $getaccount=$_POST['Currentuser'];
 $result = mysql_query("SELECT data FROM accountdata WHERE idaccount ='$getaccount'");
 while ($row = mysql_fetch_array($result)) {
 echo $row['data'];
 }
 mysql_close($con);

?>