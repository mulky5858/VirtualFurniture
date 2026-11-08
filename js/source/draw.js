/*
最主要的构建函数
*/

function drawScene () {
  gl.useProgram(shaderProgram)
  gl.uniform1i(shaderProgram.samplerUniform, 0)
  gl.uniform1i(shaderProgram.useLightingUniform, 0)
  gl.uniform1i(shaderProgram.useTexturesUniform, 1)

  // 略提高环境光，避免背光死黑；高光/法线负责木器质感
  gl.uniform3f(shaderProgram.ambientColorUniform, 0.17, 0.17, 0.17)
  if (typeof bindMaterialMaps === 'function') bindMaterialMaps(null)

  for (var k = 1; k <= numofTVchannel; k++) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer[k])
    drawSceneOnTVScreen(k)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix)

  mat4.identity(mvMatrix)

  mat4.rotate(mvMatrix, degToRad(-pitch), [1, 0, 0])
  mat4.rotate(mvMatrix, degToRad(-yaw), [0, 1, 0])
  mat4.translate(mvMatrix, [-xPos, -yPos, -zPos])

  // 按场景中的灯具收集点光源（无默认固定光）
  collectSceneLights()

  // 保存相机视图，供阴影矩阵 = lightPV * inverse(cameraView)
  var cameraView = mat4.create()
  mat4.set(mvMatrix, cameraView)

  var hasLamp = sceneLights.length > 0
  // 有灯且光照开启时，用第一盏灯做阴影贴图
  if (lighting && hasLamp) {
    drawShadowMap(cameraView)
    mat4.set(cameraView, mvMatrix)
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix)
    gl.useProgram(shaderProgram)
    gl.uniform1i(shaderProgram.samplerUniform, 0)
    gl.uniform1i(shaderProgram.useTexturesUniform, 1)
    gl.uniform3f(shaderProgram.ambientColorUniform, 0.17, 0.17, 0.17)
    if (typeof bindMaterialMaps === 'function') bindMaterialMaps(null)
  }

  bindSceneLightsEyeSpace(mvMatrix)

  if (testmode) {
    testoutput = '碰撞体积关闭。 灯具光源数： ' + sceneLights.length +
      (hasLamp ? (' 主灯： ' + pointlight[0].toFixed(3) + ',' + pointlight[1].toFixed(3) + ',' + pointlight[2].toFixed(3)) : '') +
      ' 人物坐标： ' + xPos.toFixed(3) + ',' + yPos.toFixed(3) + ',' + zPos.toFixed(3) +
      ' 左右转动角度： ' + yaw.toFixed(3) + ' 上下转动角度： ' + pitch.toFixed(3)
  }

  if (testmode) document.getElementById('test3').textContent = '点选的物品坐标为： ' + coordinate(selectedi, selectedj)
  else document.getElementById('test3').textContent = ''

  // 房间与家具统一受光照控制
  gl.uniform1i(shaderProgram.useLightingUniform, lighting ? 1 : 0)
  bindShadowUniforms(!!(lighting && hasLamp))

  drawroom()

  for (var i = 0; i <= NumberOfObjects - 1; i++) {
    draw(i)
  }

  // 选中物体时绘制 XYZ 位移箭头
  drawGizmo()

  // 测试模式：红色球体标出点光源位置
  drawLightMarker()

  gl2.useProgram(shaderProgram2)
  gl2.uniform1i(shaderProgram2.samplerUniform, 0)
  gl2.uniform1i(shaderProgram2.useLightingUniform, 1)
  gl2.uniform1i(shaderProgram2.useTexturesUniform, 1)
  gl2.uniform3f(shaderProgram2.ambientColorUniform, 0.4, 0.4, 0.4)
  gl2.uniform3f(shaderProgram2.pointLightingLocationUniform, 0, 2, 0)
  gl2.uniform3f(shaderProgram2.pointLightingColorUniform, brightness, brightness, brightness)

  gl2.viewport(0, 0, gl2.viewportWidth, gl2.viewportHeight)
  gl2.clear(gl2.COLOR_BUFFER_BIT | gl2.DEPTH_BUFFER_BIT)

  mat4.perspective(45, gl2.viewportWidth / gl2.viewportHeight, 0.1, 100.0, pMatrix2)

  mat4.identity(mvMatrix2)

  mat4.rotate(mvMatrix2, degToRad(-pitch_2), [1, 0, 0])
  mat4.rotate(mvMatrix2, degToRad(-yaw_2), [0, 1, 0])
  mat4.translate(mvMatrix2, [-xPos_2, -yPos_2, -zPos_2])

  gl2_rotateAngle += 0.5
  if (gl2_things >= 0) draw2(gl2_things)

  document.getElementById('loadingtext').textContent = '载入完成，感谢您的使用。若无法显示请尝试刷新。'

  document.getElementById('test').textContent = testoutput
}

var textureLoadStartedAt = 0
var modelLoadStartedAt = 0
function tick () {
  requestAnimFrame(tick)

  if (window.fileProtocolBlocked) {
    return
  }

  if (!TextureLoaded) {
    if (!textureLoadStartedAt) textureLoadStartedAt = new Date().getTime()

    var stillLoading = 0
    for (var i = 0; i <= NumberOfObjects - 1; i++) {
      for (var j = 0; j <= 5; j++) {
        if (ThingsTextureLoad[i][j] == false) stillLoading++
      }
    }

    // 超时保护：个别贴图既不触发 onload 也不触发 onerror 时不永远卡住
    if (stillLoading > 0 && new Date().getTime() - textureLoadStartedAt > 20000) {
      for (var ti = 0; ti <= NumberOfObjects - 1; ti++) {
        for (var tj = 0; tj <= 5; tj++) {
          ThingsTextureLoad[ti][tj] = true
        }
      }
      stillLoading = 0
    }

    TextureLoaded = stillLoading === 0 ? 1 : 0

    var pendingTotal = thingsTexturePending > 0 ? thingsTexturePending : 1
    var doneCount = Math.max(pendingTotal - stillLoading, 0)
    var percent = Math.floor(doneCount / pendingTotal * 95 + 5)
    document.getElementById('loadingtext').textContent = '正在载入贴图（' + percent + '%）'
    loadbarchange(Math.round(percent * 0.05))

    if (TextureLoaded && loadingtextureend) {
      loadingtextureend = 0
      loadRoom()
      LoadingAll()
    }
  }else {
    if (!ModleLoaded) {
      if (!modelLoadStartedAt) modelLoadStartedAt = new Date().getTime()

      var maxloaded = 0
      for (var i = 0; i <= NumberOfObjects - 1; i++) {
        if (ModleLoad[i]) maxloaded++
      }

      // 仅在完全无进度时超时，避免大模型下载中被误判
      if (maxloaded === 0 && new Date().getTime() - modelLoadStartedAt > 30000) {
        for (var mi = 0; mi <= NumberOfObjects - 1; mi++) {
          if (!ModleLoad[mi]) finishLoadThings(createEmptyModelData(), mi)
        }
        maxloaded = NumberOfObjects
      }

      ModleLoaded = maxloaded >= NumberOfObjects ? 1 : 0
      document.getElementById('loadingtext').textContent =
        '贴图载入完成，正在载入模型（' + Math.floor(100 / NumberOfObjects * maxloaded) + '%）'
      loadbarchange(Math.round(Math.floor(100 / NumberOfObjects * maxloaded) * 0.05) + 5)
    }else {
      if (loadingend) {
        loadingend = 0
        refreshwebsite()
        inputstream('input/empty.txt')

        for (var i = 1; i <= numofTVchannel; i++) {
          refreshTVtexture(i)
        }

        if (isplaymusic) {
          setTimeout("song[bgm]=new Audio('mp3/bgm_'+bgm+'.mp3');", 2000)
          setTimeout('playmusic(bgm);', 3000)
        }

        framedisplay()
      }
      handleKeys()
      drawScene()
      animate()
    }
  }
}

function loadbarchange (lp) {
  if (lp >= 1) $('#layerFill' + 1 + '').animate({ opacity: 100 }, 3000)
  if (lp >= 2) $('#layerFill' + 2 + '').animate({ opacity: 100 }, 3000)
  if (lp >= 3) $('#layerFill' + 3 + '').animate({ opacity: 100 }, 3000)
  if (lp >= 4) $('#layerFill' + 4 + '').animate({ opacity: 100 }, 3000)
  if (lp >= 5) $('#layerFill' + 5 + '').animate({ opacity: 100 }, 3000)
  if (lp >= 6) $('#layerFill' + 6 + '').animate({ opacity: 100 }, 3000)
  if (lp >= 7) $('#layerFill' + 7 + '').animate({ opacity: 100 }, 3000)
  if (lp >= 8) $('#layerFill' + 8 + '').animate({ opacity: 100 }, 3000)
  if (lp >= 9) $('#layerFill' + 9 + '').animate({ opacity: 100 }, 3000)
  if (lp == 10) $('#layerFill' + 10 + '').animate({ opacity: 100 }, 3000)
}
