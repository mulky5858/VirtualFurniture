var WallTextureDensity = 1
var FloorTextureDensity = 1
function drawroom () {
  rebuildwall()

  rebuildfloor()

  rebuildceiling()

  rebuilddoor()
}

function bindRoomAttributes (positionBuffer, texBuffer, normalBuffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer.data)
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, positionBuffer.itemSize, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer.data)
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, normalBuffer.itemSize, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer.data)
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, texBuffer.itemSize, gl.FLOAT, false, 0, 0)
}

function builddoor (j) {
  var doorHeight = 1.95
  // 法线 (0,0,1)
  return quad(
    '-0.55 0 0',
    '0.55 0 0',
    '0.55 ' + doorHeight + ' 0',
    '-0.55 ' + doorHeight + ' 0',
    0, 0, 1, 0, 1, 1, 0, 1
  )
}
function rebuilddoor () {
  if (typeof bindMaterialMaps === 'function') bindMaterialMaps('wood')
  for (var j = 0; j <= 50; j++) {
    if (DoorPresentAngle[j] > 1) {
      mvPushMatrix()
      var doorplace = [dooratemp0[j], coordinate(38, j)[1], dooratemp2[j]]
      mat4.translate(mvMatrix, doorplace)
      mat4.rotateY(mvMatrix, degToRad(rotateAngle[38][j]))

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, doorTexture[0])
      gl.uniform1i(shaderProgram.samplerUniform, 0)

      bindRoomAttributes(doorVertexPositionBuffer, doorVertexTextureCoordBuffer, doorVertexNormalBuffer)

      setMatrixUniforms()
      gl.drawArrays(gl.TRIANGLES, 0, doorVertexPositionBuffer.numItems)
      mvPopMatrix()
    }
  }
  if (typeof bindMaterialMaps === 'function') bindMaterialMaps(null)
}

function buildfloor (x, z) {
  // 法线 (0,1,0)，朝上
  return quad(
    x + ' 0 ' + z,
    x + ' 0 ' + (z + 1),
    (x + 1) + ' 0 ' + (z + 1),
    (x + 1) + ' 0 ' + z,
    0, 0, 0, FloorTextureDensity, FloorTextureDensity, FloorTextureDensity, FloorTextureDensity, 0
  )
}

function rebuildfloor () {
  if (typeof bindMaterialMaps === 'function') bindMaterialMaps('wood')
  for (var i = 0; i <= 19; i++)
    for (var j = 0; j <= 19; j++) {
      if (mapdiv[i][j]) {
        mvPushMatrix()
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, floorTexture[translateFloorTexture])
        gl.uniform1i(shaderProgram.samplerUniform, 0)

        bindRoomAttributes(floorVertexPositionBuffer[i][j], floorVertexTextureCoordBuffer[i][j], floorVertexNormalBuffer[i][j])

        setMatrixUniforms()
        gl.drawArrays(gl.TRIANGLES, 0, floorVertexPositionBuffer[i][j].numItems)
        mvPopMatrix()
      }
  }
  if (typeof bindMaterialMaps === 'function') bindMaterialMaps(null)
}

function buildceiling (x, z) {
  // 法线 (0,-1,0)，朝下对着房间
  return quad(
    x + ' 2.43 ' + z,
    (x + 1) + ' 2.43 ' + z,
    (x + 1) + ' 2.43 ' + (z + 1),
    x + ' 2.43 ' + (z + 1),
    0, 0, FloorTextureDensity, 0, FloorTextureDensity, FloorTextureDensity, 0, FloorTextureDensity
  )
}

function rebuildceiling () {
  if (typeof bindMaterialMaps === 'function') bindMaterialMaps('ceiling')
  for (var i = 0; i <= 19; i++)
    for (var j = 0; j <= 19; j++) {
      if (!viewstyle) {
        if (!mapdiv[i][j] && (shouldbuildwall(i, j))) {
          mvPushMatrix()
          gl.activeTexture(gl.TEXTURE0)
          gl.bindTexture(gl.TEXTURE_2D, ceilingTexture[translateCelingTexture])
          gl.uniform1i(shaderProgram.samplerUniform, 0)

          bindRoomAttributes(ceilingVertexPositionBuffer[i][j], ceilingVertexTextureCoordBuffer[i][j], ceilingVertexNormalBuffer[i][j])

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

          bindRoomAttributes(ceilingVertexPositionBuffer[i][j], ceilingVertexTextureCoordBuffer[i][j], ceilingVertexNormalBuffer[i][j])

          setMatrixUniforms()
          gl.drawArrays(gl.TRIANGLES, 0, ceilingVertexPositionBuffer[i][j].numItems)
          mvPopMatrix()
        }
      }
  }
  if (typeof bindMaterialMaps === 'function') bindMaterialMaps(null)
}

function quad (a, b, c, d, ua, va, ub, vb, uc, vc, ud, vd) {
  // 两个三角形共用绕序 a->b->c / a->c->d，保证同一面法线一致
  return (
    a + ' ' + ua + ' ' + va + '\r\n' +
    b + ' ' + ub + ' ' + vb + '\r\n' +
    c + ' ' + uc + ' ' + vc + '\r\n' +
    a + ' ' + ua + ' ' + va + '\r\n' +
    c + ' ' + uc + ' ' + vc + '\r\n' +
    d + ' ' + ud + ' ' + vd + '\r\n'
  )
}

function buildwall (x, z) {
  var y0 = 0
  var y1 = 2.43
  var x0 = x
  var x1 = x + 1
  var z0 = z
  var z1 = z + 1
  var t = WallTextureDensity

  // 四个侧面，法线均朝盒子外侧
  return (
    // -Z 面 (z0)，法线 (0,0,-1)
    quad(
      x0 + ' ' + y0 + ' ' + z0,
      x0 + ' ' + y1 + ' ' + z0,
      x1 + ' ' + y1 + ' ' + z0,
      x1 + ' ' + y0 + ' ' + z0,
      0, 0, 0, t, t, t, t, 0
    ) +
    // +Z 面 (z1)，法线 (0,0,1)
    quad(
      x0 + ' ' + y0 + ' ' + z1,
      x1 + ' ' + y0 + ' ' + z1,
      x1 + ' ' + y1 + ' ' + z1,
      x0 + ' ' + y1 + ' ' + z1,
      0, 0, t, 0, t, t, 0, t
    ) +
    // -X 面 (x0)，法线 (-1,0,0)
    quad(
      x0 + ' ' + y0 + ' ' + z0,
      x0 + ' ' + y0 + ' ' + z1,
      x0 + ' ' + y1 + ' ' + z1,
      x0 + ' ' + y1 + ' ' + z0,
      0, 0, t, 0, t, t, 0, t
    ) +
    // +X 面 (x1)，法线 (1,0,0)
    quad(
      x1 + ' ' + y0 + ' ' + z0,
      x1 + ' ' + y1 + ' ' + z0,
      x1 + ' ' + y1 + ' ' + z1,
      x1 + ' ' + y0 + ' ' + z1,
      0, 0, 0, t, t, t, t, 0
    )
  )
}

function rebuildwall () {
  if (typeof bindMaterialMaps === 'function') bindMaterialMaps('plaster')
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

        bindRoomAttributes(wallVertexPositionBuffer[i][j], wallVertexTextureCoordBuffer[i][j], wallVertexNormalBuffer[i][j])

        setMatrixUniforms()
        gl.drawArrays(gl.TRIANGLES, 0, wallVertexPositionBuffer[i][j].numItems)
        mvPopMatrix()
      }
  }
  if (typeof bindMaterialMaps === 'function') bindMaterialMaps(null)
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
