var windowCoordinate = Array();
var windowBox = Array();

for(var i = 0; i <= MaxNumberOfObjects; i++)
{
	
windowBox[i] = Array();	
	
	
	
}





//获取每个物体在屏幕中的大概位置
function picking()
{	
	for(var i = 0; i <= MaxNumberOfObjects; i++)
	  for(var j = 1; j <= MaxNumberOfObjects; j++)
			{
			if (flagThings[i][j]){	
				
				        windowBox[i][j] = Array();	
						for(var k = 0; k < 8; k++)
						{
						
						 var m_out = Array();
						 var p_out = Array();
						 mat4.multiplyVec4(mvThings[i][j], box[i][k], m_out);
				
						 mat4.multiplyVec4(pMatrix, m_out, p_out);
						
						 p_out[0] /= p_out[3];
						 p_out[1] /= p_out[3];
						 p_out[2] /= p_out[3];
					
						 windowCoordinate[k] = Array();
						 windowCoordinate[k][0] = (1 + p_out[0]) * 1 / 2;
						 windowCoordinate[k][1] = (1 + p_out[1]) * 1 / 2;
						 windowCoordinate[k][2] = (1 + p_out[2]) / 2;
					
						 if(k == 0)
						{
						 windowBox[i][j][0] = windowCoordinate[k][0];
						 windowBox[i][j][1] = windowCoordinate[k][0];
						 windowBox[i][j][2] = windowCoordinate[k][1];
						 windowBox[i][j][3] = windowCoordinate[k][1];
						}
					
						if(windowCoordinate[k][0]<windowBox[i][j][0] && windowCoordinate[k][0]>0)
						   windowBox[i][j][0]=windowCoordinate[k][0];
						if(windowCoordinate[k][0]>windowBox[i][j][1] && windowCoordinate[k][0]<1)
						   windowBox[i][j][1]=windowCoordinate[k][0];
						if(windowCoordinate[k][1]<windowBox[i][j][2] && windowCoordinate[k][1]>0)
						   windowBox[i][j][2]=windowCoordinate[k][1];
						if(windowCoordinate[k][1]>windowBox[i][j][3] && windowCoordinate[k][1]<1)
						   windowBox[i][j][3]=windowCoordinate[k][1];
						
						
						
						
						
						
						
						}
				
			       }
			}

}



function  ThingsOnClick(event)
{
	
var choosesomethings=-1;
var somethingschoosedi=Array();  
var somethingschoosedj=Array();


picking(); 	
document.getElementById("test2").textContent = "未点选物品。";
downa:for(var i = 0; i <= MaxNumberOfObjects; i++)
		 
    downb:for(var j = 1; j <= MaxNumberOfObjects; j++)
		   {
			if (flagThings[i][j])
			{	  
			                
							if(lastMouseX >= (windowBox[i][j][0]) && lastMouseX <= (windowBox[i][j][1])
							&& lastMouseY >= (windowBox[i][j][2]) && lastMouseY <= (windowBox[i][j][3]))
							{	
							

							   if (showItemSelectionBox) ItemSelectionBox(i,j);				
							   
							   var x=coordinate(i,j)[0];
							   //var y=coordinate(i,j)[1];
							   var z=coordinate(i,j)[2];
							   
							   var Simpleyaw;
							   var tempyaw=yaw%360;						   
							   if (tempyaw>=180) tempyaw=(tempyaw-360);
							   if (tempyaw<=-180) tempyaw=(tempyaw+360);
							   Simpleyaw=90+tempyaw;
							  				   
							   var angle=-RadToDeg(Math.atan((zPos-z)/(xPos-x)));		
							   if (xPos-x>=0)
							   {
								 angle+=180;
								
							   }
							   if ((angle-45)<=Simpleyaw && (Simpleyaw-45)<=angle)
							   {
								choosesomethings+=1;
		                        somethingschoosedi[choosesomethings]=i;
								somethingschoosedj[choosesomethings]=j;
							   }
							  	
							}
			
			
			
			}
			
		   
		  }	
		  
		  
if (choosesomethings!=-1)
{
var closesti = somethingschoosedi[0];
var closestj = somethingschoosedj[0];
var closestdistance=10000;
for(var i=0;i<=choosesomethings;i++)
{
var x=coordinate(somethingschoosedi[i],[somethingschoosedj[i]])[0];
var y=coordinate(somethingschoosedi[i],[somethingschoosedj[i]])[1];	
var z=coordinate(somethingschoosedi[i],[somethingschoosedj[i]])[2];
	
var distance=Hypotenuse(x-xPos,z-zPos);


if (distance<closestdistance)
{
closesti = somethingschoosedi[i];
closestj = somethingschoosedj[i];
closestdistance=distance;
}



}


selectedi = closesti;
selectedj = closestj
 
mouseDown[selectedi][selectedj] = true;
if(event.button == 0) {
	                    leftkey = 1;
						oldi=selectedi;
			            oldj=selectedj;
			            old=coordinate(selectedi,selectedj);
			            canceltype = 1;
						CancelPush();
                     }
lagelapsedtozero();							
if (testmode) document.getElementById("test2").textContent = "点选的物品为: "+clicked(selectedi)+"，物品序号为： "+selectedi+" ，该种类物品编号： "+selectedj+" 。";
else document.getElementById("test2").textContent = "点选的物品为: "+clicked(selectedi)+" 。";

	
	
	
}

	
	
	
	

								
								
	
	
}