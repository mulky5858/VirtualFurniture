// 共享材质贴图包：法线 + 粗糙度（按材质类别，而非逐模型 PBR）
var materialPacks = {
  wood: { normal: null, roughness: null, specular: 0.72, shininess: 40.0 },
  fabric: { normal: null, roughness: null, specular: 0.16, shininess: 10.0 },
  metal: { normal: null, roughness: null, specular: 1.05, shininess: 72.0 },
  plastic: { normal: null, roughness: null, specular: 0.48, shininess: 28.0 },
  ceramic: { normal: null, roughness: null, specular: 0.9, shininess: 64.0 },
  paper: { normal: null, roughness: null, specular: 0.12, shininess: 8.0 },
  plaster: { normal: null, roughness: null, specular: 0.2, shininess: 12.0 },
  ceiling: { normal: null, roughness: null, specular: 0.18, shininess: 10.0 }
}

// 关闭材质贴图时仍绑定有效 sampler，避免部分驱动采样未绑定纹理
var materialFallbackNormal = null
var materialFallbackRoughness = null

function materialTexReady (tex) {
  return !!(tex && tex.webglUploaded && tex.image && tex.image.width > 1 && tex.image.height > 1)
}

function createSolidTexture (rgba) {
  var tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(rgba))
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.bindTexture(gl.TEXTURE_2D, null)
  tex.webglUploaded = true
  return tex
}

function ensureMaterialFallbacks () {
  if (!gl) return
  if (!materialFallbackNormal) {
    // 平坦法线 (0,0,1) → RGB (128,128,255)
    materialFallbackNormal = createSolidTexture([128, 128, 255, 255])
  }
  if (!materialFallbackRoughness) {
    // 中等粗糙度，避免误开贴图时高光爆掉
    materialFallbackRoughness = createSolidTexture([140, 140, 140, 255])
  }
}

// 物体类型 → 材质类别
function materialKindForType (num) {
  // 灯具、垃圾桶、电话：金属
  if (num === 0 || num === 15 || num === 12 || num === 34) return 'metal'
  // 沙发：布艺
  if (num === 1 || num === 21 || num === 22) return 'fabric'
  // 电视 / 电脑 / 笔记本 / 空调 / 开关：塑料壳
  if (num === 2 || num === 7 || num === 11 || num === 13 ||
      num === 17 || num === 18 || num === 23) return 'plastic'
  // 花瓶 / 茶壶：陶瓷
  if (num === 5 || num === 6 || num === 29) return 'ceramic'
  // 装饰画册 / 书 / 相框：纸质印刷
  if (num === 30 || num === 31 || num === 32 || num === 33 || num === 37) return 'paper'
  // 桌、架、柜、床、椅、门：木头
  if (num === 3 || num === 4 || num === 8 || num === 9 || num === 10 ||
      num === 14 || num === 16 || num === 19 || num === 20 ||
      num === 24 || num === 25 || num === 26 || num === 27 || num === 28 ||
      num === 35 || num === 36 || num === 38) return 'wood'
  return null
}

function isWoodMaterialType (num) {
  return materialKindForType(num) === 'wood'
}

function bindMaterialMaps (kindOrEnabled) {
  if (!shaderProgram || !shaderProgram.useMaterialMapsUniform) return
  ensureMaterialFallbacks()

  var kind = null
  if (kindOrEnabled === true) kind = 'wood'
  else if (kindOrEnabled && typeof kindOrEnabled === 'string') kind = kindOrEnabled

  var pack = kind ? materialPacks[kind] : null
  var useMaps = !!(pack && materialTexReady(pack.normal) && materialTexReady(pack.roughness))

  gl.activeTexture(gl.TEXTURE2)
  gl.bindTexture(gl.TEXTURE_2D, useMaps ? pack.normal : materialFallbackNormal)
  gl.uniform1i(shaderProgram.normalMapUniform, 2)
  gl.activeTexture(gl.TEXTURE3)
  gl.bindTexture(gl.TEXTURE_2D, useMaps ? pack.roughness : materialFallbackRoughness)
  gl.uniform1i(shaderProgram.roughnessMapUniform, 3)

  if (useMaps) {
    gl.uniform1i(shaderProgram.useMaterialMapsUniform, 1)
    gl.uniform1f(shaderProgram.specularStrengthUniform, pack.specular)
    gl.uniform1f(shaderProgram.shininessUniform, pack.shininess)
  } else {
    gl.uniform1i(shaderProgram.useMaterialMapsUniform, 0)
    gl.uniform1f(shaderProgram.specularStrengthUniform, 0.14)
    gl.uniform1f(shaderProgram.shininessUniform, 16.0)
  }
  gl.activeTexture(gl.TEXTURE0)
}

function loadMaterialTexture (path, assign) {
  var tex = gl.createTexture()
  tex.image = new Image()
  tex.image.onload = function () {
    handleLoadedTexture(tex)
    // 仅在真实贴图上传成功后启用；失败/占位不 assign，保持 pack 为 null
    if (materialTexReady(tex)) assign(tex)
  }
  tex.image.onerror = function () {
    // 不写入 pack，避免黑占位法线把材质通路打开
  }
  tex.image.src = path
}

function initMaterialTextures () {
  ensureMaterialFallbacks()
  var names = ['wood', 'fabric', 'metal', 'plastic', 'ceramic', 'paper', 'plaster', 'ceiling']
  for (var i = 0; i < names.length; i++) {
    (function (name) {
      loadMaterialTexture('img/material/' + name + '_normal.jpg', function (tex) {
        materialPacks[name].normal = tex
      })
      loadMaterialTexture('img/material/' + name + '_roughness.jpg', function (tex) {
        materialPacks[name].roughness = tex
      })
    })(names[i])
  }
}
