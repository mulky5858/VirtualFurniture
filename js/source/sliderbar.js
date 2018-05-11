var modelslidercount=Array();
var modelslidercount_number=Array();
for (var i=0;i<=12;i++) modelslidercount[i]=2;

modelslidercount_number[0]=12;
modelslidercount_number[1]=3;
modelslidercount_number[2]=3;
modelslidercount_number[3]=3;
modelslidercount_number[4]=6;
modelslidercount_number[5]=3;
modelslidercount_number[6]=5;
modelslidercount_number[7]=3;
modelslidercount_number[8]=3;
modelslidercount_number[9]=3;
modelslidercount_number[10]=5;
modelslidercount_number[11]=3;
modelslidercount_number[12]=6;

var textureslidercount=Array();
var textureslidercount_number=Array();
for (var i=1;i<=8;i++) textureslidercount[i]=1;
textureslidercount[9]=2;
textureslidercount[10]=2;
textureslidercount[11]=2;

textureslidercount_number[1]=5;
textureslidercount_number[2]=2;
textureslidercount_number[3]=5;
textureslidercount_number[4]=4;
textureslidercount_number[5]=4;
textureslidercount_number[6]=2;
textureslidercount_number[7]=4;
textureslidercount_number[8]=4;

textureslidercount_number[9]=12;
textureslidercount_number[10]=10;
textureslidercount_number[11]=10;



function modelsliderleft()
{

 if (modelslidercount[model_select]>2) modelslidercount[model_select]-=1;
 showmodelicon();
 
 	
}

function modelsliderright()
{
	
 if (modelslidercount[model_select]<(modelslidercount_number[model_select]-1)) modelslidercount[model_select]+=1;
 showmodelicon();	
}



function hiddenmodelicon()
{
	


if (model_select!=0)
{
for(var i=1;i<=modelslidercount_number[model_select];i++)
{
document.getElementById("model_"+model_select+"_"+i+"").style.display='none';	
}
}
else
{
for (var i=1;i<=12;i++) document.getElementById("model_"+i+"").style.display='none';		
	
}
	

}

function showmodelicon()
{
hiddenmodelicon();	

if (model_select!=0)
{
document.getElementById("model_"+model_select+"_"+(modelslidercount[model_select]-1)+"").style.display='block';	
document.getElementById("model_"+model_select+"_"+(modelslidercount[model_select])+"").style.display='block';
document.getElementById("model_"+model_select+"_"+(modelslidercount[model_select]+1)+"").style.display='block';
$("modelMenu_"+model_select+"").show();	
}
else
{
document.getElementById("model_"+(modelslidercount[model_select]-1)+"").style.display='block';	
document.getElementById("model_"+modelslidercount[model_select]+"").style.display='block';
document.getElementById("model_"+(modelslidercount[model_select]+1)+"").style.display='block';		
$('#modelMenu').show();	
}

document.getElementById("modelsliderleft").style.display='block';
document.getElementById("modelsliderright").style.display='block';	
	
if (modelslidercount[model_select]<=2)
{
document.getElementById("modelsliderleft").style.display='none';	
}
if (modelslidercount[model_select]>=(modelslidercount_number[model_select]-1))
{
document.getElementById("modelsliderright").style.display='none';	
}	
	
	
}











function texturesliderleft()
{
 	
 if ((texture_select>=9&&textureslidercount[texture_select]>2)||(texture_select<9&&textureslidercount[texture_select]>1) ) textureslidercount[texture_select]-=1;
 showtextureicon();	
}

function texturesliderright()
{
	
 if (textureslidercount[texture_select]<(textureslidercount_number[texture_select]-1)) textureslidercount[texture_select]+=1;
 showtextureicon();	
}



function hiddentextureicon()
{
	


if (texture_select!=0)
{
 if  (texture_select<9)	
 {
	for(var i=0;i<=textureslidercount_number[texture_select];i++)
	{
	document.getElementById("texture_"+texture_select+"_"+i+"").style.display='none';	
	}
 }
 else
 {
			if (texture_select==9)
			{
			for(var i=1;i<=12;i++)
			{
			document.getElementById("ceilingtexture_"+i+"").style.display='none';	
			} 
			}
			else
			{
			 	if (texture_select==10)
				{
				for(var i=1;i<=10;i++)
				{
				document.getElementById("walltexture_"+i+"").style.display='none';	
				} 
				}	
				else
				{
				  for(var i=1;i<=10;i++)
				  {
				  document.getElementById("floortexture_"+i+"").style.display='none';	
				  } 	
					
					
				}
				
				
			}
 }
}

	

}

function showtextureicon()
{
hiddentextureicon();	

document.getElementById("texturesliderleft").style.display='block';
document.getElementById("texturesliderright").style.display='block';		

if (texture_select!=0)
{
	if (texture_select<9)
	{
		if (textureslidercount[texture_select]<=1)
		{
		document.getElementById("texturesliderleft").style.display='none';	
		}
		if (textureslidercount[texture_select]>=(textureslidercount_number[texture_select]-1))
		{
		document.getElementById("texturesliderright").style.display='none';	
	    }
     }	
	else
	{
		if (textureslidercount[texture_select]<=2)
		{
		document.getElementById("texturesliderleft").style.display='none';	
		}
		if (textureslidercount[texture_select]>=(textureslidercount_number[texture_select]-1))
		{
		document.getElementById("texturesliderright").style.display='none';	
	    }
	}
	 
}
else
{

document.getElementById("texturesliderleft").style.display='none';
document.getElementById("texturesliderright").style.display='none';	
	

}



if (texture_select!=0)
{
	if  (texture_select<9)	
	{	
	document.getElementById("texture_"+texture_select+"_"+(textureslidercount[texture_select]-1)+"").style.display='block';	
	document.getElementById("texture_"+texture_select+"_"+(textureslidercount[texture_select])+"").style.display='block';
	document.getElementById("texture_"+texture_select+"_"+(textureslidercount[texture_select]+1)+"").style.display='block';
	}
	else
	{
		if (texture_select==9)	
		{
		 document.getElementById("ceilingtexture_"+(textureslidercount[texture_select]-1)+"").style.display='block';	
	     document.getElementById("ceilingtexture_"+(textureslidercount[texture_select])+"").style.display='block';
	     document.getElementById("ceilingtexture_"+(textureslidercount[texture_select]+1)+"").style.display='block';	
		}
		else
		{
			if (texture_select==10)	
			{
			 document.getElementById("walltexture_"+(textureslidercount[texture_select]-1)+"").style.display='block';	
			 document.getElementById("walltexture_"+(textureslidercount[texture_select])+"").style.display='block';
			 document.getElementById("walltexture_"+(textureslidercount[texture_select]+1)+"").style.display='block';					
				
			}
			else
			{
			 document.getElementById("floortexture_"+(textureslidercount[texture_select]-1)+"").style.display='block';	
	         document.getElementById("floortexture_"+(textureslidercount[texture_select])+"").style.display='block';
	         document.getElementById("floortexture_"+(textureslidercount[texture_select]+1)+"").style.display='block';		
				
			}
			
			
		}
		
		
		
		
	}
}


}

