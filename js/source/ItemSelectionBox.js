function ItemSelectionBox(i,j)
{
var newdiv=document.createElement("div"); 
newdiv.style.position="absolute";
newdiv.style.left=windowBox[i][j][0]*750+document.body.clientWidth/2-500;
newdiv.style.top=(1-windowBox[i][j][3])*450+150;
newdiv.style.width=(windowBox[i][j][1]-windowBox[i][j][0])*750;
newdiv.style.height=(windowBox[i][j][3]-windowBox[i][j][2])*450;
newdiv.style.backgroundColor="#000"; 						
newdiv.onclick=function() {this.style.display="none";}				
document.body.appendChild(newdiv); 	
	
	
}