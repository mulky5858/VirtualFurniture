<?php

 $con = mysql_connect('localhost:3306','root','mulky915');
 if (!$con)
 {
	die('连接MYSQL服务器失败： ' . mysql_error());
	 
 }
 
 
 mysql_select_db("account", $con);
 $getaccount=$_POST['username'];
 $getpassword=$_POST['password'];
 
 if ($getaccount!=null&&$getaccount!=''&&$getpassword!=null&&$getpassword!='')
 {
	$result = mysql_query("SELECT * FROM accountdata WHERE idaccount ='$getaccount' and password= '$getpassword'");
	$num = mysql_num_rows($result); 
	if ($num!=0)
	{
	 echo 1;
	 
	
	
	
	
		
	}
    else
	{
	 echo -1;

	}
    


 }
 else
 {
  echo 0;
 }
 


 
  mysql_close($con);

?>