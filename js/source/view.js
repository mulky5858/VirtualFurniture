function changeView () {
  if (!viewstyle) {
    viewstyle = 1

    window.setTimeout(function () {
      if (viewstyle == 1) document.getElementById('Viewpull').style.display = 'none'
    },
      1300
    )

    ButtonEffect('Viewpull', 'rollOut')
    window.setTimeout(function () {
      if (viewstyle == 1) document.getElementById('Viewpush').style.display = 'none'
    },
      1300
    )
    ButtonEffect('Viewpush', 'rollOut')
    document.getElementById('viewbutton').style.backgroundImage = 'url(icons/view1.png)'
  }else {
    viewstyle = 0

    document.getElementById('Viewpull').style.display = 'block'
    ButtonEffect('Viewpush', 'rollIn')
    document.getElementById('Viewpush').style.display = 'block'
    ButtonEffect('Viewpull', 'rollIn')
    document.getElementById('viewbutton').style.backgroundImage = 'url(icons/view2.png)'
  }

  CharacterReset()
}

function viewlock () {
  if (viewstyle) {
    CameraFollow = !CameraFollow
    yawRate = 0
    yawRate2 = 0
    speed = 0
    speed2 = 0
    pitchRate = 0
  }
}

function CharacterReset () {
  if (viewstyle) {
    zPos = 1
    viewheight = (height - 0.1) / roomheight * 2.43
    pitch = 0
  }else {
    zPos = 9.5
    viewheight = 10
    pitch = -40
  }
  xPos = 0
  yaw = 0
  joggingAngle = 0
  viewonchange++
  yPos = viewheight
}

function tapmode () {
  if (ControlMode == 0) {
    ControlMode = 1
    alert('拖动模式开启。')
  }else {
    ControlMode = 0
    alert('点选模式开启。')
  }
}

function changetestmode () {
  if (testmode == 0) {
    testmodeonload()
    alert('测试模式开启。')
  }else {
    testmodeclose()
    alert('测试模关闭。')
  }
}
