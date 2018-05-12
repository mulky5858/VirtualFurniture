var ThingsVertexPositionBuffer = Array()
var ThingsVertexTextureCoordBuffer = Array()
var ThingsVertexIndexBuffer = Array()
var ThingsVertexNormalBuffer = Array()

var ThingsVertexPositionBuffer2 = Array()
var ThingsVertexTextureCoordBuffer2 = Array()
var ThingsVertexIndexBuffer2 = Array()
var ThingsVertexNormalBuffer2 = Array()

var x_min
var x_max
var y_min
var y_max
var z_min
var z_max
var box = Array(); // Boundary boxes when model was initially loaded.
var ModleLoad = Array()
var ModleLoaded = 0

for (var i = 0; i <= NumberOfObjects - 1; i++) {
  ModleLoad[i] = false
}

for (var i = 0; i <= MaxNumberOfObjects; i++) {
  ThingsVertexPositionBuffer[i] = { }
  ThingsVertexTextureCoordBuffer[i] = { }
  ThingsVertexIndexBuffer[i] = { }
  ThingsVertexNormalBuffer[i] = { }

  ThingsVertexPositionBuffer2[i] = { }
  ThingsVertexTextureCoordBuffer2[i] = { }
  ThingsVertexIndexBuffer2[i] = { }
  ThingsVertexNormalBuffer2[i] = { }
}

function loadThings (shape, num) {
  var request = new XMLHttpRequest()
  request.open('GET', shape)

  request.onreadystatechange = function () {
    if (request.readyState == 4 && request.status == 200) {
      handleLoadedThings(JSON.parse(request.responseText), num)
      handleLoadedThings2(JSON.parse(request.responseText), num)
      ModleLoad[num] = true
    }
  }
  request.send()
}
function handleLoadedThings (ThingsData, num) {
  ThingsVertexNormalBuffer[num].data = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, ThingsVertexNormalBuffer[num].data)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ThingsData.vertexNormals), gl.STATIC_DRAW)
  ThingsVertexNormalBuffer[num].itemSize = 3
  ThingsVertexNormalBuffer[num].numItems = ThingsData.vertexNormals.length / 3

  ThingsVertexTextureCoordBuffer[num].data = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, ThingsVertexTextureCoordBuffer[num].data)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ThingsData.vertexTextureCoords), gl.STATIC_DRAW)
  ThingsVertexTextureCoordBuffer[num].itemSize = 2
  ThingsVertexTextureCoordBuffer[num].numItems = ThingsData.vertexTextureCoords.length / 2

  ThingsVertexPositionBuffer[num].data = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, ThingsVertexPositionBuffer[num].data)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ThingsData.vertexPositions), gl.STATIC_DRAW)
  ThingsVertexPositionBuffer[num].itemSize = 3
  ThingsVertexPositionBuffer[num].numItems = ThingsData.vertexPositions.length / 3

  for (var i = 0; i < ThingsVertexPositionBuffer[num].numItems; i++) {
    if (i == 0) {
      x_min = ThingsData.vertexPositions[0]
      x_max = ThingsData.vertexPositions[0]
      y_min = ThingsData.vertexPositions[1]
      y_max = ThingsData.vertexPositions[1]
      z_min = ThingsData.vertexPositions[2]
      z_max = ThingsData.vertexPositions[2]
    }

    if (ThingsData.vertexPositions[i * 3] < x_min)
      x_min = ThingsData.vertexPositions[i * 3]
    if (ThingsData.vertexPositions[i * 3] > x_max)
      x_max = ThingsData.vertexPositions[i * 3]
    if (ThingsData.vertexPositions[i * 3 + 1] < y_min)
      y_min = ThingsData.vertexPositions[i * 3 + 1]
    if (ThingsData.vertexPositions[i * 3 + 1] > y_max)
      y_max = ThingsData.vertexPositions[i * 3 + 1]
    if (ThingsData.vertexPositions[i * 3 + 2] < z_min)
      z_min = ThingsData.vertexPositions[i * 3 + 2]
    if (ThingsData.vertexPositions[i * 3 + 2] > z_max)
      z_max = ThingsData.vertexPositions[i * 3 + 2]
  }

  /*
   * Get the boundary box of the model.
   */

  box[num] = Array()
  box[num][0] = Array()
  box[num][0][0] = x_min
  box[num][0][1] = y_min
  box[num][0][2] = z_min
  box[num][0][3] = 1.0
  box[num][1] = Array()
  box[num][1][0] = x_min
  box[num][1][1] = y_min
  box[num][1][2] = z_max
  box[num][1][3] = 1.0
  box[num][2] = Array()
  box[num][2][0] = x_min
  box[num][2][1] = y_max
  box[num][2][2] = z_min
  box[num][2][3] = 1.0
  box[num][3] = Array()
  box[num][3][0] = x_min
  box[num][3][1] = y_max
  box[num][3][2] = z_max
  box[num][3][3] = 1.0
  box[num][4] = Array()
  box[num][4][0] = x_max
  box[num][4][1] = y_min
  box[num][4][2] = z_min
  box[num][4][3] = 1.0
  box[num][5] = Array()
  box[num][5][0] = x_max
  box[num][5][1] = y_min
  box[num][5][2] = z_max
  box[num][5][3] = 1.0
  box[num][6] = Array()
  box[num][6][0] = x_max
  box[num][6][1] = y_max
  box[num][6][2] = z_min
  box[num][6][3] = 1.0
  box[num][7] = Array()
  box[num][7][0] = x_max
  box[num][7][1] = y_max
  box[num][7][2] = z_max
  box[num][7][3] = 1.0

  ThingsVertexIndexBuffer[num].data = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ThingsVertexIndexBuffer[num].data)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ThingsData.indices), gl.STATIC_DRAW)
  ThingsVertexIndexBuffer[num].itemSize = 1
  ThingsVertexIndexBuffer[num].numItems = ThingsData.indices.length
}

function handleLoadedThings2 (ThingsData, num) {
  ThingsVertexNormalBuffer2[num].data = gl2.createBuffer()
  gl2.bindBuffer(gl2.ARRAY_BUFFER, ThingsVertexNormalBuffer2[num].data)
  gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array(ThingsData.vertexNormals), gl2.STATIC_DRAW)
  ThingsVertexNormalBuffer2[num].itemSize = 3
  ThingsVertexNormalBuffer2[num].numItems = ThingsData.vertexNormals.length / 3

  ThingsVertexTextureCoordBuffer2[num].data = gl2.createBuffer()
  gl2.bindBuffer(gl2.ARRAY_BUFFER, ThingsVertexTextureCoordBuffer2[num].data)
  gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array(ThingsData.vertexTextureCoords), gl2.STATIC_DRAW)
  ThingsVertexTextureCoordBuffer2[num].itemSize = 2
  ThingsVertexTextureCoordBuffer2[num].numItems = ThingsData.vertexTextureCoords.length / 2

  ThingsVertexPositionBuffer2[num].data = gl2.createBuffer()
  gl2.bindBuffer(gl2.ARRAY_BUFFER, ThingsVertexPositionBuffer2[num].data)
  gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array(ThingsData.vertexPositions), gl2.STATIC_DRAW)
  ThingsVertexPositionBuffer2[num].itemSize = 3
  ThingsVertexPositionBuffer2[num].numItems = ThingsData.vertexPositions.length / 3

  ThingsVertexIndexBuffer2[num].data = gl2.createBuffer()
  gl2.bindBuffer(gl2.ELEMENT_ARRAY_BUFFER, ThingsVertexIndexBuffer2[num].data)
  gl2.bufferData(gl2.ELEMENT_ARRAY_BUFFER, new Uint16Array(ThingsData.indices), gl2.STATIC_DRAW)
  ThingsVertexIndexBuffer2[num].itemSize = 1
  ThingsVertexIndexBuffer2[num].numItems = ThingsData.indices.length
}

function LoadingAll () {
  loadThings('model/lamp.json', 0)
  loadThings('model/sofa.json', 1)
  loadThings('model/TV.json', 2)
  loadThings('model/CoffeeTable.json', 3)
  loadThings('model/shelf.json', 4)
  loadThings('model/vase.json', 5)
  loadThings('model/Teapot.json', 6)
  loadThings('model/Airconditioning.json', 7)
  loadThings('model/wardrobe.json', 8)
  loadThings('model/bed.json', 9)
  loadThings('model/cabinet.json', 10)
  loadThings('model/switch.json', 11)
  loadThings('model/telephone.json', 12)
  loadThings('model/PC.json', 13)
  loadThings('model/table3.json', 14)
  loadThings('model/lamp2.json', 15)
  loadThings('model/bed2.json', 16)
  loadThings('model/Airconditioning2.json', 17)
  loadThings('model/Airconditioning3.json', 18)
  loadThings('model/CoffeeTable2.json', 19)
  loadThings('model/cabinet2.json', 20)
  loadThings('model/sofa2.json', 21)
  loadThings('model/sofa3.json', 22)
  loadThings('model/macbook.json', 23)
  loadThings('model/chair.json', 24)
  loadThings('model/chair2.json', 25)
  loadThings('model/chair3.json', 26)
  loadThings('model/wardrobe2.json', 27)
  loadThings('model/wardrobe3.json', 28)
  loadThings('model/vase2.json', 29)
  loadThings('model/Decorations.json', 30)
  loadThings('model/Decorations2.json', 31)
  loadThings('model/Decorations3.json', 32)
  loadThings('model/books.json', 33)
  loadThings('model/Trashcan.json', 34)
  loadThings('model/table.json', 35)
  loadThings('model/table2.json', 36)
  loadThings('model/frame.json', 37)
  loadThings('model/door.json', 38)
}
