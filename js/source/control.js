/*
A 65 J 74 S 83 1 49 
B 66 K 75 T 84 2 50 
C 67 L 76 U 85 3 51 
D 68 M 77 V 86 4 52 
E 69 N 78 W 87 5 53 
F 70 O 79 X 88 6 54 
G 71 P 80 Y 89 7 55 
H 72 Q 81 Z 90 8 56 
I 73 R 82 0 48 9 57 
*/

var lastMouseX = null
var lastMouseY = null
var selectedi = 0
var selectedj = 1
var leftkey = 0
var rightkey = 0
var dragGrabOffsetX = 0
var dragGrabOffsetZ = 0
var dragPendingRecenter = false

var currentlyPressedKeys = {}
var lookSensitivity = 0.14
var walkSpeed = 0.0045
var walkSpeedBoost = 0.007

function isViewPointerLocked () {
  var canvas = document.getElementById('view')
  if (!canvas) return false
  return document.pointerLockElement === canvas ||
    document.mozPointerLockElement === canvas ||
    document.webkitPointerLockElement === canvas
}

function requestViewPointerLock () {
  var canvas = document.getElementById('view')
  if (!canvas || isViewPointerLocked()) return
  if (canvas.requestPointerLock) canvas.requestPointerLock()
  else if (canvas.mozRequestPointerLock) canvas.mozRequestPointerLock()
  else if (canvas.webkitRequestPointerLock) canvas.webkitRequestPointerLock()
}

function exitViewPointerLock () {
  if (!isViewPointerLocked()) return
  if (document.exitPointerLock) document.exitPointerLock()
  else if (document.mozExitPointerLock) document.mozExitPointerLock()
  else if (document.webkitExitPointerLock) document.webkitExitPointerLock()
}

function updatePointerLockUI () {
  var locked = isViewPointerLocked()
  var crosshair = document.getElementById('crosshair')
  var tips = document.getElementById('tips')
  if (crosshair) {
    // 准星对准主画布中心
    if (locked) {
      crosshair.style.display = 'block'
      crosshair.style.left = (viewLayoutLeft + viewLayoutWidth / 2) + 'px'
      crosshair.style.top = (viewLayoutTop + viewLayoutHeight / 2) + 'px'
    } else {
      crosshair.style.display = 'none'
    }
  }
  if (tips) {
    tips.textContent = locked
      ? 'Tips: 鼠标视角中。WASD 移动，QE 平移，Shift 加速，ESC 退出锁定。准星对准物体点击可选中。'
      : 'Tips: 点击画面进入鼠标视角（类游戏），ESC 退出。WASD 移动，QE 平移，Shift 加速。选中物品后可用 T/G 缩放。'
  }
}

function applyMouseLook (dx, dy) {
  yaw -= dx * lookSensitivity
  var nextPitch = pitch - dy * lookSensitivity
  if (nextPitch <= 75 && nextPitch >= -75) {
    pitch = nextPitch
  }
  yawRate2 = 0
  pitchRate = 0
}

function getCanvasMouseNDC (event) {
  var canvas = document.getElementById('view')
  var rect = canvas.getBoundingClientRect()
  var nx = ((event.clientX - rect.left) / rect.width) * 2 - 1
  var ny = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
  return [nx, ny]
}

function getCanvasMouseNorm (event) {
  var canvas = document.getElementById('view')
  var rect = canvas.getBoundingClientRect()
  var x = (event.clientX - rect.left) / rect.width
  var y = 1 - (event.clientY - rect.top) / rect.height
  return [x, y]
}

function rotateVecX (v, angle) {
  var c = Math.cos(angle)
  var s = Math.sin(angle)
  return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c]
}

function rotateVecY (v, angle) {
  var c = Math.cos(angle)
  var s = Math.sin(angle)
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c]
}

// 鼠标射线与水平面 y = planeY 求交，用于拖拽跟手
function mouseHitOnHorizontalPlaneNDC (nx, ny, planeY) {
  var aspect = gl.viewportWidth / gl.viewportHeight
  var tanHalf = Math.tan(degToRad(45 / 2))
  var dir = [nx * aspect * tanHalf, ny * tanHalf, -1]

  // 与相机矩阵 Rx(-pitch)*Ry(-yaw)*T 对应：眼空间方向转回世界空间
  dir = rotateVecX(dir, degToRad(pitch))
  dir = rotateVecY(dir, degToRad(yaw))

  var len = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1] + dir[2] * dir[2]) || 1
  dir[0] /= len
  dir[1] /= len
  dir[2] /= len

  if (Math.abs(dir[1]) < 0.0001) return null
  var t = (planeY - yPos) / dir[1]
  if (t < 0) return null
  return [xPos + dir[0] * t, planeY, zPos + dir[2] * t]
}

function mouseHitOnHorizontalPlane (event, planeY) {
  var ndc = getCanvasMouseNDC(event)
  return mouseHitOnHorizontalPlaneNDC(ndc[0], ndc[1], planeY)
}

function isMouseOverCanvas (event) {
  var canvas = document.getElementById('view')
  if (!canvas) return false
  var rect = canvas.getBoundingClientRect()
  return event.clientX >= rect.left && event.clientX <= rect.right &&
    event.clientY >= rect.top && event.clientY <= rect.bottom
}

// 记录点击点相对物体原点的偏移，选中时不移动物体
function beginDragGrab (event, useCanvasCenter) {
  var cur = coordinate(selectedi, selectedj)
  var planeY = parseFloat(cur[1])
  var hit = useCanvasCenter
    ? mouseHitOnHorizontalPlaneNDC(0, 0, planeY)
    : mouseHitOnHorizontalPlane(event, planeY)
  if (!hit) {
    dragGrabOffsetX = 0
    dragGrabOffsetZ = 0
    return
  }
  dragGrabOffsetX = parseFloat(cur[0]) - hit[0]
  dragGrabOffsetZ = parseFloat(cur[2]) - hit[2]
}

function dragSelectedToMouse (event) {
  if (!isMouseOverCanvas(event)) return

  var cur = coordinate(selectedi, selectedj)
  var planeY = parseFloat(cur[1])
  var hit = mouseHitOnHorizontalPlane(event, planeY)
  if (!hit) return

  var targetX = hit[0] + dragGrabOffsetX
  var targetZ = hit[2] + dragGrabOffsetZ
  var dx = targetX - parseFloat(cur[0])
  var dz = targetZ - parseFloat(cur[2])
  if (dx === 0 && dz === 0) return
  mat4.translate(translateMatrix[selectedi][selectedj], [dx, 0, dz])

  var norm = getCanvasMouseNorm(event)
  lastMouseX = norm[0]
  lastMouseY = norm[1]
}

function handleKeyDown (event) {
  if (keyevent) // && viewstyle
  {
    currentlyPressedKeys[event.keyCode] = true

    if (event.keyCode == 84 && mouseDown[selectedi][selectedj] && leftkey) // 按键T
    {
      lagelapsedtozero()
      translateScale[selectedi][selectedj] = [translateScale[selectedi][selectedj][0] + 0.1, translateScale[selectedi][selectedj][1] + 0.1, translateScale[selectedi][selectedj][2] + 0.1]
    }

    if (event.keyCode == 71 && mouseDown[selectedi][selectedj] && leftkey) // 按键G
    {
      lagelapsedtozero()
      translateScale[selectedi][selectedj] = [translateScale[selectedi][selectedj][0] - 0.1, translateScale[selectedi][selectedj][1] - 0.1, translateScale[selectedi][selectedj][2] - 0.1]
    }

    if (event.keyCode == 27) // ESC
    {
      exitViewPointerLock()
    }

    if (event.keyCode == 80) // P
    {
      tapmode()
    }

    if (event.keyCode == 79) // O
    {
      changetestmode()
    }

    if (testmode) {
      if (event.keyCode == 76) // l
      {
        lighting = !lighting
      }

      if (event.keyCode == 33) // 按键pageup
      {
        pointlight = [pointlight[0], pointlight[1] + 0.1, pointlight[2]]
      } else {
      }
      if (event.keyCode == 34) // pagedown
      {
        pointlight = [pointlight[0], pointlight[1] - 0.1, pointlight[2]]
      } else {
      }
      if (event.keyCode == 38) // up
      {
        pointlight = [pointlight[0] + 0.1, pointlight[1], pointlight[2]]
      } else {
      }
      if (event.keyCode == 40) // down
      {
        pointlight = [pointlight[0] - 0.1, pointlight[1], pointlight[2]]
      } else {
      }
      if (event.keyCode == 37) // left
      {
        pointlight = [pointlight[0], pointlight[1], pointlight[2] + 0.1]
      } else {
      }
      if (event.keyCode == 39) // right
      {
        pointlight = [pointlight[0], pointlight[1], pointlight[2] - 0.1]
      } else {
      }
    }
  }
}

function handleKeyUp (event) {
  currentlyPressedKeys[event.keyCode] = false
}

function handleKeys () {
  if (currentlyPressedKeys[32]) { // 空格
    jumping = 1
  } else {
    jumping = 0
  }

  if (currentlyPressedKeys[65] && viewstyle) {
    // Left cursor key or A
    yawRate = 0.12
    if (currentlyPressedKeys[16]) yawRate += 0.1
  } else if (currentlyPressedKeys[68] && viewstyle) {
    // Right cursor key or D
    yawRate = -0.12
    if (currentlyPressedKeys[16]) yawRate -= 0.1
  } else {
    yawRate = 0
  }

  if (currentlyPressedKeys[87]) {
    // Up cursor key or W
    speed = walkSpeed
    if (currentlyPressedKeys[16]) speed += walkSpeedBoost
  } else if (currentlyPressedKeys[83]) {
    // Down cursor key
    speed = -walkSpeed
    if (currentlyPressedKeys[16]) speed -= walkSpeedBoost
  } else {
    speed = 0
  }

  if (currentlyPressedKeys[81] || (!viewstyle && currentlyPressedKeys[65])) {
    // Q
    speed2 = walkSpeed
    if (currentlyPressedKeys[16]) speed2 += walkSpeedBoost
  } else if (currentlyPressedKeys[69] || (!viewstyle && currentlyPressedKeys[68])) {
    // E
    speed2 = -walkSpeed
    if (currentlyPressedKeys[16]) speed2 -= walkSpeedBoost
  } else {
    speed2 = 0
  }
}

function handleMouseMove (event) {
  if (mouseDown[selectedi][selectedj] && leftkey) {
    lagelapsedtozero()
    // 按鼠标射线与物体高度平面求交，使物体跟手
    if (!isViewPointerLocked()) {
      // 刚退出指针锁定时，先用真实光标重算抓取点，避免瞬移
      if (dragPendingRecenter) {
        beginDragGrab(event, false)
        dragPendingRecenter = false
        return
      }
      dragSelectedToMouse(event)
    } else {
      // 锁定指针时仍用相对位移（无绝对光标）
      var scale = 0.02
      var mx = event.movementX || event.mozMovementX || 0
      var my = event.movementY || event.mozMovementY || 0
      mat4.translate(translateMatrix[selectedi][selectedj], [
        mx * scale * Math.cos(-degToRad(yaw)),
        0,
        mx * scale * Math.sin(-degToRad(yaw))
      ])
      // 前后移动：结合视角朝向
      mat4.translate(translateMatrix[selectedi][selectedj], [
        -my * scale * Math.sin(degToRad(yaw)),
        0,
        -my * scale * Math.cos(degToRad(yaw))
      ])
    }
    return
  }

  // 游戏式鼠标视角：指针锁定后用相对位移转向
  if (isViewPointerLocked()) {
    var lookX = event.movementX || event.mozMovementX || 0
    var lookY = event.movementY || event.mozMovementY || 0
    if (lookX !== 0 || lookY !== 0) applyMouseLook(lookX, lookY)
  }
}

function handleMouseDown (event) {
  if (document.getElementById('roomnameInputArea').style.display !== 'none') {
    finishroomname()
  }

  var pickingFromCenter = isViewPointerLocked()
  if (pickingFromCenter) {
    lastMouseX = 0.5
    lastMouseY = 0.5
  } else {
    var norm = getCanvasMouseNorm(event)
    lastMouseX = norm[0]
    lastMouseY = norm[1]
  }

  if (!mouseDown[selectedi][selectedj] || (ControlMode == 1) || (event.button == 2)) {
    if (event.button == 2) {
      mouseDown[selectedi][selectedj] = false
      leftkey = 0
    }
    ThingsOnClick(event)
    ThingsOnRightClick(event)

    if (event.button == 0) {
      if (mouseDown[selectedi][selectedj] && leftkey) {
        // 选中物体时退出锁定，方便拖拽编辑；只记录抓取偏移，不瞬移
        exitViewPointerLock()
        beginDragGrab(event, pickingFromCenter)
        dragPendingRecenter = pickingFromCenter
      } else if (viewstyle) {
        // 点空地进入游戏视角
        requestViewPointerLock()
      }
    }
  } else {
    mouseDown[selectedi][selectedj] = false
    leftkey = 0
    dragPendingRecenter = false
  }
}

function handleMouseUp (event) {
  if (ControlMode == 1) {
    mouseDown[selectedi][selectedj] = false
    leftkey = 0
    dragPendingRecenter = false
  }
}

function handleMouseWheel (event) {
  if (mouseDown[selectedi][selectedj] && leftkey) {
    lagelapsedtozero()
    var direct = 0
    if (event.wheelDelta) {
      direct = event.wheelDelta > 0 ? 1 : -1
    }
    else if (typeof event.deltaY === 'number' && event.deltaY !== 0) {
      direct = event.deltaY < 0 ? 1 : -1
    }
    else if (event.detail) {
      direct = event.detail < 0 ? 1 : -1
    }
    var newTranslateMatrix = mat4.create()
    mat4.identity(newTranslateMatrix)
    mat4.translate(newTranslateMatrix, [-0.08 * direct * Math.sin(degToRad(yaw)), 0, -0.08 * direct * Math.cos(degToRad(yaw))])
    mat4.multiply(newTranslateMatrix, translateMatrix[selectedi][selectedj], translateMatrix[selectedi][selectedj])
  }
}

function handleContextMenu (event) {
  event.preventDefault()
}

function initPointerLockControls () {
  var onLockChange = function () {
    updatePointerLockUI()
  }
  document.addEventListener('pointerlockchange', onLockChange, false)
  document.addEventListener('mozpointerlockchange', onLockChange, false)
  document.addEventListener('webkitpointerlockchange', onLockChange, false)
  updatePointerLockUI()
}
