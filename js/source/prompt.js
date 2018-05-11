var prompt_check=0;

function lagelapsedtozero()
{
prompt_check++;
disappearprompt(prompt_check);
}


function displayprompt(promptchecked)
{
document.getElementById("promptAdd").style.display='block';		
var opa=parseFloat(document.getElementById("promptAdd").style.opacity);
opa+=0.0625;
document.getElementById("promptAdd").style.opacity= opa;	

if(opa<=1 && prompt_check==promptchecked)	setTimeout(function(){displayprompt(promptchecked)},62.5);					
		
	
}

function disappearprompt(promptchecked)
{

var opa=parseFloat(document.getElementById("promptAdd").style.opacity);
opa-=0.0625;
document.getElementById("promptAdd").style.opacity= opa;	

if(opa>=0.0625  && prompt_check==promptchecked)	setTimeout(function(){disappearprompt(promptchecked)},62.5);
else
{
		
document.getElementById("promptAdd").style.display='none';

}
}


