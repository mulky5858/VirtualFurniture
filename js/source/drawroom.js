var WallTextureDensity = 1
var FloorTextureDensity = 1
function drawroom () {
  rebuildwall()

  rebuildfloor()

  rebuildceiling()

  rebuilddoor()
}

function builddoor (j) {
  var doorHeight = 1.95
  var DoorMatrix = '-0.55 0 0 0 0\r\n0.55 0 0 1 0\r\n0.55 ' + doorHeight + ' 0 1 1\r\n-0.55 0 0 0 0\r\n-0.55 ' + doorHeight + ' 0 0 1\r\n0.55 ' + doorHeight + ' 0 1 1\r\n'

  return DoorMatrix
}
function rebuilddoor () {
  for (var j = 0; j <= 50; j++) {
    if (DoorPresentAngle[j] > 1) {
      mvPushMatrix()
      var doorplace = [dooratemp0[j], coordinate(38, j)[1], dooratemp2[j]]
      mat4.translate(mvMatrix, doorplace)
      mat4.rotateY(mvMatrix, degToRad(rotateAngle[38][j]))

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, doorTexture[0])
      gl.uniform1i(shaderProgram.samplerUniform, 0)

      gl.bindBuffer(gl.ARRAY_BUFFER, doorVertexTextureCoordBuffer.data)
      gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, doorVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0)

      gl.bindBuffer(gl.ARRAY_BUFFER, doorVertexPositionBuffer.data)
      gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, doorVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)

      setMatrixUniforms()
      gl.drawArrays(gl.TRIANGLES, 0, doorVertexPositionBuffer.numItems)
      mvPopMatrix()
    }
  }
}

function buildfloor (x, z) {
  var FloorMatrix = '' + x + ' 0 ' + z + ' 0 0\r\n' + x + ' 0 ' + (z + 1) + ' 0 ' + FloorTextureDensity + '\r\n' + (x + 1) + ' 0 ' + (z + 1) + ' ' + FloorTextureDensity + ' ' + FloorTextureDensity + '\r\n' + x + ' 0 ' + z + ' 0 0\r\n' + (x + 1) + ' 0 ' + (z + 1) + ' ' + FloorTextureDensity + ' ' + FloorTextureDensity + '\r\n' + (x + 1) + ' 0 ' + z + ' ' + FloorTextureDensity + ' 0\r\n'

  return FloorMatrix
}

function rebuildfloor () {
  for (var i = 0; i <= 19; i++)
    for (var j = 0; j <= 19; j++) {
      if (mapdiv[i][j]) {
        mvPushMatrix()
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, floorTexture[translateFloorTexture])
        gl.uniform1i(shaderProgram.samplerUniform, 0)

        gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexTextureCoordBuffer[i][j].data)
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, floorVertexTextureCoordBuffer[i][j].itemSize, gl.FLOAT, false, 0, 0)

        gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexPositionBuffer[i][j].data)
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, floorVertexPositionBuffer[i][j].itemSize, gl.FLOAT, false, 0, 0)

        setMatrixUniforms()
        gl.drawArrays(gl.TRIANGLES, 0, floorVertexPositionBuffer[i][j].numItems)
        mvPopMatrix()
      }
  }
}

function buildceiling (x, z) {
  var CeilingMatrix = '' + x + ' 2.43 ' + z + ' 0 0\r\n' + x + ' 2.43 ' + (z + 1) + ' 0 ' + FloorTextureDensity + '\r\n' + (x + 1) + ' 2.43 ' + (z + 1) + ' ' + FloorTextureDensity + ' ' + FloorTextureDensity + '\r\n' + x + ' 2.43 ' + z + ' 0 0\r\n' + (x + 1) + ' 2.43 ' + (z + 1) + ' ' + FloorTextureDensity + ' ' + FloorTextureDensity + '\r\n' + (x + 1) + ' 2.43 ' + z + ' ' + FloorTextureDensity + ' 0\r\n'

  return CeilingMatrix
}

function rebuildceiling () {
  for (var i = 0; i <= 19; i++)
    for (var j = 0; j <= 19; j++) {
      if (!viewstyle) {
        if (!mapdiv[i][j] && (shouldbuildwall(i, j))) {
          mvPushMatrix()
          gl.activeTexture(gl.TEXTURE0)
          gl.bindTexture(gl.TEXTURE_2D, ceilingTexture[translateCelingTexture])
          gl.uniform1i(shaderProgram.samplerUniform, 0)

          gl.bindBuffer(gl.ARRAY_BUFFER, ceilingVertexTextureCoordBuffer[i][j].data)
          gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, ceilingVertexTextureCoordBuffer[i][j].itemSize, gl.FLOAT, false, 0, 0)

          gl.bindBuffer(gl.ARRAY_BUFFER, ceilingVertexPositionBuffer[i][j].data)
          gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, ceilingVertexPositionBuffer[i][j].itemSize, gl.FLOAT, false, 0, 0)

          setMatrixUniforms()
          gl.drawArrays(gl.TRIANGLES, 0, ceilingVertexPositionBuffer[i][j].numItems)
          mvPopMatrix()
        }
      }else {
        if (mapdiv[i][j]) {
          mvPushMatrix()
          gl.activeTexture(gl.TEXTURE0)
          gl.bindTexture(gl.TEXTURE_2D, ceilingTexture[translateCelingTexture])
          gl.uniform1i(shaderProgram.samplerUniform, 0)

          gl.bindBuffer(gl.ARRAY_BUFFER, ceilingVertexTextureCoordBuffer[i][j].data)
          gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, ceilingVertexTextureCoordBuffer[i][j].itemSize, gl.FLOAT, false, 0, 0)

          gl.bindBuffer(gl.ARRAY_BUFFER, ceilingVertexPositionBuffer[i][j].data)
          gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, ceilingVertexPositionBuffer[i][j].itemSize, gl.FLOAT, false, 0, 0)

          setMatrixUniforms()
          gl.drawArrays(gl.TRIANGLES, 0, ceilingVertexPositionBuffer[i][j].numItems)
          mvPopMatrix()
        }
      }
  }
}

function buildwall (x, z) {
  var WallMatrix = '' + x + ' 0 ' + z + ' 0 0\r\n' + (x + 1) + ' 0 ' + z + ' ' + WallTextureDensity + ' 0\r\n' + (x + 1) + ' 2.43 ' + z + ' ' + WallTextureDensity + ' ' + WallTextureDensity + '\r\n' + x + ' 0 ' + z + ' 0 0\r\n' + (x + 1) + ' 2.43 ' + z + ' ' + WallTextureDensity + ' ' + WallTextureDensity + '\r\n' + x + ' 2.43 ' + z + ' 0 ' + WallTextureDensity + '\r\n' + x + ' 0 ' + z + ' 0 0\r\n' + x + ' 0 ' + (z + 1) + ' ' + WallTextureDensity + ' 0\r\n' + x + ' 2.43 ' + (z + 1) + ' ' + WallTextureDensity + ' ' + WallTextureDensity + '\r\n' + x + ' 0 ' + z + ' 0 0\r\n' + x + ' 2.43 ' + z + ' 0 ' + WallTextureDensity + '\r\n' + x + ' 2.43 ' + (z + 1) + ' ' + WallTextureDensity + ' ' + WallTextureDensity + '\r\n' + x + ' 0 ' + (z + 1) + ' 0 0\r\n' + (x + 1) + ' 0 ' + (z + 1) + ' ' + WallTextureDensity + ' 0\r\n' + (x + 1) + ' 2.43 ' + (z + 1) + ' ' + WallTextureDensity + ' ' + WallTextureDensity + '\r\n' + x + ' 0 ' + (z + 1) + ' 0 0\r\n' + (x + 1) + ' 2.43 ' + (z + 1) + ' ' + WallTextureDensity + ' ' + WallTextureDensity + '\r\n' + x + ' 2.43 ' + (z + 1) + ' 0 ' + WallTextureDensity + '\r\n' + (x + 1) + ' 0 ' + z + ' 0 0\r\n' + (x + 1) + ' 0 ' + (z + 1) + ' ' + WallTextureDensity + ' 0\r\n' + (x + 1) + ' 2.43 ' + (z + 1) + ' ' + WallTextureDensity + ' ' + WallTextureDensity + '\r\n' + (x + 1) + ' 0 ' + z + ' 0 0\r\n' + (x + 1) + ' 2.43 ' + z + ' 0 ' + WallTextureDensity + '\r\n' + (x + 1) + ' 2.43 ' + (z + 1) + ' ' + WallTextureDensity + ' ' + WallTextureDensity + '\r\n'

  return WallMatrix
}

function rebuildwall () {
  for (var i = 0; i <= 19; i++)
    for (var j = 0; j <= 19; j++) {
      if (!mapdiv[i][j] && (shouldbuildwall(i, j))) {

        /*
        *	draw room's wall
        */

        mvPushMatrix()
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, wallTexture[translateWallTexture])
        gl.uniform1i(shaderProgram.samplerUniform, 0)

        gl.bindBuffer(gl.ARRAY_BUFFER, wallVertexTextureCoordBuffer[i][j].data)
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, wallVertexTextureCoordBuffer[i][j].itemSize, gl.FLOAT, false, 0, 0)

        gl.bindBuffer(gl.ARRAY_BUFFER, wallVertexPositionBuffer[i][j].data)
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, wallVertexPositionBuffer[i][j].itemSize, gl.FLOAT, false, 0, 0)

        setMatrixUniforms()
        gl.drawArrays(gl.TRIANGLES, 0, wallVertexPositionBuffer[i][j].numItems)
        mvPopMatrix()
      }
  }
}

function shouldbuildwall (i, j) {
  if ((i == 19 || i == 0 || j == 0 || j == 19) && testmode) return true

  if (i + 1 <= 19 && mapdiv[i + 1][j] == 1) return true
  else {
    if (i - 1 >= 0 && mapdiv[i - 1][j] == 1) return true
    else {
      if (j + 1 <= 19 && mapdiv[i][j + 1] == 1) return true
      else {
        if (j - 1 >= 0 && mapdiv[i][j - 1] == 1) return true
        else {
          if (i + 1 <= 19 && j + 1 <= 19 && mapdiv[i + 1][j + 1] == 1) return true
          else {
            if (i + 1 <= 19 && j - 1 >= 0 && mapdiv[i + 1][j - 1] == 1) return true
            else {
              if (i - 1 >= 0 && j + 1 <= 19 && mapdiv[i - 1][j + 1] == 1) return true
              else {
                if (i - 1 >= 0 && j - 1 >= 0 && mapdiv[i - 1][j - 1] == 1) return true
                else return false
              }
            }
          }
        }
      }
    }
  }
}
