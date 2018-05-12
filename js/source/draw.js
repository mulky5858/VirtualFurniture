/*
最主要的构建函数
*/

function drawScene () {
  gl.useProgram(shaderProgram)
  gl.uniform1i(shaderProgram.samplerUniform, 0)
  gl.uniform1f(shaderProgram.useLightingUniform, 0)
  gl.uniform1i(shaderProgram.useTexturesUniform, 1)

  gl.uniform3f(shaderProgram.ambientColorUniform, 0.5, 0.5, 0.5)

  mat4.multiplyVec3(mvMatrix, pointlight, newpointlight)
  gl.uniform3f(shaderProgram.pointLightingLocationUniform, newpointlight[0], newpointlight[1], newpointlight[2])
  gl.uniform3f(shaderProgram.pointLightingColorUniform, brightness, brightness, brightness)

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

  if (testmode) testoutput = '碰撞体积关闭。 光源坐标： ' + pointlight[0].toFixed(3) + ',' + pointlight[1].toFixed(3) + ',' + pointlight[2].toFixed(3) + ' ' + '人物坐标： ' + xPos.toFixed(3) + ',' + yPos.toFixed(3) + ',' + zPos.toFixed(3) + ' 左右转动角度： ' + yaw.toFixed(3) + ' 上下转动角度： ' + pitch.toFixed(3)

  if (testmode) document.getElementById('test3').textContent = '点选的物品坐标为： ' + coordinate(selectedi, selectedj)
  else document.getElementById('test3').textContent = ''

  drawroom()

  gl.uniform1f(shaderProgram.useLightingUniform, lighting)

  for (var i = 0; i <= NumberOfObjects - 1; i++) {
    draw(i)
  }

  gl2.useProgram(shaderProgram2)
  gl2.uniform1i(shaderProgram2.samplerUniform, 0)
  gl2.uniform1f(shaderProgram2.useLightingUniform, 1)
  gl2.uniform1i(shaderProgram2.useTexturesUniform, 1)
  gl2.uniform3f(shaderProgram2.ambientColorUniform, 0.5, 0.5, 0.5)
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

function tick () {
  requestAnimFrame(tick)

  if (!TextureLoaded) {
    var maxloaded = Array()
    var thingstexturemaxloaded = 0
    var summaxloaded = 0
    TextureLoaded = 1

    for (var i = 0; i <= NumberOfObjects - 1; i++)
      for (var j = 0; j <= 5; j++) {
        if (ThingsTextureLoad[i][j] == false) TextureLoaded = 0
        else thingstexturemaxloaded++
    }
    summaxloaded += thingstexturemaxloaded

    for (var k = 1; k <= numofTVchannel; k++) {
      maxloaded[k] = 0
      for (var i = 1; i <= PicturesOfChannel[k]; i++) {
        if (TextureLoad[k][i] == false) TextureLoaded = 0
        else maxloaded[k]++
      }
      summaxloaded += maxloaded[k]
    }
    document.getElementById('loadingtext').textContent = '正在载入贴图（' + Math.floor(summaxloaded / (numofPictures + (6 * NumberOfObjects)) * 95 + 5) + '%）'
    loadbarchange(Math.round(Math.floor(summaxloaded / (numofPictures + (6 * NumberOfObjects)) * 95 + 5) * 0.05))

    if (TextureLoaded && loadingtextureend) {
      loadingtextureend = 0
      loadRoom()
      LoadingAll()
    }
  }else {
    if (!ModleLoaded) {
      var maxloaded = 0
      for (var i = 0; i <= NumberOfObjects - 1; i++) {
        ModleLoaded = 1
        if (ModleLoad[i] == false) ModleLoaded = 0
        else maxloaded++
        document.getElementById('loadingtext').textContent = '贴图载入完成，正在载入模型（' + Math.floor(100 / NumberOfObjects * maxloaded) + '%）'
        loadbarchange(Math.round(Math.floor(100 / NumberOfObjects * maxloaded) * 0.05) + 5)
      }
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
