function DefaultScale (i) {
  switch (i) {
    case 30:
      return [0.6, 0.6, 0.6]
      break
    default:
      return [1, 1, 1]
      break
  }
}

function initialize () {
  for (var i = 0; i <= MaxNumberOfObjects; i++) {
    numThings[i] = 0
    mvThings[i] = Array()
    mouseDown[i] = Array()
    translateMatrix[i] = Array()
    translateVector[i] = Array()
    translateTexture[i] = Array()
    translateScale[i] = Array()
    rotateAngle[i] = Array()
    flagThings[i] = Array()
  }

  for (var j = 0; j <= MaxNumberOfObjects; j++) {
    DoorAngle[j] = 0
    DoorPresentAngle[j] = 0
    DoorIsOpen[j] = 0
    DoorOpening[j] = 0
    atemp0[j] = 0
    atemp2[j] = 0
    dooratemp0[j] = 0
    dooratemp2[j] = 0
  }
  for (var i = 0; i <= MaxNumberOfObjects; i++)
    for (var j = 0; j <= MaxNumberOfObjects; j++) {
      if (i == 2) {
        showTV[j] = 0
        TVchannel[j] = 1
      }
      mouseDown[i][j] = false
      translateMatrix[i][j] = mat4.create()
      mat4.identity(translateMatrix[i][j])
      translateVector[i][j] = Array()
      translateVector[i][j] = [0, 0, 0]
      translateTexture[i][j] = 0
      translateScale[i][j] = DefaultScale(i)
      rotateAngle[i][j] = 0
      flagThings[i][j] = 0
  }

  // 数组初始化

}

function inputstream (url) {
  viewclose()
  initialize()
  var req = new XMLHttpRequest()
  req.onreadystatechange = function () { processLoadObj(req) }
  req.open('GET', url, false)
  req.send()
}

function processLoadObj (req) {
  if (req.readyState == 4) {
    doLoadObj(req.responseText)
  }
}

function doLoadObj (text) {
  var lines = text.split('\n')
  for (var lineIndex in lines) {
    var line = lines[lineIndex]

    if (line[0] != '#') continue

    var array = line.split(' ')
    var number = parseInt(array[1])
    if (number == -1) {
      translateCelingTexture = parseFloat(array[2])
      translateWallTexture = parseFloat(array[3])
      translateFloorTexture = parseFloat(array[4])
      translateDoorTexture = parseFloat(array[5])
    }else {
      numThings[number] = numThings[number] + 1
      translateVector[number][numThings[number]] = [parseFloat(array[2]), parseFloat(array[3]), parseFloat(array[4])]
      rotateAngle[number][numThings[number]] = parseInt(array[5])
      flagThings[number][numThings[number]] = 1
      translateTexture[number][numThings[number]] = parseInt(array[6])
      translateScale[number][numThings[number]] = [parseFloat(array[7]), parseFloat(array[7]), parseFloat(array[7])]
      if (number == 2) {
        showTV[numThings[number]] = parseInt(array[8])
        TVchannel[numThings[number]] = parseInt(array[9])
      }
    }
  }

  readmap(text)
  HideAll()
  CharacterReset()
  viewopen()

  for (var j = 0; j <= MaxNumberOfObjects; j++) {
    atemp0[j] = translateVector[38][j][0]
    atemp2[j] = translateVector[38][j][2]
  }
}

var inputareaDefalutText = '请在此输入之前输出所得的代码。'

function inputareabuttononclick () {
  initialize()
  doLoadObj(document.getElementById('inputarea').value)
  document.getElementById('inputstream').style.display = 'none'
  document.getElementById('inputarea').value = inputareaDefalutText
}

function inputareaclean () {
  document.getElementById('inputarea').value = ''
}

function inputareacancel () {
  document.getElementById('inputstream').style.display = 'none'
  document.getElementById('inputarea').value = inputareaDefalutText
}

function outputareacancel () {
  document.getElementById('outputstream').style.display = 'none'
  document.getElementById('outputarea').value = ''
}

/*function outputareacopy()
{
	
window.clipboardData.setData('text', document.getElementById("outputarea").value); 
alert("复制成功。");	
}*/

function outputstreamdata () {
  var date = new Date()
  var str = ''
  var count = 0
  for (var i = 0; i <= MaxNumberOfObjects; i++)
    for (var j = 0; j <= MaxNumberOfObjects; j++) {
      if (flagThings[i][j]) {
        str = str + '# ' + i + ' ' + coordinate(i, j)[0] + ' ' + coordinate(i, j)[1] + ' ' + coordinate(i, j)[2] + ' ' + rotateAngle[i][j] + ' ' + translateTexture[i][j] + ' ' + translateScale[i][j][0].toFixed(3)
        if (i == 2) str = str + ' ' + showTV[j] + ' ' + TVchannel[j]
        str = str + '\r\n'
        count++
      }
  }
  for (var i = 0; i <= 19; i++)
    for (var j = 0; j <= 19; j++) {
      if (mapdiv[i][j]) {
        str = str + '@ ' + i + ' ' + j + '\r\n'
      }
  }

  return '//' + date.getFullYear() + '.' + (date.getMonth() + 1) + '.' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + '\r\n' + '# -1 ' + translateCelingTexture + ' ' + translateWallTexture + ' ' + translateFloorTexture + ' ' + translateDoorTexture + '\r\n' + str
}

function outputstream () {

  // "//物品编号 物品坐标 物品旋转角度 物品贴图序号 物品放大倍数(不能为0)\r\n" 

  document.getElementById('outputarea').value = outputstreamdata()
}
