//0 为没有操作
//1 为移动模型
//2 改变贴图
//3 为旋转
//4 为删除
//5 为撤销
var canceltype = 0;
var old;
var oldi;
var oldj;
var CancelStack=[];
function cancel()
{
if (CancelStack.length == 0) 
{
            alert("没有可撤销的操作。");
}
else
{
var PresentCancel = CancelStack.pop();	
	
var Thecanceltype=PresentCancel[0];	
var cancelold=PresentCancel[1];
var canceloldi=PresentCancel[2];
var canceloldj=PresentCancel[3];	
	
	
	
switch(Thecanceltype)	
{
 case 0:
 break;
 case 1: 
 translateMatrix[canceloldi][canceloldj] = mat4.create();
 mat4.identity(translateMatrix[canceloldi][canceloldj]);
 translateVector[canceloldi][canceloldj]=cancelold;
 canceltype = 0;
 break;
 case 2:
 translateTexture[canceloldi][canceloldj]= cancelold;
 canceltype = 0;
 break;
 case 3:
 rotateAngle[canceloldi][canceloldj]= cancelold;
 canceltype = 0;
 break;
 case 4:
 flagThings[canceloldi][canceloldj] = 1;
 canceltype = 0;
 break;
 case 5:
 break;

	
}
	



}
}


function CancelPush()
{
var CancelBehavior=[canceltype,old,oldi,oldj];	
CancelStack.push(CancelBehavior);	
	
	
}




	
