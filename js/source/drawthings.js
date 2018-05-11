function drawThings(num, i)
{
	mat4.multiply(mvThings[num][i], translateMatrix[num][i]);
	
	if (num==38) mat4.rotateY(mvThings[num][i], degToRad(rotateAngle[num][i]+(DoorPresentAngle[i])));
	else mat4.rotateY(mvThings[num][i], degToRad(rotateAngle[num][i]));
	mat4.scale(mvThings[num][i],translateScale[num][i]);
	
	if (translateTexture[num][i]>=0)
    {
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, ThingsTexture[num][translateTexture[num][i]]);
	}

    if (num==37) gl.uniform1f(shaderProgram.useLightingUniform, 0);
	
	
    gl.bindBuffer(gl.ARRAY_BUFFER, ThingsVertexPositionBuffer[num].data);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, ThingsVertexPositionBuffer[num].itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, ThingsVertexNormalBuffer[num].data);	
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, ThingsVertexNormalBuffer[num].itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, ThingsVertexTextureCoordBuffer[num].data);	
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, ThingsVertexTextureCoordBuffer[num].itemSize, gl.FLOAT, false, 0, 0);        
					
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ThingsVertexIndexBuffer[num].data);
	setMatrixUniforms();
	gl.drawElements(gl.TRIANGLES, ThingsVertexIndexBuffer[num].numItems, gl.UNSIGNED_SHORT, 0);
	
	if (num==37) gl.uniform1f(shaderProgram.useLightingUniform, lighting);
}

function draw(num)
{
		for(var i = 1; i <= numThings[num]; i++)
			{
			 if (flagThings[num][i]){
				 mvPushMatrix();
		         mat4.translate(mvMatrix, translateVector[num][i] );
		         mvThings[num][i] = mvMatrix;
		         drawThings(num,i);
		         mvPopMatrix();
				 if (num==2 && showTV[i]==1) drawTV(i,TVchannel[i]);
			 }
			}
		
		
}


function drawTV(i,channel){
	gl.uniform1f(shaderProgram.useLightingUniform, 0);
    mvPushMatrix();
	mat4.translate(mvMatrix, translateVector[2][i]);
	mat4.translate(mvMatrix, [parseFloat(translateMatrix[2][i][12]), parseFloat(translateMatrix[2][i][13]), parseFloat(translateMatrix[2][i][14])]);
	mat4.rotateY(mvMatrix, degToRad(rotateAngle[2][i]));
	mat4.scale(mvMatrix,translateScale[2][i]);
	
		
    gl.bindBuffer(gl.ARRAY_BUFFER, TVScreenVertexPositionBuffer[channel]);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, TVScreenVertexPositionBuffer[channel].itemSize, gl.FLOAT, false, 0, 0);
			
	gl.bindBuffer(gl.ARRAY_BUFFER, TVScreenVertexTextureCoordBuffer[channel]);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, TVScreenVertexTextureCoordBuffer[channel].itemSize, gl.FLOAT, false, 0, 0);
			
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, rttTexture[channel]);
	gl.uniform1i(shaderProgram.samplerUniform, 0);

	setMatrixUniforms();
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, TVScreenVertexPositionBuffer[channel].numItems);
	mvPopMatrix();
	gl.uniform1f(shaderProgram.useLightingUniform, lighting);
}




function draw2(num)
{

				 mvPushMatrix2();
		         mat4.translate(mvMatrix2, ThingsDefualtLocation(num) );
				 mvThings_2[num] = mvMatrix2;
		         drawThings2(num);
		         mvPopMatrix2();
				

}



function drawThings2(num)
{
		
	mat4.rotateY(mvThings_2[num], degToRad(gl2_rotateAngle));
	
	
	if (gl2_translateTexture>=0)
    {
	
	gl2.activeTexture(gl2.TEXTURE0);
	gl2.bindTexture(gl2.TEXTURE_2D, ThingsTexture2[num][gl2_translateTexture]);
	}

    if (num==37) gl2.uniform1f(shaderProgram2.useLightingUniform, 0);
	
	
    gl2.bindBuffer(gl2.ARRAY_BUFFER, ThingsVertexPositionBuffer2[num].data);
    gl2.vertexAttribPointer(shaderProgram2.vertexPositionAttribute, ThingsVertexPositionBuffer2[num].itemSize, gl2.FLOAT, false, 0, 0);
    
    gl2.bindBuffer(gl2.ARRAY_BUFFER, ThingsVertexNormalBuffer2[num].data);	
    gl2.vertexAttribPointer(shaderProgram2.vertexNormalAttribute, ThingsVertexNormalBuffer2[num].itemSize, gl2.FLOAT, false, 0, 0);

    gl2.bindBuffer(gl2.ARRAY_BUFFER, ThingsVertexTextureCoordBuffer2[num].data);	
    gl2.vertexAttribPointer(shaderProgram2.textureCoordAttribute, ThingsVertexTextureCoordBuffer2[num].itemSize, gl2.FLOAT, false, 0, 0);        
					
	gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, ThingsVertexIndexBuffer2[num].data);
	setMatrixUniforms2();
	gl2.drawElements(gl2.TRIANGLES, ThingsVertexIndexBuffer2[num].numItems, gl2.UNSIGNED_SHORT, 0);
	
	if (num==37) gl2.uniform1f(shaderProgram2.useLightingUniform, lighting);
}