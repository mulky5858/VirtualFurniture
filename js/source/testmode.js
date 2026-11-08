var testmode = 0
// 1代表开启测试模式
// 0为关闭测试模式
var testoutput = '碰撞体积开启。'

var lightMarkerReady = false
var lightMarkerPositionBuffer = null
var lightMarkerNormalBuffer = null
var lightMarkerTexCoordBuffer = null
var lightMarkerIndexBuffer = null
var lightMarkerTexture = null

function testmodeonload () {
  testmode = 1
}
function testmodeclose () {
  testmode = 0
  CharacterReset()
  testoutput = '碰撞体积开启。'
}

function initLightMarker () {
  if (!gl || lightMarkerReady) return

  var latitudeBands = 18
  var longitudeBands = 18
  var radius = 0.12
  var positions = []
  var normals = []
  var texCoords = []
  var indices = []

  for (var lat = 0; lat <= latitudeBands; lat++) {
    var theta = lat * Math.PI / latitudeBands
    var sinTheta = Math.sin(theta)
    var cosTheta = Math.cos(theta)
    for (var lon = 0; lon <= longitudeBands; lon++) {
      var phi = lon * 2 * Math.PI / longitudeBands
      var sinPhi = Math.sin(phi)
      var cosPhi = Math.cos(phi)
      var x = cosPhi * sinTheta
      var y = cosTheta
      var z = sinPhi * sinTheta
      positions.push(radius * x, radius * y, radius * z)
      normals.push(x, y, z)
      texCoords.push(lon / longitudeBands, lat / latitudeBands)
    }
  }

  for (var lat2 = 0; lat2 < latitudeBands; lat2++) {
    for (var lon2 = 0; lon2 < longitudeBands; lon2++) {
      var first = (lat2 * (longitudeBands + 1)) + lon2
      var second = first + longitudeBands + 1
      indices.push(first, second, first + 1)
      indices.push(second, second + 1, first + 1)
    }
  }

  lightMarkerPositionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, lightMarkerPositionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
  lightMarkerPositionBuffer.itemSize = 3
  lightMarkerPositionBuffer.numItems = positions.length / 3

  lightMarkerNormalBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, lightMarkerNormalBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW)
  lightMarkerNormalBuffer.itemSize = 3
  lightMarkerNormalBuffer.numItems = normals.length / 3

  lightMarkerTexCoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, lightMarkerTexCoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW)
  lightMarkerTexCoordBuffer.itemSize = 2
  lightMarkerTexCoordBuffer.numItems = texCoords.length / 2

  lightMarkerIndexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lightMarkerIndexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
  lightMarkerIndexBuffer.itemSize = 1
  lightMarkerIndexBuffer.numItems = indices.length

  lightMarkerTexture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, lightMarkerTexture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 48, 48, 255]))
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.bindTexture(gl.TEXTURE_2D, null)

  lightMarkerReady = true
}

function drawLightMarker () {
  if (!testmode) return
  if (!lightMarkerReady) initLightMarker()
  if (!lightMarkerReady) return

  mvPushMatrix()
  mat4.translate(mvMatrix, pointlight)

  gl.uniform1i(shaderProgram.useLightingUniform, 0)
  gl.uniform1i(shaderProgram.useTexturesUniform, 1)

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, lightMarkerTexture)
  gl.uniform1i(shaderProgram.samplerUniform, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, lightMarkerPositionBuffer)
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, lightMarkerPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, lightMarkerNormalBuffer)
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, lightMarkerNormalBuffer.itemSize, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, lightMarkerTexCoordBuffer)
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, lightMarkerTexCoordBuffer.itemSize, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lightMarkerIndexBuffer)
  setMatrixUniforms()
  gl.drawElements(gl.TRIANGLES, lightMarkerIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0)

  mvPopMatrix()
  gl.uniform1i(shaderProgram.useLightingUniform, lighting ? 1 : 0)
}

function clicked (num) {
  switch (num) {
    case 0:
      return '吊灯1'
      break
    case 1:
      return '多人沙发'
      break
    case 2:
      return '背投彩电'
      break
    case 3:
      return '椭圆茶几'
      break
    case 4:
      return '书架'
      break
    case 5:
      return '花瓶1'
      break
    case 6:
      return '茶壶'
      break
    case 7:
      return '立式空调'
      break
    case 8:
      return '衣柜'
      break
    case 9:
      return '双人床'
      break
    case 10:
      return '床头柜'
      break
    case 11:
      return '开关'
      break
    case 12:
      return '电话机'
      break
    case 13:
      return '台式电脑'
      break
    case 14:
      return '办公桌1'
      break
    case 15:
      return '吊灯2'
      break
    case 16:
      return '木床'
      break
    case 17:
      return '挂式空调'
      break
    case 18:
      return '中央空调'
      break
    case 19:
      return '方形茶几'
      break
    case 20:
      return '鞋柜'
      break
    case 21:
      return '单人沙发'
      break
    case 22:
      return '双人沙发'
      break
    case 23:
      return '笔记本电脑'
      break
    case 24:
      return '椅子1'
      break
    case 25:
      return '椅子2'
      break
    case 26:
      return '椅子3'
      break
    case 27:
      return '衣柜2'
      break
    case 28:
      return '酒柜'
      break
    case 29:
      return '花瓶2'
      break
    case 30:
      return '装饰品1'
      break
    case 31:
      return '装饰品2'
      break
    case 32:
      return '装饰品3'
      break
    case 33:
      return '书本'
      break
    case 34:
      return '垃圾桶'
      break
    case 35:
      return '圆桌'
      break
    case 36:
      return '办公桌2'
      break
    case 37:
      return '相框'
      break
    case 38:
      return '门'
      break
  }
}
