var lastTime = 0
// Used to make us "jog" up and down as we move forward.
var joggingAngle = 0
var lastXPos = 0
var lastZPos = 0
// var flagPos = false
var change = Array()
var onloadTVtexture = Array()
var duration = 0
// 单帧时间上限，避免切回标签页/卡顿后镜头瞬移
var MAX_FRAME_ELAPSED = 50

for (var i = 1; i <= numofTVchannel; i++) {
  change[i] = 1
}
var sumelapsed = 0
function animate () {
  var timeNow = new Date().getTime()

  if (lastTime != 0) {
    var elapsed = timeNow - lastTime
    if (elapsed > MAX_FRAME_ELAPSED) elapsed = MAX_FRAME_ELAPSED
    if (elapsed < 0) elapsed = 0

    var moving = (speed != 0) || (speed2 != 0)

    if (speed != 0) {
      lastXPos = xPos
      lastZPos = zPos

      xPos -= Math.sin(degToRad(yaw)) * speed * elapsed
      zPos -= Math.cos(degToRad(yaw)) * speed * elapsed

      cameraCD()
    }

    if (speed2 != 0) {
      lastXPos = xPos
      lastZPos = zPos

      xPos -= Math.sin(degToRad(90 + yaw)) * speed2 * elapsed
      zPos -= Math.cos(degToRad(90 + yaw)) * speed2 * elapsed

      cameraCD()
    }

    // 行走晃动每帧只更新一次，避免 WASD 斜走时双重叠加造成跳变
    if (viewstyle) {
      if (moving || jumping) {
        joggingAngle += elapsed * 0.6
        if (joggingAngle > 360) joggingAngle -= 360
        yPos = Math.sin(degToRad(joggingAngle)) / 20 + viewheight
      } else {
        // 停下后平滑回落到正常视高，避免停在峰值突然复位
        var bob = yPos - viewheight
        if (Math.abs(bob) > 0.0005) {
          yPos -= bob * Math.min(1, elapsed * 0.02)
        } else {
          yPos = viewheight
          joggingAngle = 0
        }
      }
    }

    yaw += yawRate * elapsed + yawRate2 * elapsed * (10 / 15)

    if (pitch + pitchRate * elapsed <= 75 && pitch + pitchRate * elapsed >= -75) {
      pitch += pitchRate * elapsed
    }

    if (sumelapsed >= (1000 / 8)) {
      for (var i = 1; i <= numofTVchannel; i++) {
        change[i] += 1
        if (change[i] > PicturesOfChannel[i]) change[i] = 1
        refreshTVtexture(i)
      }
      sumelapsed = 0
    }else {
      sumelapsed += elapsed
    }

    duration += elapsed

    if (document.getElementById('promptAdd').style.display == 'block') {
      document.getElementById('promptAdd').style.top = 140 + 10 * Math.sin(degToRad(duration / 1000 * 180))
    }

    showplayer()
  }
  lastTime = timeNow
}
