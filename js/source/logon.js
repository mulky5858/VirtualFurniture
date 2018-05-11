var Currentuser="";

function AJAXRequest()
{
  document.getElementById("logonerror").style.color='#000';	
  document.getElementById('logonerror').textContent="正在查询...";
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;
  
  if (username!=null&&username!=''&&password!=null&&password!='')
  
  {
  
  $.post('/php/logon.php', {username:username,password:password},function(data)
  {
	  
	  var str;
	  switch(parseInt(data))
      {	
	  case 1:
	  document.getElementById("logonerror").style.color='#000';
	  str="欢迎回来，"+username+"！";
	  Currentuser=username;
      document.getElementById("logondefault").style.display='none';
	  document.getElementById("onlogon").style.display='block';
	  break;
	  case 0:
	  str="用户名或密码不能为空";
	  document.getElementById("logonerror").style.color='#F00';
	  break;
	  case -1:
	  str="用户名或密码错误";
	  document.getElementById("logonerror").style.color='#F00';
	  break;
	  default:
	  str="未知错误";
	  break;  
	  }
	  document.getElementById('logonerror').textContent=str; 
  });
  
  
  }
  else 
  {
	document.getElementById('logonerror').textContent="用户名或密码不能为空";
	document.getElementById("logonerror").style.color='#F00';
  }



 	
}

function logonareaclear()
{
document.getElementById('username').value="";	
document.getElementById('password').value="";	
document.getElementById("logonerror").style.color='#000';
document.getElementById('logonerror').textContent = "请输入用户名和密码";
Currentuser="";
}

var  logonarealeft=-250;
var  logonareamouseon=-1;
function logonareaover()
{
	
 logonareamouseon=1;
 keyevent=0;
 $('input[name=username]').removeAttr("readonly");	
 $('input[name=password]').removeAttr("readonly");	
}

function logonareaout()
{
 logonareamouseon=-1;	
 if (document.getElementById("viewload").style.display=='none') keyevent=1;
 $('input[name=username]').attr("readonly","readonly");	
 $('input[name=password]').attr("readonly","readonly")
}

function logonareamove()
{

var left=logonarealeft+logonareamouseon*10;
if (left>=-255&&left<=5) 
{
document.getElementById("logonarea").style.left=left;
logonarealeft=left;
}
		
}


function userexit()
{
document.getElementById("logondefault").style.display='block';
document.getElementById("onlogon").style.display='none';
logonareaclear();
inputstream("input/empty.txt");	
}


function useronloadroom()
{
viewclose();
$.post('/php/getdata.php', {Currentuser:Currentuser},function(data)
{
if (data!="empty")
{	
initialize();
doLoadObj(data);
}
else 
{
	alert("没有保存的记录");
	viewopen();
}
})
}

function usersaveroom()
{
viewclose();
$.post('/php/savedata.php', {Currentuser:Currentuser,userdata:outputstreamdata()},function(data)
{
alert(data);
viewopen();	
})	

}

function usersaveandexit()
{
viewclose();
$.post('/php/savedata.php', {Currentuser:Currentuser,userdata:outputstreamdata()},function(data)
{
alert(data);
userexit();	
viewopen();	
})	


}