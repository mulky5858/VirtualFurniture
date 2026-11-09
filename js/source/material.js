// 按物体类型的独立材质包（albedo 在 texture.js 经 catalog 加载）
var objectMaterials = {}
var roomMaterialPacks = {
  wood: { normal: null, roughness: null, specular: 0.72, shininess: 40.0 },
  plaster: { normal: null, roughness: null, specular: 0.2, shininess: 12.0 },
  ceiling: { normal: null, roughness: null, specular: 0.18, shininess: 10.0 }
}

// 每种墙/地/天花板贴图对应的法线
var wallNormalTexture = []
var floorNormalTexture = []
var ceilingNormalTexture = []

var materialFallbackNormal = null
var materialFallbackRoughness = null
var materialTexVer = '17'

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

function resolveRoomSurfaceOverride (surface) {
  if (!surface) return null
  if (surface === 'floor') {
    var fi = typeof translateFloorTexture !== 'undefined' ? (translateFloorTexture | 0) : 0
    return {
      normal: floorNormalTexture[fi] || null,
      pack: 'wood'
    }
  }
  if (surface === 'wall') {
    var wi = typeof translateWallTexture !== 'undefined' ? (translateWallTexture | 0) : 0
    return {
      normal: wallNormalTexture[wi] || null,
      pack: 'plaster'
    }
  }
  if (surface === 'ceiling') {
    var ci = typeof translateCelingTexture !== 'undefined' ? (translateCelingTexture | 0) : 0
    return {
      normal: ceilingNormalTexture[ci] || null,
      pack: 'ceiling'
    }
  }
  if (surface === 'door') {
    return {
      normal: roomMaterialPacks.wood.normal || null,
      pack: 'wood'
    }
  }
  return null
}

function bindMaterialMaps (kindOrEnabled) {
  if (!gl || !shaderProgram || !shaderProgram.useMaterialMapsUniform) return
  ensureMaterialFallbacks()
  gl.useProgram(shaderProgram)

  var surface = null
  var packKey = kindOrEnabled
  if (kindOrEnabled === 'floor' || kindOrEnabled === 'wall' || kindOrEnabled === 'ceiling' || kindOrEnabled === 'door') {
    surface = kindOrEnabled
    var ov = resolveRoomSurfaceOverride(surface)
    packKey = ov ? ov.pack : kindOrEnabled
  }

  var pack = resolveMaterialPack(packKey)
  var override = surface ? resolveRoomSurfaceOverride(surface) : null
  var normalTex = (override && materialTexReady(override.normal)) ? override.normal
    : (pack && materialTexReady(pack.normal) ? pack.normal : null)
  var useMaps = !!(pack && materialTexReady(pack.roughness) && normalTex)

  gl.activeTexture(gl.TEXTURE2)
  gl.bindTexture(gl.TEXTURE_2D, useMaps ? normalTex : materialFallbackNormal)
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

function loadIndexedMaterialMap (arr, index, path) {
  loadMaterialTexture(path, function (tex) {
    arr[index] = tex
  })
}

function initRoomSurfaceMaps () {
  var i
  for (i = 0; i <= 9; i++) {
    loadIndexedMaterialMap(floorNormalTexture, i, 'img/floor/floor' + i + '_normal.jpg?v=' + materialTexVer)
    loadIndexedMaterialMap(wallNormalTexture, i, 'img/wall/wall' + i + '_normal.jpg?v=' + materialTexVer)
  }
  for (i = 0; i <= 11; i++) {
    loadIndexedMaterialMap(ceilingNormalTexture, i, 'img/ceiling/ceiling' + i + '_normal.jpg?v=' + materialTexVer)
  }
}

function initMaterialTextures () {
  ensureMaterialFallbacks()

  loadMaterialTexture('img/material/wood_normal.jpg?v=' + materialTexVer, function (tex) {
    roomMaterialPacks.wood.normal = tex
  })
  loadMaterialTexture('img/material/wood_roughness.jpg?v=' + materialTexVer, function (tex) {
    roomMaterialPacks.wood.roughness = tex
  })
  loadMaterialTexture('img/material/plaster_normal.jpg?v=' + materialTexVer, function (tex) {
    roomMaterialPacks.plaster.normal = tex
  })
  loadMaterialTexture('img/material/plaster_roughness.jpg?v=' + materialTexVer, function (tex) {
    roomMaterialPacks.plaster.roughness = tex
  })
  loadMaterialTexture('img/material/ceiling_normal.jpg?v=' + materialTexVer, function (tex) {
    roomMaterialPacks.ceiling.normal = tex
  })
  loadMaterialTexture('img/material/ceiling_roughness.jpg?v=' + materialTexVer, function (tex) {
    roomMaterialPacks.ceiling.roughness = tex
  })

  initRoomSurfaceMaps()

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
