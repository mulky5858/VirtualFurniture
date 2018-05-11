	var lastTime = 0;
    // Used to make us "jog" up and down as we move forward.
    var joggingAngle = 0;
    var lastXPos = 0;
    var lastZPos = 0;
    //var flagPos = false;
    var change = Array();
	var onloadTVtexture =Array();
    var duration=0;
					
	for(var i = 1; i <= numofTVchannel; i++)
	        {
				change[i]=1;
			}
    var sumelapsed=0;
    function animate() {
		
        var timeNow = new Date().getTime();
		
	
        if (lastTime != 0) {
            var elapsed = timeNow - lastTime;
           
            if (speed != 0) {
				lastXPos = xPos;
			    lastZPos = zPos;
				
                xPos -= Math.sin(degToRad(yaw)) * speed * 15;
                zPos -= Math.cos(degToRad(yaw)) * speed * 15;
				
                cameraCD();

                if (viewstyle)
				{
                joggingAngle += 15 * 0.6; // 0.6 "fiddle factor" - makes it feel more realistic :-)
                yPos = Math.sin(degToRad(joggingAngle)) / 20 + viewheight;
				}
            }
            
			
			if (speed2 != 0) {
				
				lastXPos = xPos;
			    lastZPos = zPos;
				
                xPos -= Math.sin(degToRad(90+yaw)) * speed2 * 15;
                zPos -= Math.cos(degToRad(90+yaw)) * speed2 * 15;
				
			    cameraCD();
				
                if (viewstyle)
				{
                joggingAngle += 15 * 0.6; // 0.6 "fiddle factor" - makes it feel more realistic :-)
                yPos = Math.sin(degToRad(joggingAngle)) / 20 + viewheight;
				}
            }
			
            yaw += yawRate*15+yawRate2*10;
			
            if (pitch+pitchRate * 15<=75 && pitch+pitchRate * 15>=-75 ){
		    pitch += pitchRate * 15;
			
			if (jumping && viewstyle) {
				
				joggingAngle += 15 * 0.6; // 0.6 "fiddle factor" - makes it feel more realistic :-)
                yPos = Math.sin(degToRad(joggingAngle)) / 20 + viewheight;
				
			}
			
	        
			
		    }
			
			for(var i = 1; i <= numofTVchannel; i++)
	        {
					if(change[i] > (PicturesOfChannel[i]-0.5))
					{
					change[i] = 0;
					
					
					}
			}
			if (sumelapsed>=(1000/8))
			{
			for(var i = 1; i <= numofTVchannel; i++)
	        {	
					
			change[i] += 1;
			refreshTVtexture(i);
			}
			sumelapsed = 0;
                    
			}
			else
			{
			sumelapsed+=elapsed;	
			}
			
			
			
			
			duration+=elapsed;
			
			if (document.getElementById("promptAdd").style.display=='block')
			{			
			document.getElementById("promptAdd").style.top = 140+10*Math.sin(degToRad(duration/1000*180));
			}
			
			
			
			
			showplayer();
			
			logonareamove();
			
        }
        lastTime = timeNow;
    }
  