<?php

 $con = mysql_connect('localhost:3306','root','mulky915');
 if (!$con)
 {
	die('连接MYSQL服务器失败： ' . mysql_error());
	 
 }
 
 mysql_select_db("account", $con);
 $getaccount=$_POST['username'];
 $password=$_POST['password'];
 $data=$_POST['data'];
 mysql_query("INSERT INTO accountdata(idaccount,password,data) VALUES('$getaccount','$password','$data')");
 mysql_close($con);

?>