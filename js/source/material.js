// 按物体类型的独立材质包（albedo 在 texture.js 经 catalog 加载）
var objectMaterials = {}
var roomMaterialPacks = {
  wood: { normal: null, roughness: null, specular: 0.72, shininess: 40.0 },
  plaster: { normal: null, roughness: null, specular: 0.2, shininess: 12.0 },
  ceiling: { normal: null, roughness: null, specular: 0.18, shininess: 10.0 }
}

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
    materialFallbackNormal = createSolidTexture([128, 128, 255, 255])
  }
  if (!materialFallbackRoughness) {
    materialFallbackRoughness = createSolidTexture([140, 140, 140, 255])
  }
}

function materialKindForType (num) {
  // 返回物体 id（数字）供 bindMaterialMaps 使用；无 catalog 时退回 null
  if (typeof getObjectCatalogEntry === 'function' && getObjectCatalogEntry(num)) return num
  return null
}

function isWoodMaterialType (num) {
  var e = typeof getObjectCatalogEntry === 'function' ? getObjectCatalogEntry(num) : null
  return !!(e && e.kind === 'wood')
}

function resolveMaterialPack (kindOrEnabled) {
  if (kindOrEnabled === true) return roomMaterialPacks.wood
  if (typeof kindOrEnabled === 'string') {
    return roomMaterialPacks[kindOrEnabled] || null
  }
  if (typeof kindOrEnabled === 'number') {
    return objectMaterials[kindOrEnabled] || null
  }
  return null
}

function bindMaterialMaps (kindOrEnabled) {
  if (!shaderProgram || !shaderProgram.useMaterialMapsUniform) return
  ensureMaterialFallbacks()

  var pack = resolveMaterialPack(kindOrEnabled)
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
    if (materialTexReady(tex)) assign(tex)
  }
  tex.image.onerror = function () {}
  tex.image.src = path
}

function initMaterialTextures () {
  ensureMaterialFallbacks()

  // 房间材质（共享）
  loadMaterialTexture('img/material/wood_normal.jpg', function (tex) {
    roomMaterialPacks.wood.normal = tex
  })
  loadMaterialTexture('img/material/wood_roughness.jpg', function (tex) {
    roomMaterialPacks.wood.roughness = tex
  })
  loadMaterialTexture('img/material/plaster_normal.jpg', function (tex) {
    roomMaterialPacks.plaster.normal = tex
  })
  loadMaterialTexture('img/material/plaster_roughness.jpg', function (tex) {
    roomMaterialPacks.plaster.roughness = tex
  })
  loadMaterialTexture('img/material/ceiling_normal.jpg', function (tex) {
    roomMaterialPacks.ceiling.normal = tex
  })
  loadMaterialTexture('img/material/ceiling_roughness.jpg', function (tex) {
    roomMaterialPacks.ceiling.roughness = tex
  })

  if (typeof OBJECTS_CATALOG === 'undefined') return
  for (var i = 0; i < OBJECTS_CATALOG.length; i++) {
    (function (entry) {
      objectMaterials[entry.id] = {
        normal: null,
        roughness: null,
        specular: entry.specular,
        shininess: entry.shininess,
        kind: entry.kind
      }
      loadMaterialTexture(entry.normal, function (tex) {
        objectMaterials[entry.id].normal = tex
      })
      loadMaterialTexture(entry.roughness, function (tex) {
        objectMaterials[entry.id].roughness = tex
      })
    })(OBJECTS_CATALOG[i])
  }
}
