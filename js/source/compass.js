function mouseout()
{
document.getElementById("compass").style.backgroundImage="url(icons/compass/compass.png)";		
}



function onoverViewgoup()
{
document.getElementById("compass").style.backgroundImage="url(icons/compass/compassgoup.png)";	
}


function onoverViewgodown()
{
document.getElementById("compass").style.backgroundImage="url(icons/compass/compassgodown.png)";	
}

function onoverViewgoleft()
{
document.getElementById("compass").style.backgroundImage="url(icons/compass/compassgoleft.png)";	
}

function onoverViewgoright()
{
document.getElementById("compass").style.backgroundImage="url(icons/compass/compassgoright.png)";	
}

function onoverViewturnleft()
{
document.getElementById("compass").style.backgroundImage="url(icons/compass/compassturnleft.png)";	
}

function onoverViewturnright()
{
document.getElementById("compass").style.backgroundImage="url(icons/compass/compassturnright.png)";	
}




function onoverViewreset()
{
document.getElementById("compass").style.backgroundImage="url(icons/compass/compassreset.png)";	
}




function doViewgoup()
{
currentlyPressedKeys[87] = true;	
}

function undoViewgoup()
{
currentlyPressedKeys[87] = false;	
}

function doViewgodown()
{
currentlyPressedKeys[83] = true;		
}

function undoViewgodown()
{
currentlyPressedKeys[83] = false;			
}


function doViewgoleft()
{
currentlyPressedKeys[81] = true;	
}
function undoViewgoleft()
{
currentlyPressedKeys[81] = false;	
}


function doViewgoright()
{
currentlyPressedKeys[69] = true;
}

function undoViewgoright()
{
currentlyPressedKeys[69] = false;
}


function doViewturnleft()
{
	
if (viewstyle)

{
	

	
}

else 
{
viewonchange++;
changeYaw(yaw+20,viewonchange);
}
	
}
function undoViewturnleft()
{
	
}

function doViewturnright()
{
	
if (viewstyle)

{
	

	
}	
else
{
	
viewonchange++;
changeYaw(yaw-20,viewonchange);	
	

}
		
}


function undoViewturnright()
{
	
}
function doViewreset()
{
CharacterReset();
}
function doViewpull()
{
  viewheight-=0.5;
  changeViewHeight();
}
function doViewpush()
{
  viewheight+=0.5;
  changeViewHeight();
}

function Viewturn(yawadd)
{
closemap();
var r=Math.sqrt(xPos*xPos+zPos*zPos);
var a=RadToDeg(Math.atan((xPos)/(zPos)));


yaw+=yawadd;



if (zPos<0 && xPos<0)  
{
zPos=-r*Math.sin(degToRad(90-a-yawadd));
xPos=-r*Math.cos(degToRad(90-a-yawadd));	
}
else
{
if (zPos<0 && xPos>0)  
{
xPos=r*Math.sin(degToRad(-a-yawadd));
zPos=-r*Math.cos(degToRad(-a-yawadd));	
}
else
{
xPos=r*Math.sin(degToRad(a+yawadd));
zPos=r*Math.cos(degToRad(a+yawadd));		
}
}

}

var viewonchange=0;
function changeYaw(num,onchange)
{
if (viewonchange==onchange)
{
       if (yaw-num>0.2)	
		{
		Viewturn(-0.1);
		setTimeout(function(){changeYaw(num,onchange)},5);
			
		}
		
		if (num-yaw>0.2)	
		{
		Viewturn(0.1);
		setTimeout(function(){changeYaw(num,onchange)},5);
		}
}

	
}



function changeViewHeight()
{

if (yPos-viewheight>0.05)	
{
yPos-=0.005;
setTimeout(function(){changeViewHeight()},5);
	
}

if (viewheight-yPos>0.05)	
{
yPos+=0.005;
setTimeout(function(){changeViewHeight()},5);
	
}

	
}