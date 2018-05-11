<?php

 $con = mysql_connect('localhost:3306','root','mulky915');
 if (!$con)
 {
	die('连接MYSQL服务器失败： ' . mysql_error());
	 
 }
 
 mysql_select_db("account", $con);
 $getaccount=$_POST['username'];
 $num=mysql_num_rows(mysql_query("SELECT idaccount FROM accountdata WHERE idaccount ='$getaccount'"));
 
 if ($num>0) echo 0;
 else echo 1;
 
 mysql_close($con);

?>