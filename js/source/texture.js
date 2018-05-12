function handleLoadedTexture (texture) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

  gl.bindTexture(gl.TEXTURE_2D, null)
}

function handleLoadedTexture2 (texture) {
  gl2.pixelStorei(gl2.UNPACK_FLIP_Y_WEBGL, true)
  gl2.bindTexture(gl2.TEXTURE_2D, texture)
  gl2.texImage2D(gl2.TEXTURE_2D, 0, gl2.RGBA, gl2.RGBA, gl2.UNSIGNED_BYTE, texture.image)
  gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_MAG_FILTER, gl2.LINEAR)
  gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_MIN_FILTER, gl2.LINEAR)

  gl2.bindTexture(gl2.TEXTURE_2D, null)
}
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

  bindTexture(0, 0, 'img/lamp/lamp0.jpg')
  bindTexture(0, 1, 'img/lamp/lamp1.jpg')
  bindTexture(0, 2, 'img/lamp/lamp2.jpg')

  bindTexture(1, 0, 'img/sofa/sofa0.jpg')
  bindTexture(1, 1, 'img/sofa/sofa1.jpg')
  bindTexture(1, 2, 'img/sofa/sofa2.jpg')
  bindTexture(1, 3, 'img/sofa/sofa3.jpg')
  bindTexture(1, 4, 'img/sofa/sofa4.jpg')

  bindTexture(2, 0, 'img/TV/TV.jpg')

  bindTexture(3, 0, 'img/table/table0.jpg')
  bindTexture(3, 1, 'img/table/table1.jpg')
  bindTexture(3, 2, 'img/table/table2.jpg')
  bindTexture(3, 3, 'img/table/table3.jpg')
  bindTexture(3, 4, 'img/table/table4.jpg')
  bindTexture(3, 5, 'img/table/table5.jpg')

  bindTexture(4, 0, 'img/cabinet/cabinet0.jpg')
  bindTexture(4, 1, 'img/cabinet/cabinet1.jpg')
  bindTexture(4, 2, 'img/cabinet/cabinet2.jpg')
  bindTexture(4, 3, 'img/cabinet/cabinet3.jpg')
  bindTexture(4, 4, 'img/cabinet/cabinet4.jpg')
  bindTexture(4, 5, 'img/cabinet/cabinet5.jpg')

  bindTexture(5, 0, 'img/others/vase.jpg')

  bindTexture(6, 0, 'img/others/teapot.jpg')

  bindTexture(7, 0, 'img/Airconditioning/Airconditioning.jpg')

  bindTexture(8, 0, 'img/cabinet/cabinet0.jpg')
  bindTexture(8, 1, 'img/cabinet/cabinet1.jpg')
  bindTexture(8, 2, 'img/cabinet/cabinet2.jpg')
  bindTexture(8, 3, 'img/cabinet/cabinet3.jpg')
  bindTexture(8, 4, 'img/cabinet/cabinet4.jpg')
  bindTexture(8, 5, 'img/cabinet/cabinet5.jpg')

  bindTexture(9, 0, 'img/bed/bed0.jpg')

  bindTexture(10, 0, 'img/cabinet/cabinet0.jpg')
  bindTexture(10, 1, 'img/cabinet/cabinet1.jpg')
  bindTexture(10, 2, 'img/cabinet/cabinet2.jpg')
  bindTexture(10, 3, 'img/cabinet/cabinet3.jpg')
  bindTexture(10, 4, 'img/cabinet/cabinet4.jpg')
  bindTexture(10, 5, 'img/cabinet/cabinet5.jpg')

  bindTexture(11, 0, 'img/others/switch.jpg')

  bindTexture(12, 0, 'img/others/telephone.jpg')

  bindTexture(13, 0, 'img/computer/computer0.jpg')

  bindTexture(14, 0, 'img/table/table0.jpg')
  bindTexture(14, 1, 'img/table/table1.jpg')
  bindTexture(14, 2, 'img/table/table2.jpg')
  bindTexture(14, 3, 'img/table/table3.jpg')
  bindTexture(14, 4, 'img/table/table4.jpg')
  bindTexture(14, 5, 'img/table/table5.jpg')

  bindTexture(15, 0, 'img/lamp/lamp0.jpg')
  bindTexture(15, 1, 'img/lamp/lamp1.jpg')
  bindTexture(15, 2, 'img/lamp/lamp2.jpg')

  bindTexture(16, 0, 'img/bed/bed0.jpg')

  bindTexture(17, 0, 'img/Airconditioning/Airconditioning.jpg')

  bindTexture(18, 0, 'img/Airconditioning/Airconditioning.jpg')

  bindTexture(19, 0, 'img/table/table0.jpg')
  bindTexture(19, 1, 'img/table/table1.jpg')
  bindTexture(19, 2, 'img/table/table2.jpg')
  bindTexture(19, 3, 'img/table/table3.jpg')
  bindTexture(19, 4, 'img/table/table4.jpg')
  bindTexture(19, 5, 'img/table/table5.jpg')

  bindTexture(20, 0, 'img/cabinet/cabinet0.jpg')
  bindTexture(20, 1, 'img/cabinet/cabinet1.jpg')
  bindTexture(20, 2, 'img/cabinet/cabinet2.jpg')
  bindTexture(20, 3, 'img/cabinet/cabinet3.jpg')
  bindTexture(20, 4, 'img/cabinet/cabinet4.jpg')
  bindTexture(20, 4, 'img/cabinet/cabinet5.jpg')

  bindTexture(21, 0, 'img/sofa/sofa0.jpg')
  bindTexture(21, 1, 'img/sofa/sofa1.jpg')
  bindTexture(21, 2, 'img/sofa/sofa2.jpg')
  bindTexture(21, 3, 'img/sofa/sofa3.jpg')
  bindTexture(21, 4, 'img/sofa/sofa4.jpg')

  bindTexture(22, 0, 'img/sofa/sofa0.jpg')
  bindTexture(22, 1, 'img/sofa/sofa1.jpg')
  bindTexture(22, 2, 'img/sofa/sofa2.jpg')
  bindTexture(22, 3, 'img/sofa/sofa3.jpg')
  bindTexture(22, 4, 'img/sofa/sofa4.jpg')

  bindTexture(23, 0, 'img/computer/computer1.jpg')

  bindTexture(24, 0, 'img/chair/chair0.jpg')
  bindTexture(24, 1, 'img/chair/chair1.jpg')
  bindTexture(24, 2, 'img/chair/chair2.jpg')
  bindTexture(24, 3, 'img/chair/chair3.jpg')
  bindTexture(24, 4, 'img/chair/chair4.jpg')

  bindTexture(25, 0, 'img/chair/chair0.jpg')
  bindTexture(25, 1, 'img/chair/chair1.jpg')
  bindTexture(25, 2, 'img/chair/chair2.jpg')
  bindTexture(25, 3, 'img/chair/chair3.jpg')
  bindTexture(25, 4, 'img/chair/chair4.jpg')

  bindTexture(26, 0, 'img/chair/chair0.jpg')
  bindTexture(26, 1, 'img/chair/chair1.jpg')
  bindTexture(26, 2, 'img/chair/chair2.jpg')
  bindTexture(26, 3, 'img/chair/chair3.jpg')
  bindTexture(26, 4, 'img/chair/chair4.jpg')

  bindTexture(27, 0, 'img/cabinet/cabinet0.jpg')
  bindTexture(27, 1, 'img/cabinet/cabinet1.jpg')
  bindTexture(27, 2, 'img/cabinet/cabinet2.jpg')
  bindTexture(27, 3, 'img/cabinet/cabinet3.jpg')
  bindTexture(27, 4, 'img/cabinet/cabinet4.jpg')
  bindTexture(27, 5, 'img/cabinet/cabinet5.jpg')

  bindTexture(28, 0, 'img/cabinet/cabinet0.jpg')
  bindTexture(28, 1, 'img/cabinet/cabinet1.jpg')
  bindTexture(28, 2, 'img/cabinet/cabinet2.jpg')
  bindTexture(28, 3, 'img/cabinet/cabinet3.jpg')
  bindTexture(28, 4, 'img/cabinet/cabinet4.jpg')
  bindTexture(28, 5, 'img/cabinet/cabinet5.jpg')

  bindTexture(29, 0, 'img/others/vase.jpg')

  bindTexture(30, 0, 'img/Decorations/Decorations0.jpg')
  bindTexture(30, 1, 'img/Decorations/Decorations1.jpg')
  bindTexture(30, 2, 'img/Decorations/Decorations2.jpg')
  bindTexture(30, 3, 'img/Decorations/Decorations3.jpg')
  bindTexture(30, 4, 'img/Decorations/Decorations4.jpg')

  bindTexture(31, 0, 'img/Decorations/Decorations0.jpg')
  bindTexture(31, 1, 'img/Decorations/Decorations1.jpg')
  bindTexture(31, 2, 'img/Decorations/Decorations2.jpg')
  bindTexture(31, 3, 'img/Decorations/Decorations3.jpg')
  bindTexture(31, 4, 'img/Decorations/Decorations4.jpg')

  bindTexture(32, 0, 'img/Decorations/Decorations0.jpg')
  bindTexture(32, 1, 'img/Decorations/Decorations1.jpg')
  bindTexture(32, 2, 'img/Decorations/Decorations2.jpg')
  bindTexture(32, 3, 'img/Decorations/Decorations3.jpg')
  bindTexture(32, 4, 'img/Decorations/Decorations4.jpg')

  bindTexture(33, 0, 'img/others/books.jpg')

  bindTexture(34, 0, 'img/others/trashcan.jpg')

  bindTexture(35, 0, 'img/table/table0.jpg')
  bindTexture(35, 1, 'img/table/table1.jpg')
  bindTexture(35, 2, 'img/table/table2.jpg')
  bindTexture(35, 3, 'img/table/table3.jpg')
  bindTexture(35, 4, 'img/table/table4.jpg')
  bindTexture(35, 5, 'img/table/table5.jpg')

  bindTexture(36, 0, 'img/table/table0.jpg')
  bindTexture(36, 1, 'img/table/table1.jpg')
  bindTexture(36, 2, 'img/table/table2.jpg')
  bindTexture(36, 3, 'img/table/table3.jpg')
  bindTexture(36, 4, 'img/table/table4.jpg')
  bindTexture(36, 5, 'img/table/table5.jpg')

  bindTexture(37, 0, 'img/frame/frame0.jpg')
  bindTexture(37, 1, 'img/frame/frame1.jpg')
  bindTexture(37, 2, 'img/frame/frame2.jpg')
  bindTexture(37, 3, 'img/frame/frame3.jpg')
  bindTexture(37, 4, 'img/frame/frame4.jpg')

  bindTexture(38, 0, 'img/door/door.jpg')

  bindTexture2(0, 0, 'img/lamp/lamp0.jpg')
  bindTexture2(0, 1, 'img/lamp/lamp1.jpg')
  bindTexture2(0, 2, 'img/lamp/lamp2.jpg')

  bindTexture2(1, 0, 'img/sofa/sofa0.jpg')
  bindTexture2(1, 1, 'img/sofa/sofa1.jpg')
  bindTexture2(1, 2, 'img/sofa/sofa2.jpg')
  bindTexture2(1, 3, 'img/sofa/sofa3.jpg')
  bindTexture2(1, 4, 'img/sofa/sofa4.jpg')

  bindTexture2(2, 0, 'img/TV/TV.jpg')

  bindTexture2(3, 0, 'img/table/table0.jpg')
  bindTexture2(3, 1, 'img/table/table1.jpg')
  bindTexture2(3, 2, 'img/table/table2.jpg')
  bindTexture2(3, 3, 'img/table/table3.jpg')
  bindTexture2(3, 4, 'img/table/table4.jpg')
  bindTexture2(3, 5, 'img/table/table5.jpg')

  bindTexture2(4, 0, 'img/cabinet/cabinet0.jpg')
  bindTexture2(4, 1, 'img/cabinet/cabinet1.jpg')
  bindTexture2(4, 2, 'img/cabinet/cabinet2.jpg')
  bindTexture2(4, 3, 'img/cabinet/cabinet3.jpg')
  bindTexture2(4, 4, 'img/cabinet/cabinet4.jpg')
  bindTexture2(4, 5, 'img/cabinet/cabinet5.jpg')

  bindTexture2(5, 0, 'img/others/vase.jpg')

  bindTexture2(6, 0, 'img/others/teapot.jpg')

  bindTexture2(7, 0, 'img/Airconditioning/Airconditioning.jpg')

  bindTexture2(8, 0, 'img/cabinet/cabinet0.jpg')
  bindTexture2(8, 1, 'img/cabinet/cabinet1.jpg')
  bindTexture2(8, 2, 'img/cabinet/cabinet2.jpg')
  bindTexture2(8, 3, 'img/cabinet/cabinet3.jpg')
  bindTexture2(8, 4, 'img/cabinet/cabinet4.jpg')
  bindTexture2(8, 5, 'img/cabinet/cabinet5.jpg')

  bindTexture2(9, 0, 'img/bed/bed0.jpg')

  bindTexture2(10, 0, 'img/cabinet/cabinet0.jpg')
  bindTexture2(10, 1, 'img/cabinet/cabinet1.jpg')
  bindTexture2(10, 2, 'img/cabinet/cabinet2.jpg')
  bindTexture2(10, 3, 'img/cabinet/cabinet3.jpg')
  bindTexture2(10, 4, 'img/cabinet/cabinet4.jpg')
  bindTexture2(10, 5, 'img/cabinet/cabinet5.jpg')

  bindTexture2(11, 0, 'img/others/switch.jpg')

  bindTexture2(12, 0, 'img/others/telephone.jpg')

  bindTexture2(13, 0, 'img/computer/computer0.jpg')

  bindTexture2(14, 0, 'img/table/table0.jpg')
  bindTexture2(14, 1, 'img/table/table1.jpg')
  bindTexture2(14, 2, 'img/table/table2.jpg')
  bindTexture2(14, 3, 'img/table/table3.jpg')
  bindTexture2(14, 4, 'img/table/table4.jpg')
  bindTexture2(14, 5, 'img/table/table5.jpg')

  bindTexture2(15, 0, 'img/lamp/lamp0.jpg')
  bindTexture2(15, 1, 'img/lamp/lamp1.jpg')
  bindTexture2(15, 2, 'img/lamp/lamp2.jpg')

  bindTexture2(16, 0, 'img/bed/bed0.jpg')

  bindTexture2(17, 0, 'img/Airconditioning/Airconditioning.jpg')

  bindTexture2(18, 0, 'img/Airconditioning/Airconditioning.jpg')

  bindTexture2(19, 0, 'img/table/table0.jpg')
  bindTexture2(19, 1, 'img/table/table1.jpg')
  bindTexture2(19, 2, 'img/table/table2.jpg')
  bindTexture2(19, 3, 'img/table/table3.jpg')
  bindTexture2(19, 4, 'img/table/table4.jpg')
  bindTexture2(19, 5, 'img/table/table5.jpg')

  bindTexture2(20, 0, 'img/cabinet/cabinet0.jpg')
  bindTexture2(20, 1, 'img/cabinet/cabinet1.jpg')
  bindTexture2(20, 2, 'img/cabinet/cabinet2.jpg')
  bindTexture2(20, 3, 'img/cabinet/cabinet3.jpg')
  bindTexture2(20, 4, 'img/cabinet/cabinet4.jpg')
  bindTexture2(20, 4, 'img/cabinet/cabinet5.jpg')

  bindTexture2(21, 0, 'img/sofa/sofa0.jpg')
  bindTexture2(21, 1, 'img/sofa/sofa1.jpg')
  bindTexture2(21, 2, 'img/sofa/sofa2.jpg')
  bindTexture2(21, 3, 'img/sofa/sofa3.jpg')
  bindTexture2(21, 4, 'img/sofa/sofa4.jpg')

  bindTexture2(22, 0, 'img/sofa/sofa0.jpg')
  bindTexture2(22, 1, 'img/sofa/sofa1.jpg')
  bindTexture2(22, 2, 'img/sofa/sofa2.jpg')
  bindTexture2(22, 3, 'img/sofa/sofa3.jpg')
  bindTexture2(22, 4, 'img/sofa/sofa4.jpg')

  bindTexture2(23, 0, 'img/computer/computer1.jpg')

  bindTexture2(24, 0, 'img/chair/chair0.jpg')
  bindTexture2(24, 1, 'img/chair/chair1.jpg')
  bindTexture2(24, 2, 'img/chair/chair2.jpg')
  bindTexture2(24, 3, 'img/chair/chair3.jpg')
  bindTexture2(24, 4, 'img/chair/chair4.jpg')

  bindTexture2(25, 0, 'img/chair/chair0.jpg')
  bindTexture2(25, 1, 'img/chair/chair1.jpg')
  bindTexture2(25, 2, 'img/chair/chair2.jpg')
  bindTexture2(25, 3, 'img/chair/chair3.jpg')
  bindTexture2(25, 4, 'img/chair/chair4.jpg')

  bindTexture2(26, 0, 'img/chair/chair0.jpg')
  bindTexture2(26, 1, 'img/chair/chair1.jpg')
  bindTexture2(26, 2, 'img/chair/chair2.jpg')
  bindTexture2(26, 3, 'img/chair/chair3.jpg')
  bindTexture2(26, 4, 'img/chair/chair4.jpg')

  bindTexture2(27, 0, 'img/cabinet/cabinet0.jpg')
  bindTexture2(27, 1, 'img/cabinet/cabinet1.jpg')
  bindTexture2(27, 2, 'img/cabinet/cabinet2.jpg')
  bindTexture2(27, 3, 'img/cabinet/cabinet3.jpg')
  bindTexture2(27, 4, 'img/cabinet/cabinet4.jpg')
  bindTexture2(27, 5, 'img/cabinet/cabinet5.jpg')

  bindTexture2(28, 0, 'img/cabinet/cabinet0.jpg')
  bindTexture2(28, 1, 'img/cabinet/cabinet1.jpg')
  bindTexture2(28, 2, 'img/cabinet/cabinet2.jpg')
  bindTexture2(28, 3, 'img/cabinet/cabinet3.jpg')
  bindTexture2(28, 4, 'img/cabinet/cabinet4.jpg')
  bindTexture2(28, 5, 'img/cabinet/cabinet5.jpg')

  bindTexture2(29, 0, 'img/others/vase.jpg')

  bindTexture2(30, 0, 'img/Decorations/Decorations0.jpg')
  bindTexture2(30, 1, 'img/Decorations/Decorations1.jpg')
  bindTexture2(30, 2, 'img/Decorations/Decorations2.jpg')
  bindTexture2(30, 3, 'img/Decorations/Decorations3.jpg')
  bindTexture2(30, 4, 'img/Decorations/Decorations4.jpg')

  bindTexture2(31, 0, 'img/Decorations/Decorations0.jpg')
  bindTexture2(31, 1, 'img/Decorations/Decorations1.jpg')
  bindTexture2(31, 2, 'img/Decorations/Decorations2.jpg')
  bindTexture2(31, 3, 'img/Decorations/Decorations3.jpg')
  bindTexture2(31, 4, 'img/Decorations/Decorations4.jpg')

  bindTexture2(32, 0, 'img/Decorations/Decorations0.jpg')
  bindTexture2(32, 1, 'img/Decorations/Decorations1.jpg')
  bindTexture2(32, 2, 'img/Decorations/Decorations2.jpg')
  bindTexture2(32, 3, 'img/Decorations/Decorations3.jpg')
  bindTexture2(32, 4, 'img/Decorations/Decorations4.jpg')

  bindTexture2(33, 0, 'img/others/books.jpg')

  bindTexture2(34, 0, 'img/others/trashcan.jpg')

  bindTexture2(35, 0, 'img/table/table0.jpg')
  bindTexture2(35, 1, 'img/table/table1.jpg')
  bindTexture2(35, 2, 'img/table/table2.jpg')
  bindTexture2(35, 3, 'img/table/table3.jpg')
  bindTexture2(35, 4, 'img/table/table4.jpg')
  bindTexture2(35, 5, 'img/table/table5.jpg')

  bindTexture2(36, 0, 'img/table/table0.jpg')
  bindTexture2(36, 1, 'img/table/table1.jpg')
  bindTexture2(36, 2, 'img/table/table2.jpg')
  bindTexture2(36, 3, 'img/table/table3.jpg')
  bindTexture2(36, 4, 'img/table/table4.jpg')
  bindTexture2(36, 5, 'img/table/table5.jpg')

  bindTexture2(37, 0, 'img/frame/frame0.jpg')
  bindTexture2(37, 1, 'img/frame/frame1.jpg')
  bindTexture2(37, 2, 'img/frame/frame2.jpg')
  bindTexture2(37, 3, 'img/frame/frame3.jpg')
  bindTexture2(37, 4, 'img/frame/frame4.jpg')

  bindTexture2(38, 0, 'img/door/door.jpg')
  for (var k = 1; k <= numofTVchannel; k++) {
    for (var i = 1; i <= PicturesOfChannel[k]; i++) {
      initTVTexture(k, i)
    }
  }
}

// bindTexture 
// num1 为物体序号
// num2 为贴图序号
function bindTexture (num1, num2, shape) {
  ThingsTextureLoad[num1][num2] = false
  ThingsTexture[num1][num2] = gl.createTexture()
  ThingsTexture[num1][num2].image = new Image()
  ThingsTexture[num1][num2].image.onload = function () {
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

  ThingsTexture2[num1][num2].image.src = shape
}

// num 为贴图序号

function bindWallTexture (num, shape) {
  wallTexture[num] = gl.createTexture()
  wallTexture[num].image = new Image()
  wallTexture[num].image.onload = function () {
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

  floorTexture[num].image.src = shape
}
function bindCeilingTexture (num, shape) {
  ceilingTexture[num] = gl.createTexture()
  ceilingTexture[num].image = new Image()
  ceilingTexture[num].image.onload = function () {
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

  doorTexture[num].image.src = shape
}
function initTVTexture (channel, num) {
  TextureLoad[channel][num] = false
  tvTexture[channel][num] = gl.createTexture()
  tvTexture[channel][num].image = new Image()
  tvTexture[channel][num].image.onload = function () {
    TextureLoad[channel][num] = true
  }
  tvTexture[channel][num].image.src = 'img/TV-images/TV_' + channel + '/TV_' + channel + '_' + num + '.jpg'
}
