var wallVertexPositionBuffer = Array();
var wallVertexTextureCoordBuffer = Array();
var floorVertexPositionBuffer = Array();
var floorVertexTextureCoordBuffer = Array();
var ceilingVertexPositionBuffer = Array();
var ceilingVertexTextureCoordBuffer = Array();
var doorVertexPositionBuffer=new Object();
var doorVertexTextureCoordBuffer=new Object(); 
for (var i=0;i<=19;i++)
{
  wallVertexPositionBuffer[i]=Array();
  wallVertexTextureCoordBuffer[i]=Array();
  floorVertexPositionBuffer[i] = Array();
  floorVertexTextureCoordBuffer[i] = Array();
  ceilingVertexPositionBuffer[i] = Array();
  ceilingVertexTextureCoordBuffer[i] = Array();
}  


for (var i=0;i<=19;i++)
{

  for (var j=0;j<=19;j++)
  {
	wallVertexPositionBuffer[i][j]=new Object(); 
	wallVertexTextureCoordBuffer[i][j]=new Object(); 
	floorVertexPositionBuffer[i][j]=new Object(); 
	floorVertexTextureCoordBuffer[i][j]=new Object(); 
	ceilingVertexPositionBuffer[i][j]=new Object(); 
	ceilingVertexTextureCoordBuffer[i][j]=new Object(); 
  }
}





function loadRoom() {


for (var i=0;i<=19;i++)
   for (var j=0;j<=19;j++)
  {
   handleLoadedWall(i,j); 
   handleLoadedFloor(i,j);
   handleLoadedCeiling(i,j); 
  }

handleLoadedDoor();
document.getElementById("loadingtext").textContent = "房间载入完成，正在载入其他非模型物体..";

}




function handleLoadedWall(wi,wj) {
	    var data=buildwall(wi-10,wj-10);
        var lines = data.split("\n");
        var vertexCount = 0;
        var vertexPositions = [];
	    var vertexTextureCoords = [];
	
		
		
        for (var i in lines) {
            var vals = lines[i].split(" ");
            if (vals[0] != "//") {
				// It is a line describing a vertex; get X, Y and Z first
                vertexPositions.push(parseFloat(vals[0]));
                vertexPositions.push(parseFloat(vals[1]));
                vertexPositions.push(parseFloat(vals[2]));

                // And then the texture coords
                vertexTextureCoords.push(parseFloat(vals[3]));
                vertexTextureCoords.push(parseFloat(vals[4]));

                vertexCount += 1;
            }
        }

        wallVertexPositionBuffer[wi][wj].data = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, wallVertexPositionBuffer[wi][wj].data);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
        wallVertexPositionBuffer[wi][wj].itemSize = 3;
        wallVertexPositionBuffer[wi][wj].numItems = vertexCount;

        wallVertexTextureCoordBuffer[wi][wj].data = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, wallVertexTextureCoordBuffer[wi][wj].data);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoords), gl.STATIC_DRAW);
        wallVertexTextureCoordBuffer[wi][wj].itemSize = 2;
        wallVertexTextureCoordBuffer[wi][wj].numItems = vertexCount;

        
    }
	
	


function handleLoadedFloor(fi,fj)
{
	var data=buildfloor(fi-10,fj-10);
	var lines = data.split("\n");
	var vertexCount = 0;
	var vertexPositions = [];
	var vertexTextureCoords = [];
	
	for(var i in lines)
	{
		var vals = lines[i].split(" ");
		if (vals[0] != "//") 
		{
			// It is a line describing a vertex; get X, Y and Z first
            vertexPositions.push(parseFloat(vals[0]));
            vertexPositions.push(parseFloat(vals[1]));
            vertexPositions.push(parseFloat(vals[2]));
 
            // And then the texture coords
            vertexTextureCoords.push(parseFloat(vals[3]));
            vertexTextureCoords.push(parseFloat(vals[4]));
 
            vertexCount += 1;
    	}
	}
		
	floorVertexPositionBuffer[fi][fj].data = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexPositionBuffer[fi][fj].data);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
	floorVertexPositionBuffer[fi][fj].itemSize = 3;
	floorVertexPositionBuffer[fi][fj].numItems = vertexCount;
	
	floorVertexTextureCoordBuffer[fi][fj].data = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexTextureCoordBuffer[fi][fj].data);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoords), gl.STATIC_DRAW);
	floorVertexTextureCoordBuffer[fi][fj].itemSize = 2;
	floorVertexTextureCoordBuffer[fi][fj].numItems = vertexCount;
}



function handleLoadedCeiling(ci,cj)
{
	var data=buildceiling(ci-10,cj-10);
	var lines = data.split("\n");
	var vertexCount = 0;
	var vertexPositions = [];
	var vertexTextureCoords = [];

	for(var i in lines)
	{
		var vals = lines[i].split(" ");
		if (vals[0] != "//") 
		{
    		// It is a line describing a vertex; get X, Y and Z first
            vertexPositions.push(parseFloat(vals[0]));
            vertexPositions.push(parseFloat(vals[1]));
            vertexPositions.push(parseFloat(vals[2]));
 
            // And then the texture coords
            vertexTextureCoords.push(parseFloat(vals[3]));
            vertexTextureCoords.push(parseFloat(vals[4]));
 
            vertexCount += 1;
		}
	}
		
	ceilingVertexPositionBuffer[ci][cj].data = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, ceilingVertexPositionBuffer[ci][cj].data);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
	ceilingVertexPositionBuffer[ci][cj].itemSize = 3;
	ceilingVertexPositionBuffer[ci][cj].numItems = vertexCount;
	
	ceilingVertexTextureCoordBuffer[ci][cj].data = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, ceilingVertexTextureCoordBuffer[ci][cj].data);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoords), gl.STATIC_DRAW);
	ceilingVertexTextureCoordBuffer[ci][cj].itemSize = 2;
	ceilingVertexTextureCoordBuffer[ci][cj].numItems = vertexCount;
}



function handleLoadedDoor()
{
	var data=builddoor();
	var lines = data.split("\n");
	var vertexCount = 0;
	var vertexPositions = [];
	var vertexTextureCoords = [];

	for(var i in lines)
	{
		var vals = lines[i].split(" ");
		if (vals[0] != "//") 
		{
    		// It is a line describing a vertex; get X, Y and Z first
            vertexPositions.push(parseFloat(vals[0]));
            vertexPositions.push(parseFloat(vals[1]));
            vertexPositions.push(parseFloat(vals[2]));
 
            // And then the texture coords
            vertexTextureCoords.push(parseFloat(vals[3]));
            vertexTextureCoords.push(parseFloat(vals[4]));
 
            vertexCount += 1;
		}
	}
		
	doorVertexPositionBuffer.data = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, doorVertexPositionBuffer.data);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
	doorVertexPositionBuffer.itemSize = 3;
	doorVertexPositionBuffer.numItems = vertexCount;
	
	doorVertexTextureCoordBuffer.data = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, doorVertexTextureCoordBuffer.data);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoords), gl.STATIC_DRAW);
	doorVertexTextureCoordBuffer.itemSize = 2;
	doorVertexTextureCoordBuffer.numItems = vertexCount;
}
