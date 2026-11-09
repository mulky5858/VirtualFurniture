function isPowerOfTwo (value) {
  return value > 0 && (value & (value - 1)) === 0
}

function handleLoadedTexture (texture) {
  try {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    var hasImage = texture.image && texture.image.width > 0 && texture.image.height > 0
    if (hasImage) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image)
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]))
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    // WebGL2 支持 NPOT mipmap；WebGL1 仅 POT 可安全用 mipmap
    var canMip = hasImage && (isWebGL2Context(gl) ||
      (isPowerOfTwo(texture.image.width) && isPowerOfTwo(texture.image.height)))
    if (canMip) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
      gl.generateMipmap(gl.TEXTURE_2D)
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    }
    gl.bindTexture(gl.TEXTURE_2D, null)
    texture.webglUploaded = !!hasImage
  } catch (e) {
    try {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]))
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.bindTexture(gl.TEXTURE_2D, null)
    } catch (e2) {}
    texture.webglUploaded = false
  }
}

function handleLoadedTexture2 (texture) {
  try {
    gl2.pixelStorei(gl2.UNPACK_FLIP_Y_WEBGL, true)
    gl2.bindTexture(gl2.TEXTURE_2D, texture)
    if (texture.image && texture.image.width > 0) {
      gl2.texImage2D(gl2.TEXTURE_2D, 0, gl2.RGBA, gl2.RGBA, gl2.UNSIGNED_BYTE, texture.image)
    } else {
      gl2.texImage2D(gl2.TEXTURE_2D, 0, gl2.RGBA, 1, 1, 0, gl2.RGBA, gl2.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]))
    }
    gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_MAG_FILTER, gl2.LINEAR)
    var hasImage = texture.image && texture.image.width > 0 && texture.image.height > 0
    var canMip = hasImage && (isWebGL2Context(gl2) ||
      (isPowerOfTwo(texture.image.width) && isPowerOfTwo(texture.image.height)))
    if (canMip) {
      gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_MIN_FILTER, gl2.LINEAR_MIPMAP_LINEAR)
      gl2.generateMipmap(gl2.TEXTURE_2D)
    } else {
      gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_MIN_FILTER, gl2.LINEAR)
      gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_WRAP_S, gl2.CLAMP_TO_EDGE)
      gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_WRAP_T, gl2.CLAMP_TO_EDGE)
    }
    gl2.bindTexture(gl2.TEXTURE_2D, null)
  } catch (e) {
    try {
      gl2.bindTexture(gl2.TEXTURE_2D, texture)
      gl2.texImage2D(gl2.TEXTURE_2D, 0, gl2.RGBA, 1, 1, 0, gl2.RGBA, gl2.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]))
      gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_MAG_FILTER, gl2.LINEAR)
      gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_MIN_FILTER, gl2.LINEAR)
      gl2.bindTexture(gl2.TEXTURE_2D, null)
    } catch (e2) {}
  }
}

var thingsTexturePending = 0
var wallTexture = Array()
var floorTexture = Array()
var ceilingTexture = Array()
var doorTexture = Array()
var ThingsTexture = Array()
var ThingsTexture2 = Array()
var tvTexture = Array()
// var WallTextureLoad=Array()
// var FloorTextureLoad=Array()
// var CeilingTextureLoad=Array()
// var DoorTextureLoad=Array()

var ThingsTextureLoad = Array()

var TextureLoad = Array()
var TextureLoaded = 0

for (var i = 1; i <= numofTVchannel; i++) {
  tvTexture[i] = Array()
  TextureLoad[i] = Array()
}
for (var i = 0; i <= MaxNumberOfObjects; i++) {
  ThingsTexture[i] = Array()
  ThingsTexture2[i] = Array()
  ThingsTextureLoad[i] = Array()
}

for (var i = 0; i <= NumberOfObjects - 1; i++)
  for (var j = 0; j <= 5; j++) {
    ThingsTextureLoad[i][j] = true
}

function initTexture () {
  if (typeof initMaterialTextures === 'function') initMaterialTextures()

  bindDoorTexture(0, 'img/door.jpg')

  bindWallTexture(0, 'img/wall/wall0.jpg')
  bindWallTexture(1, 'img/wall/wall1.jpg')
  bindWallTexture(2, 'img/wall/wall2.jpg')
  bindWallTexture(3, 'img/wall/wall3.jpg')
  bindWallTexture(4, 'img/wall/wall4.jpg')
  bindWallTexture(5, 'img/wall/wall5.jpg')
  bindWallTexture(6, 'img/wall/wall6.jpg')
  bindWallTexture(7, 'img/wall/wall7.jpg')
  bindWallTexture(8, 'img/wall/wall8.jpg')
  bindWallTexture(9, 'img/wall/wall9.jpg')

  bindFloorTexture(0, 'img/floor/floor0.jpg')
  bindFloorTexture(1, 'img/floor/floor1.jpg')
  bindFloorTexture(2, 'img/floor/floor2.jpg')
  bindFloorTexture(3, 'img/floor/floor3.jpg')
  bindFloorTexture(4, 'img/floor/floor4.jpg')
  bindFloorTexture(5, 'img/floor/floor5.jpg')
  bindFloorTexture(6, 'img/floor/floor6.jpg')
  bindFloorTexture(7, 'img/floor/floor7.jpg')
  bindFloorTexture(8, 'img/floor/floor8.jpg')
  bindFloorTexture(9, 'img/floor/floor9.jpg')

  bindCeilingTexture(0, 'img/ceiling/ceiling0.jpg')
  bindCeilingTexture(1, 'img/ceiling/ceiling1.jpg')
  bindCeilingTexture(2, 'img/ceiling/ceiling2.jpg')
  bindCeilingTexture(3, 'img/ceiling/ceiling3.jpg')
  bindCeilingTexture(4, 'img/ceiling/ceiling4.jpg')
  bindCeilingTexture(5, 'img/ceiling/ceiling5.jpg')
  bindCeilingTexture(6, 'img/ceiling/ceiling6.jpg')
  bindCeilingTexture(7, 'img/ceiling/ceiling7.jpg')
  bindCeilingTexture(8, 'img/ceiling/ceiling8.jpg')
  bindCeilingTexture(9, 'img/ceiling/ceiling9.jpg')
  bindCeilingTexture(10, 'img/ceiling/ceiling10.jpg')
  bindCeilingTexture(11, 'img/ceiling/ceiling11.jpg')

  // 家具 albedo 由 OBJECTS_CATALOG 统一绑定（增强后的 img/objects/...）
  if (typeof OBJECTS_CATALOG !== 'undefined') {
    for (var ci = 0; ci < OBJECTS_CATALOG.length; ci++) {
      var entry = OBJECTS_CATALOG[ci]
      for (var ai = 0; ai < entry.albedos.length; ai++) {
        bindTexture(entry.id, ai, entry.albedos[ai])
        bindTexture2(entry.id, ai, entry.albedos[ai])
      }
    }
  }

  // TV 频道帧改为按需加载，避免启动时一次性请求上千张图片导致卡住
}

// bindTexture 
// num1 为物体序号
// num2 为贴图序号
function bindTexture (num1, num2, shape) {
  if (ThingsTextureLoad[num1][num2] !== false) {
    thingsTexturePending++
  }
  ThingsTextureLoad[num1][num2] = false
  ThingsTexture[num1][num2] = gl.createTexture()
  ThingsTexture[num1][num2].image = new Image()
  ThingsTexture[num1][num2].image.onload = function () {
    handleLoadedTexture(ThingsTexture[num1][num2])
    ThingsTextureLoad[num1][num2] = true
  }
  ThingsTexture[num1][num2].image.onerror = function () {
    handleLoadedTexture(ThingsTexture[num1][num2])
    ThingsTextureLoad[num1][num2] = true
  }

  ThingsTexture[num1][num2].image.src = shape
}

function bindTexture2 (num1, num2, shape) {
  ThingsTexture2[num1][num2] = gl2.createTexture()
  ThingsTexture2[num1][num2].image = new Image()
  ThingsTexture2[num1][num2].image.onload = function () {
    handleLoadedTexture2(ThingsTexture2[num1][num2])
  }
  ThingsTexture2[num1][num2].image.onerror = function () {
    handleLoadedTexture2(ThingsTexture2[num1][num2])
  }

  ThingsTexture2[num1][num2].image.src = shape
}

// num 为贴图序号

function bindWallTexture (num, shape) {
  wallTexture[num] = gl.createTexture()
  wallTexture[num].image = new Image()
  wallTexture[num].image.onload = function () {
    handleLoadedTexture(wallTexture[num])
  }
  wallTexture[num].image.onerror = function () {
    handleLoadedTexture(wallTexture[num])
  }

  wallTexture[num].image.src = shape
}

function bindFloorTexture (num, shape) {
  floorTexture[num] = gl.createTexture()
  floorTexture[num].image = new Image()
  floorTexture[num].image.onload = function () {
    handleLoadedTexture(floorTexture[num])
  }
  floorTexture[num].image.onerror = function () {
    handleLoadedTexture(floorTexture[num])
  }

  floorTexture[num].image.src = shape
}
function bindCeilingTexture (num, shape) {
  ceilingTexture[num] = gl.createTexture()
  ceilingTexture[num].image = new Image()
  ceilingTexture[num].image.onload = function () {
    handleLoadedTexture(ceilingTexture[num])
  }
  ceilingTexture[num].image.onerror = function () {
    handleLoadedTexture(ceilingTexture[num])
  }

  ceilingTexture[num].image.src = shape
}

function bindDoorTexture (num, shape) {
  doorTexture[num] = gl.createTexture()
  doorTexture[num].image = new Image()
  doorTexture[num].image.onload = function () {
    handleLoadedTexture(doorTexture[num])
  }
  doorTexture[num].image.onerror = function () {
    handleLoadedTexture(doorTexture[num])
  }

  doorTexture[num].image.src = shape
}
function initTVTexture (channel, num) {
  if (!num || num < 1) return
  if (tvTexture[channel][num] && (tvTexture[channel][num].loading || TextureLoad[channel][num])) return
  TextureLoad[channel][num] = false
  tvTexture[channel][num] = gl.createTexture()
  tvTexture[channel][num].loading = true
  tvTexture[channel][num].image = new Image()
  tvTexture[channel][num].image.onload = function () {
    handleLoadedTexture(tvTexture[channel][num])
    tvTexture[channel][num].loading = false
    TextureLoad[channel][num] = true
    if (typeof change !== 'undefined' && change[channel] === num) {
      onloadTVtexture[channel] = tvTexture[channel][num]
    }
  }
  tvTexture[channel][num].image.onerror = function () {
    handleLoadedTexture(tvTexture[channel][num])
    tvTexture[channel][num].loading = false
    TextureLoad[channel][num] = true
  }
  tvTexture[channel][num].image.src = 'img/TV-images/TV_' + channel + '/TV_' + channel + '_' + num + '.jpg'
}
