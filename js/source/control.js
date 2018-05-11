/*
A 65 J 74 S 83 1 49 
B 66 K 75 T 84 2 50 
C 67 L 76 U 85 3 51 
D 68 M 77 V 86 4 52 
E 69 N 78 W 87 5 53 
F 70 O 79 X 88 6 54 
G 71 P 80 Y 89 7 55 
H 72 Q 81 Z 90 8 56 
I 73 R 82 0 48 9 57 
*/
   
   
 
			
    var lastMouseX = null;
    var lastMouseY = null;
    var selectedi = 0;
    var selectedj = 1;
	var leftkey   = 0;
    var rightkey   = 0;
   


    var currentlyPressedKeys = {};
    var CameraFollow = 0;
    //镜头跟踪，1为开启，0为关闭
    function handleKeyDown(event) {
		
		if (keyevent)// && viewstyle
		{
        currentlyPressedKeys[event.keyCode] = true;
		
		if (event.keyCode==84 && mouseDown[selectedi][selectedj] && leftkey)//按键T
		{
		    lagelapsedtozero();
			translateScale[selectedi][selectedj]=[translateScale[selectedi][selectedj][0]+0.1,translateScale[selectedi][selectedj][1]+0.1,translateScale[selectedi][selectedj][2]+0.1];
			
		}
		
		if (event.keyCode==71  && mouseDown[selectedi][selectedj] && leftkey)//按键G
		{
			lagelapsedtozero();
			translateScale[selectedi][selectedj]=[translateScale[selectedi][selectedj][0]-0.1,translateScale[selectedi][selectedj][1]-0.1,translateScale[selectedi][selectedj][2]-0.1];
			
		}
		
		
		
		
		
		
		
		if (event.keyCode==70)//按键F
		{
			viewlock();
		}else
		{
			//锁定界面
		}
		
		if (event.keyCode==80)//P
		{
			tapmode();
		}
		
		if (event.keyCode==79)//0
		{
			changetestmode();
		}
		
	if (testmode)
	 {
		 
		 if (event.keyCode==76)//l
		{
		 lighting=!lighting;
		}
		 
		 
		 
		if (event.keyCode==33)//按键pageup
		{
           pointlight = [pointlight[0],pointlight[1]+0.1, pointlight[2]]; 
		}else
		{
			
		}
		if (event.keyCode==34)//pagedown
		{
           pointlight = [pointlight[0],pointlight[1]-0.1, pointlight[2]];  
		}else
		{
			
		}
		if (event.keyCode==38)//up
		{
            pointlight = [pointlight[0]+0.1,pointlight[1], pointlight[2]];   
		}else
		{
			
		}
			if (event.keyCode==40)//down
		{
            pointlight = [pointlight[0]-0.1,pointlight[1], pointlight[2]]; 
		}else
		{
			
		}
			if (event.keyCode==37)//left
		{
            pointlight = [pointlight[0],pointlight[1], pointlight[2]+0.1];   
		}else
		{
			
		}
			if (event.keyCode==39)//right
		{
            pointlight = [pointlight[0],pointlight[1], pointlight[2]-0.1]; 
		}else
		{
			
		}
	   }
	}
   }


    function handleKeyUp(event) {
        currentlyPressedKeys[event.keyCode] = false;
    }
	

    function handleKeys() {
         if (currentlyPressedKeys[32]) {//空格
			 jumping = 1;
		 } else {
			 jumping = 0;
	     }

        if (currentlyPressedKeys[65] && viewstyle) {
            // Left cursor key or A
            yawRate = 0.1;
			if (currentlyPressedKeys[16]) yawRate +=0.1;
        } else if ( currentlyPressedKeys[68] && viewstyle) {
            // Right cursor key or D
            yawRate = -0.1;
			if (currentlyPressedKeys[16]) yawRate -=0.1;
        } else {
            yawRate = 0;
        }

        if (currentlyPressedKeys[87]) {
            // Up cursor key or W
            speed = 0.003;
			if (currentlyPressedKeys[16]) speed +=0.005;  //shift 加速
        } else if (currentlyPressedKeys[83]) {
            // Down cursor key
            speed = -0.003;
			if (currentlyPressedKeys[16]) speed -=0.005;  //shift 加速
        } else {
            speed = 0;
        }
		
		if (currentlyPressedKeys[81] || (!viewstyle && currentlyPressedKeys[65])) {
            // Q
            speed2 = 0.003;
			if (currentlyPressedKeys[16]) speed2 +=0.005; //shift 加速
        } else if (currentlyPressedKeys[69] || (!viewstyle && currentlyPressedKeys[68])) {
            //E
            speed2 = -0.003;
			if (currentlyPressedKeys[16]) speed2 -=0.005; //shift 加速
        } else {
            speed2 = 0;
        }
		

		

    }





 function handleMouseMove(event) {
	 
	 

  if(mouseDown[selectedi][selectedj] && leftkey)
		     {

		       lagelapsedtozero();
			   var newX = event.offsetX / gl.viewportWidth;
	           var newY = (gl.viewportHeight - event.offsetY) / gl.viewportHeight;
	           var deltaX = newX - lastMouseX;
	           var deltaY = newY - lastMouseY; 
	
	           var newTranslateMatrix = mat4.create();
	           mat4.identity(newTranslateMatrix);
	
	           mat4.translate(newTranslateMatrix, [deltaX * 5.5 * Math.cos(-degToRad(yaw)), deltaY * 4, deltaX * 5.5 * Math.sin(-degToRad(yaw))]);
               mat4.multiply(newTranslateMatrix, translateMatrix[selectedi][selectedj], translateMatrix[selectedi][selectedj]);
			   lastMouseX = newX;
	           lastMouseY = newY;
			   
		     }			
	     


 if (CameraFollow){
        var CFnewX = event.clientX;
        var CFnewY = event.clientY;

        var CFdeltaX = CFnewX - document.body.clientWidth/2;  
		var CFdeltaY = CFnewY - document.body.clientHeight/2;
		//与中心坐标进行对比
		
	  if (Math.abs(CFdeltaX)>200)
	  {
		  
		  //判断鼠标是否在可动范围
	       var temp;
		   
		   	if (CFdeltaX>0) {
				temp=(CFdeltaX-200)/10000;
				}
				else 
		        {
				temp=(CFdeltaX+200)/10000;
			    }
		 //速度设置
		   
	       var maxspeed=0.1;
           if (Math.abs(temp)>maxspeed){
		        if (temp>0) {
				yawRate2=-maxspeed;
				}
				else 
		        {
				yawRate2=maxspeed;	
			    }
		
		   }
		   else {
		
           yawRate2 = -temp;
		   }
          //最大速度限制
	  }else {
           yawRate2 = 0;
      }
   
	
      if (Math.abs(CFdeltaY)>200)
	  {
           var temp;
		      
		   	if (CFdeltaY>0) {
				temp=(CFdeltaY-200)/10000;
				}
				else 
		        {
				temp=(CFdeltaY+200)/10000;
			    }
				
				
	       var maxspeed=0.1;
           if (Math.abs(temp)>maxspeed){
		        if (temp>0) {
				pitchRate=-maxspeed;
				}
				else 
		        {
				pitchRate=maxspeed;	
			    }
		
		   }
		   else {
           pitchRate = -temp;
		   }
          
        

	  }else {
           pitchRate = 0;
      }
	}
 }
 

 
  

 function handleMouseDown(event)
{	
finishroomname();
if (!mouseDown[selectedi][selectedj] ||(ControlMode==1) || (event.button == 2)){	   
	lastMouseX = event.offsetX / gl.viewportWidth;
	lastMouseY = (gl.viewportHeight - event.offsetY) / gl.viewportHeight;
	
	
	//$('#button').css('background-image', 'url(icons/arrow-right.png)');
	//HideAll();
	if (event.button == 2)
	{
     mouseDown[selectedi][selectedj] = false;
     leftkey = 0;
    } 
	ThingsOnClick(event);
	ThingsOnRightClick(event);	
	
	
	
		
	}
	else
	{
		
	 mouseDown[selectedi][selectedj] = false;
     leftkey = 0;	
	}
}


function handleMouseUp(event)
{
if (ControlMode==1){
                     mouseDown[selectedi][selectedj] = false;
                     leftkey = 0;
                   }
}


function handleMouseWheel(event)
{	

  if(mouseDown[selectedi][selectedj] && leftkey){
	                              lagelapsedtozero();	
				                  var direct = 0;
                                  if(event.wheelDelta) 
	                              {
	 	                           direct = event.wheelDelta > 0 ? 1 : -1;
	                              } 
	                              else if(event.detail) 
	                              {
		                           direct = event.detail < 0 ? 1 : -1;
			                      }
			                      var newTranslateMatrix = mat4.create();
	                              mat4.identity(newTranslateMatrix);
			                      mat4.translate(newTranslateMatrix, [-0.08 * direct * Math.sin(degToRad(yaw)), 0, -0.08 * direct * Math.cos(degToRad(yaw))]);		
		                          mat4.multiply(newTranslateMatrix, translateMatrix[selectedi][selectedj], translateMatrix[selectedi][selectedj]);
			 
			                      
		                         }
		   
}


        


function handleContextMenu(event)
{
	event.preventDefault();
}
