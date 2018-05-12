var texture_click = false
var model_click = false
var model_select = 0
var texture_select = 0
function HideAll () {
  HideModel()
  HideTexture()
  inputareacancel()
  outputareacancel()
// document.getElementById("floatingBox").style.display='none'
}

function HideModel () {
  $('#modelMenu').hide()
  $('#modelMenu_1').hide()
  $('#modelMenu_2').hide()
  $('#modelMenu_3').hide()
  $('#modelMenu_4').hide()
  $('#modelMenu_5').hide()
  $('#modelMenu_6').hide()
  $('#modelMenu_7').hide()
  $('#modelMenu_8').hide()
  $('#modelMenu_9').hide()
  $('#modelMenu_10').hide()
  $('#modelMenu_11').hide()
  $('#modelMenu_12').hide()
  model_click = false
  model_select = 0
  showmodelicon()
}

function HideTexture () {
  $('#textureMenu_1').hide()
  $('#textureMenu_2').hide()
  $('#textureMenu_3').hide()
  $('#textureMenu_4').hide()
  $('#textureMenu_5').hide()
  $('#textureMenu_6').hide()
  $('#textureMenu_7').hide()
  $('#textureMenu_8').hide()
  $('#ceilingtextureMenu').hide()
  $('#walltextureMenu').hide()
  $('#floortextureMenu').hide()
  texture_click = false
  texture_select = 0
  showtextureicon()
}
function newThings (num) {
  gl2_translateTexture = 0
  gl2_things = num
}

function creatNewThings (num) {
  if (num >= 0) {
    if (numThings[num] <= (MaxNumberOfObjects - 1)) {
      numThings[num]++
      var temp = ThingsDefualtLocation(num)
      if (viewstyle) {
        var ntxPos = xPos - 2.5 * Math.sin(degToRad(yaw))
        var ntzPos = zPos - 2.5 * Math.cos(degToRad(yaw))

        translateVector[num][numThings[num]] = [ntxPos, temp[1] + 0.5, ntzPos]
      }else {
        translateVector[num][numThings[num]] = [temp[0], temp[1] + 0.5, temp[2]]
      }
      flagThings[num][numThings[num]] = 1
    }else {
      alert('无法再添加更多的此种物品。')
    }
  }else {
    alert('请选择物品。')
  }
}

function showceilingTextureMenu (flag) {
  if (flag) {
    lagelapsedtozero()
    // $('#button').css('background-image', 'url(icons/arrow-left.png)')
    HideTexture()
    texture_click = true
    document.getElementById('textureslider').style.display = 'block'
    $('#ceilingtextureMenu').show()
    texture_select = 9
    showtextureicon()
  }else {
    // $('#button').css('background-image', 'url(icons/arrow-right.png)')
    HideTexture()
  }
}
function showwallTextureMenu (flag) {
  if (flag) {
    lagelapsedtozero()
    // $('#button').css('background-image', 'url(icons/arrow-left.png)')
    HideTexture()
    texture_click = true
    document.getElementById('textureslider').style.display = 'block'
    $('#walltextureMenu').show()
    texture_select = 10
    showtextureicon()
  }else {
    // $('#button').css('background-image', 'url(icons/arrow-right.png)')
    HideTexture()
  }
}
function showfloorTextureMenu (flag) {
  if (flag) {
    lagelapsedtozero()
    // $('#button').css('background-image', 'url(icons/arrow-left.png)')
    HideTexture()
    texture_click = true
    document.getElementById('textureslider').style.display = 'block'
    $('#floortextureMenu').show()
    texture_select = 11
    showtextureicon()
  }else {
    // $('#button').css('background-image', 'url(icons/arrow-right.png)')
    HideTexture()
  }
}

function showTextureMenu (flag, num) {
  if (flag) {
    lagelapsedtozero()
    // $('#button').css('background-image', 'url(icons/arrow-left.png)')
    HideTexture()
    texture_click = true
    document.getElementById('textureslider').style.display = 'block'
    switch (num) {
      case 0:
        $('#textureMenu_6').show()
        texture_select = 6
        break
      case 1:
        $('#textureMenu_4').show()
        texture_select = 4
        break
      case 2:

        break
      case 3:
        $('#textureMenu_3').show()
        texture_select = 3
        break
      case 4:
        $('#textureMenu_1').show()
        texture_select = 1
        break
      case 5:

        break
      case 6:

        break
      case 7:

        break
      case 8:
        $('#textureMenu_1').show()
        texture_select = 1
        break
      case 9:
        $('#textureMenu_2').show()
        texture_select = 2
        break
      case 10:
        $('#textureMenu_1').show()
        texture_select = 1
        break
      case 11:

        break
      case 12:

        break
      case 13:

        break
      case 14:
        $('#textureMenu_3').show()
        texture_select = 3
        break
      case 15:
        $('#textureMenu_6').show()
        texture_select = 6
        break
      case 16:
        $('#textureMenu_2').show()
        texture_select = 2
        break
      case 17:

        break
      case 18:

        break
      case 19:
        $('#textureMenu_3').show()
        texture_select = 3
        break
      case 20:
        $('#textureMenu_1').show()
        texture_select = 1
        break
      case 21:
        $('#textureMenu_4').show()
        texture_select = 4
        break
      case 22:
        $('#textureMenu_4').show()
        texture_select = 4
        break
      case 23:

        break
      case 24:
        $('#textureMenu_5').show()
        texture_select = 5
        break
      case 25:
        $('#textureMenu_5').show()
        texture_select = 5
        break
      case 26:
        $('#textureMenu_5').show()
        texture_select = 5
        break
      case 27:
        $('#textureMenu_1').show()
        texture_select = 1
        break
      case 28:
        $('#textureMenu_1').show()
        texture_select = 1
        break
      case 29:

        break
      case 30:
        $('#textureMenu_7').show()
        texture_select = 7
        break
      case 31:
        $('#textureMenu_7').show()
        texture_select = 7
        break
      case 32:
        $('#textureMenu_7').show()
        texture_select = 7
        break
      case 33:

        break
      case 34:

        break
      case 35:
        $('#textureMenu_3').show()
        texture_select = 3
        break
      case 36:
        $('#textureMenu_3').show()
        texture_select = 3
        break
      case 37:
        $('#textureMenu_8').show()
        texture_select = 8
        break

    }
    showtextureicon()
  }else {
    // $('#button').css('background-image', 'url(icons/arrow-right.png)')
    HideTexture()
  }
}

function showModelMenu (flag) {
  if (flag) {
    lagelapsedtozero()
    // $('#button').css('background-image', 'url(icons/arrow-left.png)')
    HideModel()
    document.getElementById('modelslider').style.display = 'block'
    $('#modelMenu').show()
    model_click = true
    showmodelicon()
  }else {
    // $('#button').css('background-image', 'url(icons/arrow-right.png)')
    HideModel()
  }
}

$(document).ready(function () {
  HideAll()

  $('#button').click(function () {
    if (!model_click && !texture_click) showModelMenu(true)
    else {
      HideAll()
      model_click = true
      document.getElementById('modelslider').style.display = 'block'
      $('#modelMenu').show()
      showmodelicon()
    }
  })

  $('#buttonEmpty').click(function () {
    lagelapsedtozero()
    inputstream('input/empty.txt')
  })
  $('#buttonDefault1').click(function () {
    lagelapsedtozero()
    inputstream('input/default1.txt')
  })
  $('#buttonDefault2').click(function () {
    lagelapsedtozero()
    inputstream('input/default2.txt')
  })

  $('#buttonOutput').click(function () {
    closemap()
    lagelapsedtozero()
    if (document.getElementById('outputstream').style.display == 'none') {
      outputstream()
      document.getElementById('outputstream').style.display = 'block'
      inputareacancel()
    }
    else outputareacancel()
  })
  $('#buttonInput').click(function () {
    closemap()
    lagelapsedtozero()
    if (document.getElementById('inputstream').style.display == 'none') {
      document.getElementById('inputstream').style.display = 'block'
      outputareacancel()
    }
    else inputareacancel()
  })
  $('#help').click(function () {
    closemap()
    lagelapsedtozero()
    var iWidth = 500
    var iHeight = 400
    var iTop = (window.screen.availHeight - 30 - iHeight) / 2
    var iLeft = (window.screen.availWidth - 10 - iWidth) / 2
    window.open('html/help.html', '帮助', 'height=' + iHeight + ', width=' + iWidth + ', top=' + iTop + ', left=' + iLeft + ', toolbar=no, menubar=no, location=no, status=no')
  })
  $('#model_1').click(function () {
    lagelapsedtozero()
    $('#modelMenu').hide()
    $('#modelMenu_1').show()
    model_select = 1
    showmodelicon()
  })

  $('#model_2').click(function () {
    lagelapsedtozero()
    $('#modelMenu').hide()
    $('#modelMenu_2').show()
    model_select = 2
    showmodelicon()
  })
  $('#model_3').click(function () {
    lagelapsedtozero()
    $('#modelMenu').hide()
    $('#modelMenu_3').show()
    model_select = 3
    showmodelicon()
  })
  $('#model_4').click(function () {
    lagelapsedtozero()
    $('#modelMenu').hide()
    $('#modelMenu_4').show()
    model_select = 4
    showmodelicon()
  })

  $('#model_5').click(function () {
    lagelapsedtozero()
    $('#modelMenu').hide()
    $('#modelMenu_5').show()
    model_select = 5
    showmodelicon()
  })
  $('#model_6').click(function () {
    lagelapsedtozero()
    $('#modelMenu').hide()
    $('#modelMenu_6').show()
    model_select = 6
    showmodelicon()
  })
  $('#model_7').click(function () {
    lagelapsedtozero()
    $('#modelMenu').hide()
    $('#modelMenu_7').show()
    model_select = 7
    showmodelicon()
  })

  $('#model_8').click(function () {
    lagelapsedtozero()
    $('#modelMenu').hide()
    $('#modelMenu_8').show()
    model_select = 8
    showmodelicon()
  })
  $('#model_9').click(function () {
    lagelapsedtozero()
    $('#modelMenu').hide()
    $('#modelMenu_9').show()
    model_select = 9
    showmodelicon()
  })
  $('#model_10').click(function () {
    lagelapsedtozero()
    $('#modelMenu').hide()
    $('#modelMenu_10').show()
    model_select = 10
    showmodelicon()
  })

  $('#model_11').click(function () {
    lagelapsedtozero()
    $('#modelMenu').hide()
    $('#modelMenu_11').show()
    model_select = 11
    showmodelicon()
  })
  $('#model_12').click(function () {
    lagelapsedtozero()
    $('#modelMenu').hide()
    $('#modelMenu_12').show()
    model_select = 12
    showmodelicon()
  })

  $('#model_1_1').click(function () {
    lagelapsedtozero()
    newThings(2)
  })
  $('#model_2_1').click(function () {
    lagelapsedtozero()
    newThings(23)
  })
  $('#model_2_2').click(function () {
    lagelapsedtozero()
    newThings(13)
  })
  $('#model_3_1').click(function () {
    lagelapsedtozero()
    newThings(7)
  })
  $('#model_3_2').click(function () {
    lagelapsedtozero()
    newThings(17)
  })
  $('#model_3_3').click(function () {
    lagelapsedtozero()
    // newThings(18)
    alert('添加失败，此物品约会去了...')
  })
  $('#model_4_1').click(function () {
    lagelapsedtozero()
    newThings(4)
  })
  $('#model_4_2').click(function () {
    lagelapsedtozero()
    newThings(8)
  })
  $('#model_4_3').click(function () {
    lagelapsedtozero()
    newThings(27)
  })
  $('#model_4_4').click(function () {
    lagelapsedtozero()
    newThings(28)
  })
  $('#model_4_5').click(function () {
    lagelapsedtozero()
    newThings(10)
  })
  $('#model_4_6').click(function () {
    lagelapsedtozero()
    newThings(20)
  })
  $('#model_5_1').click(function () {
    lagelapsedtozero()
    newThings(9)
  })
  $('#model_5_2').click(function () {
    lagelapsedtozero()
    newThings(16)
  })
  $('#model_6_1').click(function () {
    lagelapsedtozero()
    newThings(3)
  })
  $('#model_6_2').click(function () {
    lagelapsedtozero()
    newThings(19)
  })
  $('#model_6_3').click(function () {
    lagelapsedtozero()
    // newThings(35)
    alert('添加失败，此物品被某股异次元力量带走了...')
  })
  $('#model_6_4').click(function () {
    lagelapsedtozero()
    newThings(36)
  })
  $('#model_6_5').click(function () {
    lagelapsedtozero()
    newThings(14)
  })
  $('#model_7_1').click(function () {
    lagelapsedtozero()
    newThings(1)
  })
  $('#model_7_2').click(function () {
    lagelapsedtozero()
    newThings(21)
  })
  $('#model_7_3').click(function () {
    lagelapsedtozero()
    newThings(22)
  })
  $('#model_8_1').click(function () {
    lagelapsedtozero()
    newThings(24)
  })
  $('#model_8_2').click(function () {
    lagelapsedtozero()
    newThings(25)
  })
  $('#model_8_3').click(function () {
    lagelapsedtozero()
    newThings(26)
  })
  $('#model_9_1').click(function () {
    lagelapsedtozero()
    newThings(0)
  })
  $('#model_9_2').click(function () {
    lagelapsedtozero()
    newThings(15)
  })
  $('#model_10_1').click(function () {
    lagelapsedtozero()
    newThings(5)
  })
  $('#model_10_2').click(function () {
    lagelapsedtozero()
    newThings(29)
  })
  $('#model_10_3').click(function () {
    lagelapsedtozero()
    newThings(30)
  })
  $('#model_10_4').click(function () {
    lagelapsedtozero()
    newThings(31)
  })
  $('#model_10_5').click(function () {
    lagelapsedtozero()
    newThings(32)
  })
  $('#model_11_1').click(function () {
    lagelapsedtozero()
    newThings(37)
  })
  $('#model_12_1').click(function () {
    lagelapsedtozero()
    newThings(6)
  })
  $('#model_12_2').click(function () {
    lagelapsedtozero()
    newThings(12)
  })
  $('#model_12_3').click(function () {
    lagelapsedtozero()
    newThings(11)
  })
  $('#model_12_4').click(function () {
    lagelapsedtozero()
    newThings(33)
  })
  $('#model_12_5').click(function () {
    lagelapsedtozero()
    newThings(34)
  })
  $('#model_12_6').click(function () {
    lagelapsedtozero()
    newThings(38)
  })
  $('#ceilingtexture_1').click(function () {
    lagelapsedtozero()
    translateCelingTexture = 0
  })
  $('#ceilingtexture_2').click(function () {
    lagelapsedtozero()
    translateCelingTexture = 1
  })
  $('#ceilingtexture_3').click(function () {
    lagelapsedtozero()
    translateCelingTexture = 2
  })
  $('#ceilingtexture_4').click(function () {
    lagelapsedtozero()
    translateCelingTexture = 3
  })
  $('#ceilingtexture_5').click(function () {
    lagelapsedtozero()
    translateCelingTexture = 4
  })
  $('#ceilingtexture_6').click(function () {
    lagelapsedtozero()
    translateCelingTexture = 5
  })
  $('#ceilingtexture_7').click(function () {
    lagelapsedtozero()
    translateCelingTexture = 6
  })
  $('#ceilingtexture_8').click(function () {
    lagelapsedtozero()
    translateCelingTexture = 7
  })
  $('#ceilingtexture_9').click(function () {
    lagelapsedtozero()
    translateCelingTexture = 8
  })
  $('#ceilingtexture_10').click(function () {
    lagelapsedtozero()
    translateCelingTexture = 9
  })
  $('#ceilingtexture_11').click(function () {
    lagelapsedtozero()
    translateCelingTexture = 10
  })
  $('#ceilingtexture_12').click(function () {
    lagelapsedtozero()
    translateCelingTexture = 11
  })

  $('#walltexture_1').click(function () {
    lagelapsedtozero()
    translateWallTexture = 0
  })
  $('#walltexture_2').click(function () {
    lagelapsedtozero()
    translateWallTexture = 1
  })
  $('#walltexture_3').click(function () {
    lagelapsedtozero()
    translateWallTexture = 2
  })
  $('#walltexture_4').click(function () {
    lagelapsedtozero()
    translateWallTexture = 3
  })
  $('#walltexture_5').click(function () {
    lagelapsedtozero()
    translateWallTexture = 4
  })
  $('#walltexture_6').click(function () {
    lagelapsedtozero()
    translateWallTexture = 5
  })
  $('#walltexture_7').click(function () {
    lagelapsedtozero()
    translateWallTexture = 6
  })
  $('#walltexture_8').click(function () {
    lagelapsedtozero()
    translateWallTexture = 7
  })
  $('#walltexture_9').click(function () {
    lagelapsedtozero()
    translateWallTexture = 8
  })
  $('#walltexture_10').click(function () {
    lagelapsedtozero()
    translateWallTexture = 9
  })

  $('#floortexture_1').click(function () {
    lagelapsedtozero()
    translateFloorTexture = 0
  })
  $('#floortexture_2').click(function () {
    lagelapsedtozero()
    translateFloorTexture = 1
  })
  $('#floortexture_3').click(function () {
    lagelapsedtozero()
    translateFloorTexture = 2
  })
  $('#floortexture_4').click(function () {
    lagelapsedtozero()
    translateFloorTexture = 3
  })
  $('#floortexture_5').click(function () {
    lagelapsedtozero()
    translateFloorTexture = 4
  })
  $('#floortexture_6').click(function () {
    lagelapsedtozero()
    translateFloorTexture = 5
  })
  $('#floortexture_7').click(function () {
    lagelapsedtozero()
    translateFloorTexture = 6
  })
  $('#floortexture_8').click(function () {
    lagelapsedtozero()
    translateFloorTexture = 7
  })
  $('#floortexture_9').click(function () {
    lagelapsedtozero()
    translateFloorTexture = 8
  })
  $('#floortexture_10').click(function () {
    lagelapsedtozero()
    translateFloorTexture = 9
  })
  $('#texture_1_0').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 0
  })
  $('#texture_1_1').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 1
  })
  $('#texture_1_2').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 2
  })
  $('#texture_1_3').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 3
  })
  $('#texture_1_4').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 4
  })
  $('#texture_1_5').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 5
  })
  $('#texture_2_0').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 0
  })
  $('#texture_3_0').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 0
  })
  $('#texture_3_1').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 1
  })
  $('#texture_3_2').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 2
  })
  $('#texture_3_3').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 3
  })
  $('#texture_3_4').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 4
  })
  $('#texture_3_5').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 5
  })
  $('#texture_4_0').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 0
  })
  $('#texture_4_1').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 1
  })
  $('#texture_4_2').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 2
  })
  $('#texture_4_3').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 3
  })
  $('#texture_4_4').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 4
  })
  $('#texture_5_0').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 0
  })
  $('#texture_5_1').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 1
  })
  $('#texture_5_2').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 2
  })
  $('#texture_5_3').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 3
  })
  $('#texture_5_4').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 4
  })
  $('#texture_6_0').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 0
  })
  $('#texture_6_1').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 1
  })
  $('#texture_6_2').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 2
  })
  $('#texture_7_0').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 0
  })
  $('#texture_7_1').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 1
  })
  $('#texture_7_2').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 2
  })
  $('#texture_7_3').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 3
  })
  $('#texture_7_4').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 4
  })
  $('#texture_8_0').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 0
  })
  $('#texture_8_1').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 1
  })
  $('#texture_8_2').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 2
  })
  $('#texture_8_3').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 3
  })
  $('#texture_8_4').click(function () {
    lagelapsedtozero()
    translateTexture[oldi][oldj] = 4
  })
})
