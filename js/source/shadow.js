var shadowFramebuffer = null
var shadowTexture = null
var shadowRenderbuffer = null
var shadowMapSize = 2048
var shadowReady = false

var lightViewMatrix = mat4.create()
var lightProjMatrix = mat4.create()
var invCameraView = mat4.create()
// 归一化深度 bias；过大（×shadowFar）会让脚底/柜底阴影脱开
var shadowBias = 0.00025
var shadowNear = 0.08
var shadowFar = 16

// 立方体贴图六面：覆盖点光四周，墙上阴影不再被单向下视锥裁掉
var shadowCubeFaces = null

function initShadowCubeFaces () {
  shadowCubeFaces = [
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, dir: [1, 0, 0], up: [0, -1, 0] },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, dir: [-1, 0, 0], up: [0, -1, 0] },
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, dir: [0, 1, 0], up: [0, 0, 1] },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, dir: [0, -1, 0], up: [0, 0, -1] },
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, dir: [0, 0, 1], up: [0, -1, 0] },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, dir: [0, 0, -1], up: [0, -1, 0] }
  ]
}

function initShadowMap () {
  if (!gl || shadowReady) return

  initShadowCubeFaces()

  shadowFramebuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer)

  shadowTexture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadowTexture)
  for (var face = 0; face < 6; face++) {
    gl.texImage2D(
      gl.TEXTURE_CUBE_MAP_POSITIVE_X + face,
      0,
      gl.RGBA,
      shadowMapSize,
      shadowMapSize,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    )
  }
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  shadowRenderbuffer = gl.createRenderbuffer()
  gl.bindRenderbuffer(gl.RENDERBUFFER, shadowRenderbuffer)
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, shadowMapSize, shadowMapSize)
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, shadowRenderbuffer)

  gl.bindTexture(gl.TEXTURE_CUBE_MAP, null)
  gl.bindRenderbuffer(gl.RENDERBUFFER, null)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)

  mat4.perspective(90, 1, shadowNear, shadowFar, lightProjMatrix)
  shadowReady = true
}

function drawShadowCasters () {
  drawroom()
  // 跳过灯具本身，避免近平面深度糊住
  for (var i = 0; i <= NumberOfObjects - 1; i++) {
    if (typeof isLampType === 'function' && isLampType(i)) continue
    draw(i)
  }
}

function drawShadowMap (cameraView) {
  if (!shadowReady) initShadowMap()
  if (!shadowReady || !shadowProgram) return

  mat4.inverse(cameraView, invCameraView)
  mat4.perspective(90, 1, shadowNear, shadowFar, lightProjMatrix)

  var savedProgram = shaderProgram
  var savedP = mat4.create()
  var savedMV = mat4.create()
  mat4.set(pMatrix, savedP)
  mat4.set(mvMatrix, savedMV)

  shaderProgram = shadowProgram
  gl.useProgram(shadowProgram)
  if (shadowProgram.shadowFarUniform) {
    gl.uniform1f(shadowProgram.shadowFarUniform, shadowFar)
  }

  // 渲染到 cubemap 前必须解绑，否则 INVALID_OPERATION
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, null)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, null)
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, null)

  gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer)
  gl.viewport(0, 0, shadowMapSize, shadowMapSize)
  gl.enable(gl.POLYGON_OFFSET_FILL)
  // 极轻偏移即可；再大沙发腿/柜脚会与投影脱开
  gl.polygonOffset(0.2, 0.4)

  var eye = [pointlight[0], pointlight[1], pointlight[2]]
  mat4.set(lightProjMatrix, pMatrix)

  for (var f = 0; f < shadowCubeFaces.length; f++) {
    var face = shadowCubeFaces[f]
    var center = [
      eye[0] + face.dir[0],
      eye[1] + face.dir[1],
      eye[2] + face.dir[2]
    ]
    mat4.lookAt(eye, center, face.up, lightViewMatrix)
    mat4.set(lightViewMatrix, mvMatrix)

    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      face.target,
      shadowTexture,
      0
    )

    gl.clearColor(1, 1, 1, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    drawShadowCasters()
  }

  gl.disable(gl.POLYGON_OFFSET_FILL)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)

  shaderProgram = savedProgram
  mat4.set(savedP, pMatrix)
  mat4.set(savedMV, mvMatrix)
  gl.useProgram(shaderProgram)
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight)
  gl.clearColor(0, 0, 0, 1)
}

function bindShadowUniforms (enabled) {
  if (!shaderProgram) return
  if (shaderProgram.useShadowUniform) {
    gl.uniform1i(shaderProgram.useShadowUniform, enabled ? 1 : 0)
  }
  if (!enabled) return

  if (shaderProgram.invCameraViewUniform) {
    gl.uniformMatrix4fv(shaderProgram.invCameraViewUniform, false, invCameraView)
  }
  if (shaderProgram.lightWorldUniform) {
    gl.uniform3f(
      shaderProgram.lightWorldUniform,
      pointlight[0],
      pointlight[1],
      pointlight[2]
    )
  }
  if (shaderProgram.shadowBiasUniform) {
    gl.uniform1f(shaderProgram.shadowBiasUniform, shadowBias)
  }
  if (shaderProgram.shadowFarUniform) {
    gl.uniform1f(shaderProgram.shadowFarUniform, shadowFar)
  }
  if (shaderProgram.shadowTexelSizeUniform) {
    gl.uniform1f(shaderProgram.shadowTexelSizeUniform, 1.0 / shadowMapSize)
  }
  if (shaderProgram.shadowMapUniform && shadowTexture) {
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadowTexture)
    gl.uniform1i(shaderProgram.shadowMapUniform, 1)
    gl.activeTexture(gl.TEXTURE0)
  }
}
