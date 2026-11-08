var MAX_SCENE_LIGHTS = 8
// 会发光的灯具类型：吊灯1、吊灯2
var LAMP_TYPES = [0, 15]
var sceneLights = []
var LIGHT_INTENSITY_STEP = 0.15
var LIGHT_INTENSITY_MIN = 0.0
var LIGHT_INTENSITY_MAX = 2.5

function isLampType (num) {
  for (var i = 0; i < LAMP_TYPES.length; i++) {
    if (LAMP_TYPES[i] === num) return true
  }
  return false
}

function getLampIntensity (type, index) {
  if (lightIntensity[type] && typeof lightIntensity[type][index] === 'number') {
    return lightIntensity[type][index]
  }
  return (typeof brightness === 'number') ? brightness : 0.85
}

function adjustSelectedLampIntensity (delta) {
  if (!isLampType(selectedi) || !flagThings[selectedi][selectedj]) return
  var cur = getLampIntensity(selectedi, selectedj)
  var next = cur + delta
  if (next < LIGHT_INTENSITY_MIN) next = LIGHT_INTENSITY_MIN
  if (next > LIGHT_INTENSITY_MAX) next = LIGHT_INTENSITY_MAX
  lightIntensity[selectedi][selectedj] = next
  lagelapsedtozero()
}

function collectSceneLights () {
  sceneLights = []
  for (var t = 0; t < LAMP_TYPES.length; t++) {
    var i = LAMP_TYPES[t]
    if (!numThings[i]) continue
    for (var j = 1; j <= numThings[i]; j++) {
      if (!flagThings[i][j]) continue
      if (sceneLights.length >= MAX_SCENE_LIGHTS) break
      var c = coordinate(i, j)
      // 光源略低于灯具中心，更接近灯泡位置
      sceneLights.push({
        pos: [
          parseFloat(c[0]),
          parseFloat(c[1]) - 0.15,
          parseFloat(c[2])
        ],
        intensity: getLampIntensity(i, j)
      })
    }
  }

  // 兼容旧逻辑：主阴影/测试标记用第一盏灯
  if (sceneLights.length > 0) {
    pointlight = [
      sceneLights[0].pos[0],
      sceneLights[0].pos[1],
      sceneLights[0].pos[2]
    ]
  }
}

function bindSceneLightsEyeSpace (viewMatrix) {
  if (!shaderProgram) return
  var count = sceneLights.length
  if (shaderProgram.lightCountUniform) {
    gl.uniform1i(shaderProgram.lightCountUniform, count)
  }

  for (var i = 0; i < MAX_SCENE_LIGHTS; i++) {
    if (i < count) {
      var eye = [0, 0, 0]
      mat4.multiplyVec3(viewMatrix, sceneLights[i].pos, eye)
      var inten = sceneLights[i].intensity
      if (shaderProgram.pointLightingLocationUniforms && shaderProgram.pointLightingLocationUniforms[i]) {
        gl.uniform3f(shaderProgram.pointLightingLocationUniforms[i], eye[0], eye[1], eye[2])
      }
      if (shaderProgram.pointLightingColorUniforms && shaderProgram.pointLightingColorUniforms[i]) {
        gl.uniform3f(
          shaderProgram.pointLightingColorUniforms[i],
          inten,
          inten,
          inten
        )
      }
    } else if (shaderProgram.pointLightingColorUniforms && shaderProgram.pointLightingColorUniforms[i]) {
      gl.uniform3f(shaderProgram.pointLightingColorUniforms[i], 0, 0, 0)
    }
  }

  // 兼容旧单光源 uniform（预览/旧路径）
  if (count > 0 && shaderProgram.pointLightingLocationUniform) {
    var e0 = [0, 0, 0]
    mat4.multiplyVec3(viewMatrix, sceneLights[0].pos, e0)
    gl.uniform3f(shaderProgram.pointLightingLocationUniform, e0[0], e0[1], e0[2])
    if (shaderProgram.pointLightingColorUniform) {
      var i0 = sceneLights[0].intensity
      gl.uniform3f(shaderProgram.pointLightingColorUniform, i0, i0, i0)
    }
  }
}

function offsetFirstLamp (dx, dy, dz) {
  for (var t = 0; t < LAMP_TYPES.length; t++) {
    var i = LAMP_TYPES[t]
    if (!numThings[i]) continue
    for (var j = 1; j <= numThings[i]; j++) {
      if (!flagThings[i][j]) continue
      translateVector[i][j][0] += dx
      translateVector[i][j][1] += dy
      translateVector[i][j][2] += dz
      return true
    }
  }
  return false
}
