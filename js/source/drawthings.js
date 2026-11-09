function drawThings (num, i) {
  mat4.multiply(mvThings[num][i], translateMatrix[num][i])

  if (num == 38) mat4.rotateY(mvThings[num][i], degToRad(rotateAngle[num][i] + (DoorPresentAngle[i])))
  else mat4.rotateY(mvThings[num][i], degToRad(rotateAngle[num][i]))
  mat4.scale(mvThings[num][i], translateScale[num][i])

  if (translateTexture[num][i] >= 0) {
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, ThingsTexture[num][translateTexture[num][i]])
  }

  bindAttribBuffer(gl, shaderProgram.vertexPositionAttribute, ThingsVertexPositionBuffer[num])
  bindAttribBuffer(gl, shaderProgram.vertexNormalAttribute, ThingsVertexNormalBuffer[num])
  bindAttribBuffer(gl, shaderProgram.textureCoordAttribute, ThingsVertexTextureCoordBuffer[num])

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ThingsVertexIndexBuffer[num].data)
  setMatrixUniforms()
  gl.drawElements(gl.TRIANGLES, ThingsVertexIndexBuffer[num].numItems, gl.UNSIGNED_SHORT, 0)
}

function draw (num) {
  // 相框贴墙：阴影贴图易把画面压黑；略提高环境光并临时关闭阴影接收
  var framePass = (num == 37)
  if (framePass) {
    gl.uniform3f(shaderProgram.ambientColorUniform, 0.45, 0.45, 0.45)
    if (typeof bindShadowUniforms === 'function') bindShadowUniforms(false)
  }
  if (typeof bindMaterialMaps === 'function') {
    bindMaterialMaps(typeof materialKindForType === 'function' ? materialKindForType(num) : null)
  }
  for (var i = 1; i <= numThings[num]; i++) {
    if (flagThings[num][i]) {
      mvPushMatrix()
      mat4.translate(mvMatrix, translateVector[num][i])
      mvThings[num][i] = mvMatrix
      drawThings(num, i)
      mvPopMatrix()
      if (num == 2 && showTV[i] == 1) drawTV(i, TVchannel[i])
    }
  }
  if (framePass) {
    gl.uniform3f(shaderProgram.ambientColorUniform, 0.17, 0.17, 0.17)
    if (typeof bindShadowUniforms === 'function') {
      bindShadowUniforms(!!(lighting && typeof sceneLights !== 'undefined' && sceneLights.length > 0))
    }
  }
  if (typeof bindMaterialMaps === 'function') bindMaterialMaps(null)
}

function drawTV (i, channel) {
  gl.uniform1i(shaderProgram.useLightingUniform, 0)
  if (typeof bindMaterialMaps === 'function') bindMaterialMaps(null)
  mvPushMatrix()
  mat4.translate(mvMatrix, translateVector[2][i])
  mat4.translate(mvMatrix, [parseFloat(translateMatrix[2][i][12]), parseFloat(translateMatrix[2][i][13]), parseFloat(translateMatrix[2][i][14])])
  mat4.rotateY(mvMatrix, degToRad(rotateAngle[2][i]))
  mat4.scale(mvMatrix, translateScale[2][i])

  bindAttribBuffer(gl, shaderProgram.vertexPositionAttribute, TVScreenVertexPositionBuffer[channel])
  bindAttribBuffer(gl, shaderProgram.textureCoordAttribute, TVScreenVertexTextureCoordBuffer[channel])

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, rttTexture[channel])
  gl.uniform1i(shaderProgram.samplerUniform, 0)

  setMatrixUniforms()
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, TVScreenVertexPositionBuffer[channel].numItems)
  mvPopMatrix()
  gl.uniform1i(shaderProgram.useLightingUniform, lighting ? 1 : 0)
  if (typeof bindMaterialMaps === 'function') bindMaterialMaps(2)
}

function draw2 (num) {
  mvPushMatrix2()
  mat4.translate(mvMatrix2, ThingsDefualtLocation(num))
  mvThings_2[num] = mvMatrix2
  drawThings2(num)
  mvPopMatrix2()
}

function drawThings2 (num) {
  mat4.rotateY(mvThings_2[num], degToRad(gl2_rotateAngle))

  if (gl2_translateTexture >= 0) {
    gl2.activeTexture(gl2.TEXTURE0)
    gl2.bindTexture(gl2.TEXTURE_2D, ThingsTexture2[num][gl2_translateTexture])
  }

  bindAttribBuffer(gl2, shaderProgram2.vertexPositionAttribute, ThingsVertexPositionBuffer2[num])
  bindAttribBuffer(gl2, shaderProgram2.vertexNormalAttribute, ThingsVertexNormalBuffer2[num])
  bindAttribBuffer(gl2, shaderProgram2.textureCoordAttribute, ThingsVertexTextureCoordBuffer2[num])

  gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, ThingsVertexIndexBuffer2[num].data)
  setMatrixUniforms2()
  gl2.drawElements(gl2.TRIANGLES, ThingsVertexIndexBuffer2[num].numItems, gl2.UNSIGNED_SHORT, 0)
}
