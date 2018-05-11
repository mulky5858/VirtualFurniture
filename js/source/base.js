function degToRad(degrees) {
        return degrees * Math.PI / 180;
}
	
function RadToDeg(degrees) {
        return degrees / Math.PI * 180;
}


function rand(rmin,rmax)
{
 return	Math.round(Math.random() * (rmax - rmin)) + rmin;
}


function divRotate(id,angle)
{
document.getElementById(id).style.webkitTransform='rotate('+angle%360+'deg)';
document.getElementById(id).style.MozTransform='rotate('+angle%360+'deg)';

}

function Hypotenuse(a,b)
{

return Math.sqrt(a*a+b*b);	
 	
}
function coordinate(i,j)
{
	
return [(parseFloat(translateVector[i][j][0]+translateMatrix[i][j][12])).toFixed(3),(parseFloat(translateVector[i][j][1]+translateMatrix[i][j][13])).toFixed(3),(parseFloat(translateVector[i][j][2]+translateMatrix[i][j][14])).toFixed(3)];
	
}



function ButtonEffect(id,move)
{

$('#'+id+'').removeClass().addClass('animated '+move+'');
var wait = window.setTimeout( function(){
$('#'+id+'').removeClass()},
1300
);
	
	
}