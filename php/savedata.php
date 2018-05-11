<?php

 $con = mysql_connect('localhost:3306','root','mulky915');
 if (!$con)
 {
	die('连接MYSQL服务器失败： ' . mysql_error());
	 
 }
 
 mysql_select_db("account", $con);
 $getaccount=$_POST['Currentuser'];
 $getdata=$_POST['userdata'];
 mysql_query("UPDATE accountdata SET data='$getdata' WHERE idaccount ='$getaccount'");
 echo "保存成功";
 mysql_close($con);

?>