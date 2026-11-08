var wallVertexPositionBuffer = Array()
var wallVertexTextureCoordBuffer = Array()
var wallVertexNormalBuffer = Array()
var floorVertexPositionBuffer = Array()
var floorVertexTextureCoordBuffer = Array()
var floorVertexNormalBuffer = Array()
var ceilingVertexPositionBuffer = Array()
var ceilingVertexTextureCoordBuffer = Array()
var ceilingVertexNormalBuffer = Array()
var doorVertexPositionBuffer = { }
var doorVertexTextureCoordBuffer = { }
var doorVertexNormalBuffer = { }
for (var i = 0; i <= 19; i++) {
  wallVertexPositionBuffer[i] = Array()
  wallVertexTextureCoordBuffer[i] = Array()
  wallVertexNormalBuffer[i] = Array()
  floorVertexPositionBuffer[i] = Array()
  floorVertexTextureCoordBuffer[i] = Array()
  floorVertexNormalBuffer[i] = Array()
  ceilingVertexPositionBuffer[i] = Array()
  ceilingVertexTextureCoordBuffer[i] = Array()
  ceilingVertexNormalBuffer[i] = Array()
}

for (var i = 0; i <= 19; i++) {
  for (var j = 0; j <= 19; j++) {
    wallVertexPositionBuffer[i][j] = { }
    wallVertexTextureCoordBuffer[i][j] = { }
    wallVertexNormalBuffer[i][j] = { }
    floorVertexPositionBuffer[i][j] = { }
    floorVertexTextureCoordBuffer[i][j] = { }
    floorVertexNormalBuffer[i][j] = { }
    ceilingVertexPositionBuffer[i][j] = { }
    ceilingVertexTextureCoordBuffer[i][j] = { }
    ceilingVertexNormalBuffer[i][j] = { }
  }
}

function computeTriangleNormals (vertexPositions) {
  var normals = []
  for (var i = 0; i + 8 < vertexPositions.length; i += 9) {
    var ax = vertexPositions[i]
    var ay = vertexPositions[i + 1]
    var az = vertexPositions[i + 2]
    var bx = vertexPositions[i + 3]
    var by = vertexPositions[i + 4]
    var bz = vertexPositions[i + 5]
    var cx = vertexPositions[i + 6]
    var cy = vertexPositions[i + 7]
    var cz = vertexPositions[i + 8]

    var ux = bx - ax
    var uy = by - ay
    var uz = bz - az
    var vx = cx - ax
    var vy = cy - ay
    var vz = cz - az

    var nx = uy * vz - uz * vy
    var ny = uz * vx - ux * vz
    var nz = ux * vy - uy * vx
    var len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1
    nx /= len
    ny /= len
    nz /= len

    for (var k = 0; k < 3; k++) {
      normals.push(nx, ny, nz)
    }
  }
  return normals
}

function parseRoomMesh (data) {
  var lines = data.split('\n')
  var vertexCount = 0
  var vertexPositions = []
  var vertexTextureCoords = []

  for (var i in lines) {
    var vals = lines[i].split(' ')
    if (vals[0] != '//' && vals.length >= 5) {
      vertexPositions.push(parseFloat(vals[0]))
      vertexPositions.push(parseFloat(vals[1]))
      vertexPositions.push(parseFloat(vals[2]))
      vertexTextureCoords.push(parseFloat(vals[3]))
      vertexTextureCoords.push(parseFloat(vals[4]))
      vertexCount += 1
    }
  }

  return {
    vertexCount: vertexCount,
    vertexPositions: vertexPositions,
    vertexTextureCoords: vertexTextureCoords,
    vertexNormals: computeTriangleNormals(vertexPositions)
  }
}

function uploadRoomMesh (positionBuffer, texBuffer, normalBuffer, mesh) {
  positionBuffer.data = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer.data)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertexPositions), gl.STATIC_DRAW)
  positionBuffer.itemSize = 3
  positionBuffer.numItems = mesh.vertexCount

  texBuffer.data = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer.data)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertexTextureCoords), gl.STATIC_DRAW)
  texBuffer.itemSize = 2
  texBuffer.numItems = mesh.vertexCount

  normalBuffer.data = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer.data)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.vertexNormals), gl.STATIC_DRAW)
  normalBuffer.itemSize = 3
  normalBuffer.numItems = mesh.vertexCount
}

function loadRoom () {
  for (var i = 0; i <= 19; i++)
    for (var j = 0; j <= 19; j++) {
      handleLoadedWall(i, j)
      handleLoadedFloor(i, j)
      handleLoadedCeiling(i, j)
  }

  handleLoadedDoor()
  document.getElementById('loadingtext').textContent = '房间载入完成，正在载入其他非模型物体..'
}

function handleLoadedWall (wi, wj) {
  var mesh = parseRoomMesh(buildwall(wi - 10, wj - 10))
  uploadRoomMesh(wallVertexPositionBuffer[wi][wj], wallVertexTextureCoordBuffer[wi][wj], wallVertexNormalBuffer[wi][wj], mesh)
}

function handleLoadedFloor (fi, fj) {
  var mesh = parseRoomMesh(buildfloor(fi - 10, fj - 10))
  uploadRoomMesh(floorVertexPositionBuffer[fi][fj], floorVertexTextureCoordBuffer[fi][fj], floorVertexNormalBuffer[fi][fj], mesh)
}

function handleLoadedCeiling (ci, cj) {
  var mesh = parseRoomMesh(buildceiling(ci - 10, cj - 10))
  uploadRoomMesh(ceilingVertexPositionBuffer[ci][cj], ceilingVertexTextureCoordBuffer[ci][cj], ceilingVertexNormalBuffer[ci][cj], mesh)
}

function handleLoadedDoor () {
  var mesh = parseRoomMesh(builddoor())
  uploadRoomMesh(doorVertexPositionBuffer, doorVertexTextureCoordBuffer, doorVertexNormalBuffer, mesh)
}
