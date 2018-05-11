var mapleft=0;
var maptop=180;
var mapclosed=1;
var mapdiv=Array();
function initmap()
{
mapleft=document.body.clientWidth/2-500+35;
for (var i=0;i<=19;i++)
{
  mapdiv[i]=Array();	
  for (var j=0;j<=19;j++)
  {
	var newdiv=document.createElement("div"); 
	
	newdiv.setAttribute("id","map_"+i+"_"+j);
	newdiv.style.position="absolute";
	newdiv.style.width=10;
	newdiv.style.height=10;
	newdiv.style.cursor="pointer";
	mapdiv[i][j]=0;
	document.body.appendChild(newdiv); 
	document.body.insertBefore(newdiv,document.getElementById("logonarea"));
	document.getElementById("map_"+i+"_"+j).style.display="none"; 
	document.getElementById("map_"+i+"_"+j).style.backgroundColor="#000"; 
	document.getElementById("map_"+i+"_"+j).onclick=function()
	{
	 maponclick(this);
		
	}
	
  }
	
}

var player=document.createElement("div"); 
player.setAttribute("id","player");	
player.style.position="absolute";
player.style.width=25;
player.style.height=25;
document.body.appendChild(player); 
document.getElementById("player").style.display="none"; 
document.getElementById("player").style.backgroundImage="url(icons/player.png)";
}

function refreshmap()
{
document.getElementById("map").style.left=mapleft-20;
for (var i=0;i<=19;i++)
  for (var j=0;j<=19;j++)
  {
	document.getElementById("map_"+i+"_"+j).style.left=i*10+mapleft;  
	document.getElementById("map_"+i+"_"+j).style.top=j*10+maptop+5;    
	  
	  
  }
	
	
}

function readmap(text)
{
closemap();	
for (var i=0;i<=19;i++)
  for (var j=0;j<=19;j++)
  {
	 mapdiv[i][j]=0;
	 document.getElementById("map_"+i+"_"+j).style.backgroundColor="#000";  

  }


    var lines = text.split("\n");
	for (var lineIndex in lines) {
	
	var line = lines[lineIndex];
	
	if (line[0] != "@") continue;	
	

	var array = line.split(" ");
	mapdiv[parseInt(array[1])][parseInt(array[2])]=1;
	document.getElementById("map_"+parseInt(array[1])+"_"+parseInt(array[2])).style.backgroundColor="#FFF";  
	
	

	
	}




	
}


function displaymap()
{
HideAll();
if (mapclosed) openmap();
		  
else closemap();


}

function openmap()
{
document.getElementById("map").style.display='block';	
for (var i=0;i<=19;i++)
	for (var j=0;j<=19;j++)
	{
	document.getElementById("map_"+i+"_"+j).style.display='block';
	
	}
	mapclosed=0;	
	document.getElementById("player").style.display="block"; 
}



function closemap()
{
document.getElementById("map").style.display='none';	
for (var i=0;i<=19;i++)
	for (var j=0;j<=19;j++)
		{
		 document.getElementById("map_"+i+"_"+j).style.display='none';
	
		}	

document.getElementById("player").style.display="none"; 

mapclosed=1;		
	
}

function maponclick(obj)
{
var temp=obj.id.split("_")
var tempi=parseInt(temp[1]);
var tempj=parseInt(temp[2]);

if (tempi==0 || tempi==19 || tempj==0 || tempj==19)
{
alert("此操作不被允许。外面是无尽的虚空，你还是别出去为好~");
}
else 
{
if (!mapdiv[tempi][tempj])  
{
	mapdiv[tempi][tempj]=1;
	document.getElementById("map_"+tempi+"_"+tempj).style.backgroundColor="#FFF"; 
}
else 
{
	mapdiv[tempi][tempj]=0;
	document.getElementById("map_"+tempi+"_"+tempj).style.backgroundColor="#000"; 
}
	
}




}



function showplayer()
{
document.getElementById("player").style.left=mapleft-12.5+10*(xPos+10); 	
document.getElementById("player").style.top=maptop-12.5+10*(zPos+10); 	
divRotate("player",-yaw);
}