var gizmoReady = false
var gizmoDragAxis = null
var gizmoLastHit = null
var gizmoBaseLen = 0.9
var gizmoPickPixels = 16

var gizmoPositionBuffer = null
var gizmoNormalBuffer = null
var gizmoTexCoordBuffer = null
var gizmoIndexBuffer = null
var gizmoTextures = { x: null, y: null, z: null }

function createSolidTexture (r, g, b) {
  var tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([r, g, b, 255]))
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  return tex
}

function initGizmo () {
  if (!gl || gizmoReady) return

  // 沿 +X 的箭头：细杆 + 锥尖
  var positions = []
  var normals = []
  var texCoords = []
  var indices = []

  function pushBox (x0, y0, z0, x1, y1, z1) {
    var base = positions.length / 3
    var corners = [
      [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0],
      [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]
    ]
    for (var i = 0; i < corners.length; i++) {
      positions.push(corners[i][0], corners[i][1], corners[i][2])
      normals.push(0, 1, 0)
      texCoords.push(0, 0)
    }
    var faces = [
      [0, 1, 2, 0, 2, 3],
      [4, 6, 5, 4, 7, 6],
      [0, 4, 5, 0, 5, 1],
      [1, 5, 6, 1, 6, 2],
      [2, 6, 7, 2, 7, 3],
      [3, 7, 4, 3, 4, 0]
    ]
    for (var f = 0; f < faces.length; f++) {
      for (var k = 0; k < 6; k++) indices.push(base + faces[f][k])
    }
  }

  function pushCone (x0, x1, radius) {
    var segments = 8
    var tip = positions.length / 3
    positions.push(x1, 0, 0)
    normals.push(1, 0, 0)
    texCoords.push(0, 0)
    var ringStart = positions.length / 3
    for (var i = 0; i < segments; i++) {
      var a = (i / segments) * Math.PI * 2
      positions.push(x0, Math.cos(a) * radius, Math.sin(a) * radius)
      normals.push(0, Math.cos(a), Math.sin(a))
      texCoords.push(0, 0)
    }
    for (var j = 0; j < segments; j++) {
      indices.push(tip, ringStart + j, ringStart + ((j + 1) % segments))
    }
  }

  pushBox(0, -0.035, -0.035, 0.68, 0.035, 0.035)
  pushCone(0.68, 1.0, 0.1)

  gizmoPositionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, gizmoPositionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
  gizmoPositionBuffer.itemSize = 3
  gizmoPositionBuffer.numItems = positions.length / 3

  gizmoNormalBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, gizmoNormalBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW)
  gizmoNormalBuffer.itemSize = 3
  gizmoNormalBuffer.numItems = normals.length / 3

  gizmoTexCoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, gizmoTexCoordBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW)
  gizmoTexCoordBuffer.itemSize = 2
  gizmoTexCoordBuffer.numItems = texCoords.length / 2

  gizmoIndexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gizmoIndexBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
  gizmoIndexBuffer.itemSize = 1
  gizmoIndexBuffer.numItems = indices.length

  gizmoTextures.x = createSolidTexture(230, 64, 64)
  gizmoTextures.y = createSolidTexture(64, 200, 80)
  gizmoTextures.z = createSolidTexture(64, 120, 230)
  gizmoReady = true
}

function isObjectSelected () {
  return !!(mouseDown[selectedi] && mouseDown[selectedi][selectedj] && leftkey)
}

function clearObjectSelection () {
  if (mouseDown[selectedi] && mouseDown[selectedi][selectedj]) {
    mouseDown[selectedi][selectedj] = false
  }
  leftkey = 0
  endGizmoDrag()
}

function getGizmoOrigin () {
  var cur = coordinate(selectedi, selectedj)
  return [parseFloat(cur[0]), parseFloat(cur[1]), parseFloat(cur[2])]
}

function getGizmoScale () {
  var o = getGizmoOrigin()
  var dx = o[0] - xPos
  var dy = o[1] - yPos
  var dz = o[2] - zPos
  var dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
  return Math.max(0.45, Math.min(2.2, dist * 0.14))
}

function getCameraViewMatrixTemp () {
  var m = mat4.create()
  mat4.identity(m)
  mat4.rotate(m, degToRad(-pitch), [1, 0, 0])
  mat4.rotate(m, degToRad(-yaw), [0, 1, 0])
  mat4.translate(m, [-xPos, -yPos, -zPos])
  return m
}

function projectWorldToScreen01 (wx, wy, wz) {
  var view = getCameraViewMatrixTemp()
  var eye = mat4.multiplyVec4(view, [wx, wy, wz, 1], [])
  var proj = mat4.create()
  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, proj)
  var clip = mat4.multiplyVec4(proj, eye, [])
  if (clip[3] === 0) return null
  return [
    (clip[0] / clip[3]) * 0.5 + 0.5,
    (clip[1] / clip[3]) * 0.5 + 0.5,
    clip[2] / clip[3]
  ]
}

function distPointToSegment2D (px, py, x1, y1, x2, y2) {
  var dx = x2 - x1
  var dy = y2 - y1
  var len2 = dx * dx + dy * dy
  if (len2 < 1e-8) {
    dx = px - x1
    dy = py - y1
    return Math.sqrt(dx * dx + dy * dy)
  }
  var t = ((px - x1) * dx + (py - y1) * dy) / len2
  if (t < 0) t = 0
  if (t > 1) t = 1
  var qx = x1 + t * dx
  var qy = y1 + t * dy
  dx = px - qx
  dy = py - qy
  return Math.sqrt(dx * dx + dy * dy)
}

function getAxisVector (axis) {
  if (axis === 'x') return [1, 0, 0]
  if (axis === 'y') return [0, 1, 0]
  return [0, 0, 1]
}

function pickGizmoAxis (nx, ny) {
  if (!isObjectSelected() || !gl) return null
  var o = getGizmoOrigin()
  var scale = getGizmoScale()
  var len = gizmoBaseLen * scale
  var axes = ['x', 'y', 'z']
  var dirs = [[len, 0, 0], [0, len, 0], [0, 0, len]]
  var best = null
  var bestDist = gizmoPickPixels / Math.min(gl.viewportWidth, gl.viewportHeight)

  for (var i = 0; i < 3; i++) {
    var a = projectWorldToScreen01(o[0], o[1], o[2])
    var b = projectWorldToScreen01(o[0] + dirs[i][0], o[1] + dirs[i][1], o[2] + dirs[i][2])
    if (!a || !b) continue
    if (a[2] < -1 || a[2] > 1 || b[2] < -1 || b[2] > 1) continue
    var d = distPointToSegment2D(nx, ny, a[0], a[1], b[0], b[1])
    if (d < bestDist) {
      bestDist = d
      best = axes[i]
    }
  }
  return best
}

function getMouseWorldRay (event) {
  var ndc = getCanvasMouseNDC(event)
  var aspect = gl.viewportWidth / gl.viewportHeight
  var tanHalf = Math.tan(degToRad(45 / 2))
  var dir = [ndc[0] * aspect * tanHalf, ndc[1] * tanHalf, -1]
  dir = rotateVecX(dir, degToRad(pitch))
  dir = rotateVecY(dir, degToRad(yaw))
  var len = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1] + dir[2] * dir[2]) || 1
  return {
    origin: [xPos, yPos, zPos],
    dir: [dir[0] / len, dir[1] / len, dir[2] / len]
  }
}

function hitAxisDragPlane (event, axis) {
  var ray = getMouseWorldRay(event)
  var o = getGizmoOrigin()
  var axisDir = getAxisVector(axis)
  var toCam = [xPos - o[0], yPos - o[1], zPos - o[2]]
  // 平面包含轴向且尽量朝向镜头
  var tmp = [
    axisDir[1] * toCam[2] - axisDir[2] * toCam[1],
    axisDir[2] * toCam[0] - axisDir[0] * toCam[2],
    axisDir[0] * toCam[1] - axisDir[1] * toCam[0]
  ]
  var planeN = [
    tmp[1] * axisDir[2] - tmp[2] * axisDir[1],
    tmp[2] * axisDir[0] - tmp[0] * axisDir[2],
    tmp[0] * axisDir[1] - tmp[1] * axisDir[0]
  ]
  var nLen = Math.sqrt(planeN[0] * planeN[0] + planeN[1] * planeN[1] + planeN[2] * planeN[2])
  if (nLen < 1e-5) planeN = [0, 1, 0]
  else {
    planeN[0] /= nLen
    planeN[1] /= nLen
    planeN[2] /= nLen
  }

  var denom = ray.dir[0] * planeN[0] + ray.dir[1] * planeN[1] + ray.dir[2] * planeN[2]
  if (Math.abs(denom) < 1e-5) return null
  var w = [o[0] - ray.origin[0], o[1] - ray.origin[1], o[2] - ray.origin[2]]
  var t = (w[0] * planeN[0] + w[1] * planeN[1] + w[2] * planeN[2]) / denom
  if (t < 0) return null
  return [
    ray.origin[0] + ray.dir[0] * t,
    ray.origin[1] + ray.dir[1] * t,
    ray.origin[2] + ray.dir[2] * t
  ]
}

function beginGizmoDrag (axis, event) {
  gizmoDragAxis = axis
  gizmoLastHit = hitAxisDragPlane(event, axis)
  lagelapsedtozero()
  oldi = selectedi
  oldj = selectedj
  old = coordinate(selectedi, selectedj)
  canceltype = 1
  CancelPush()
}

function updateGizmoDrag (event) {
  if (!gizmoDragAxis || !isObjectSelected()) return
  var hit = hitAxisDragPlane(event, gizmoDragAxis)
  if (!hit) return
  if (!gizmoLastHit) {
    gizmoLastHit = hit
    return
  }
  var axis = getAxisVector(gizmoDragAxis)
  var delta =
    (hit[0] - gizmoLastHit[0]) * axis[0] +
    (hit[1] - gizmoLastHit[1]) * axis[1] +
    (hit[2] - gizmoLastHit[2]) * axis[2]
  if (delta !== 0) {
    mat4.translate(translateMatrix[selectedi][selectedj], [
      axis[0] * delta,
      axis[1] * delta,
      axis[2] * delta
    ])
    lagelapsedtozero()
  }
  gizmoLastHit = hit
}

function endGizmoDrag () {
  gizmoDragAxis = null
  gizmoLastHit = null
}

function drawOneGizmoArrow (axis, texture) {
  mvPushMatrix()
  if (axis === 'y') mat4.rotate(mvMatrix, degToRad(90), [0, 0, 1])
  if (axis === 'z') mat4.rotate(mvMatrix, degToRad(-90), [0, 1, 0])

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.uniform1i(shaderProgram.samplerUniform, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, gizmoPositionBuffer)
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, gizmoPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)
  gl.bindBuffer(gl.ARRAY_BUFFER, gizmoNormalBuffer)
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, gizmoNormalBuffer.itemSize, gl.FLOAT, false, 0, 0)
  gl.bindBuffer(gl.ARRAY_BUFFER, gizmoTexCoordBuffer)
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, gizmoTexCoordBuffer.itemSize, gl.FLOAT, false, 0, 0)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gizmoIndexBuffer)
  setMatrixUniforms()
  gl.drawElements(gl.TRIANGLES, gizmoIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0)
  mvPopMatrix()
}

function drawGizmo () {
  if (!isObjectSelected()) return
  if (typeof shadowProgram !== 'undefined' && shaderProgram === shadowProgram) return
  if (!gizmoReady) initGizmo()
  if (!gizmoReady) return

  var o = getGizmoOrigin()
  var scale = getGizmoScale()

  mvPushMatrix()
  mat4.translate(mvMatrix, o)
  mat4.scale(mvMatrix, [gizmoBaseLen * scale, gizmoBaseLen * scale, gizmoBaseLen * scale])

  gl.disable(gl.DEPTH_TEST)
  gl.uniform1i(shaderProgram.useLightingUniform, 0)
  gl.uniform1i(shaderProgram.useTexturesUniform, 1)
  if (typeof bindShadowUniforms === 'function') bindShadowUniforms(false)

  drawOneGizmoArrow('x', gizmoTextures.x)
  drawOneGizmoArrow('y', gizmoTextures.y)
  drawOneGizmoArrow('z', gizmoTextures.z)

  gl.enable(gl.DEPTH_TEST)
  gl.uniform1i(shaderProgram.useLightingUniform, lighting ? 1 : 0)
  if (typeof bindShadowUniforms === 'function') bindShadowUniforms(!!lighting)
  mvPopMatrix()
}
