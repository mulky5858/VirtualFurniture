var sliderleft
var viewLayoutLeft = 20
var viewLayoutTop = 150
var viewLayoutWidth = 750
var viewLayoutHeight = 450

function setBox (id, left, top, width, height) {
  var el = document.getElementById(id)
  if (!el) return
  if (typeof left === 'number') el.style.left = left + 'px'
  if (typeof top === 'number') el.style.top = top + 'px'
  if (typeof width === 'number') {
    el.style.width = width + 'px'
    if (el.tagName === 'CANVAS') {
      // 仅在尺寸变化时重设绘图缓冲，避免每帧清空画布
      if (el.width !== width) el.width = width
    }
  }
  if (typeof height === 'number') {
    el.style.height = height + 'px'
    if (el.tagName === 'CANVAS') {
      if (el.height !== height) el.height = height
    }
  }
}

function refreshwebsite () {
  var bodyW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
  var bodyH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight

  var sideMargin = 16
  var gap = 12
  var sidebarW = 240
  var topChrome = 150
  var bottomChrome = 40

  var viewW = Math.max(320, Math.floor(bodyW - sidebarW - sideMargin * 2 - gap))
  var viewH = Math.max(240, Math.floor(bodyH - topChrome - bottomChrome))
  var viewLeft = sideMargin
  var viewTop = topChrome
  var sidebarLeft = viewLeft + viewW + gap

  viewLayoutLeft = viewLeft
  viewLayoutTop = viewTop
  viewLayoutWidth = viewW
  viewLayoutHeight = viewH

  var canvas = document.getElementById('view')
  var sizeChanged = canvas && (canvas.width !== viewW || canvas.height !== viewH)
  setBox('view', viewLeft, viewTop, viewW, viewH)
  if (sizeChanged && typeof gl !== 'undefined' && gl) {
    gl.viewportWidth = viewW
    gl.viewportHeight = viewH
    gl.viewport(0, 0, viewW, viewH)
  }

  setBox('viewload', viewLeft, viewTop, viewW, viewH)
  // 标题/按钮栏随主视图变宽，侧边栏保持素材原始高度，避免背景图平铺重复
  setBox('titlepicture', viewLeft, 8, viewW, 40)
  setBox('buttonbar', viewLeft, 55, viewW, 90)
  setBox('sliderbar', sidebarLeft, 8, sidebarW, 590)

  setBox('input', viewLeft + 30, 65)
  setBox('promptAdd', sidebarLeft + 50, 140)
  setBox('caption', viewLeft, viewTop + viewH + 8, Math.max(viewW + gap + sidebarW, 600), 30)

  setBox('inputstream', Math.max(sideMargin, Math.floor(bodyW / 2 - 300)), Math.floor(bodyH / 2 - 200))
  setBox('outputstream', Math.max(sideMargin, Math.floor(bodyW / 2 - 300)), Math.floor(bodyH / 2 - 200))

  // 贴在 3D 视图右上角（原先按页面中心定位，自适应布局后会偏）
  setBox('thingsinformation', viewLeft + viewW - 200, viewTop)
  setBox('thingsinformationText', viewLeft + viewW - 185, viewTop + 30)

  setBox('roomname', viewLeft + Math.floor(viewW / 2 - 100), 40)
  setBox('roomnameInputArea', viewLeft + Math.floor(viewW / 2 - 100), 40)

  setBox('logonarea', -250, Math.floor(bodyH / 2 - 250))

  if (showMap) {
    mapleft = viewLeft + 25
    maptop = viewTop + 40
    refreshmap()
    setBox('openmap', viewLeft + 5, viewTop + 10)
    var player = document.getElementById('player')
    if (player) {
      player.style.left = mapleft + 'px'
      player.style.top = maptop + 'px'
    }
  }

  if (typeof updatePointerLockUI === 'function') updatePointerLockUI()
}

function framedisplay () {
  document.getElementById('view').style.display = 'block'
  ButtonEffect('view', 'fadeInUp')
  document.getElementById('titlepicture').style.display = 'block'
  ButtonEffect('titlepicture', 'bounceInDown')
  document.getElementById('buttonbar').style.display = 'block'
  ButtonEffect('buttonbar', 'bounceInLeft')
  document.getElementById('sliderbar').style.display = 'block'
  ButtonEffect('sliderbar', 'rotateInDownLeft')
  // document.getElementById("button").style.display='block'

  document.getElementById('input').style.display = 'block'
  ButtonEffect('input', 'flipInX')
  document.getElementById('caption').style.display = 'block'
  ButtonEffect('caption', 'bounceInLeft')

  document.getElementById('loadingtext').style.display = 'none'
  if (showtesttext) document.getElementById('testtext').style.display = 'block'

  document.getElementById('logonarea').style.display = 'block'
  ButtonEffect('logonarea', 'flipInX')

  if (showRoomName) document.getElementById('roomname').style.display = 'block'

  if (showMap) {
    document.getElementById('openmap').style.display = 'block'
    ButtonEffect('openmap', 'flipInX')
  }
  document.getElementById('loadbar').style.display = 'none'

  refreshwebsite()
}

function viewclose () {
  document.getElementById('viewload').style.display = 'block'
  keyevent = 0
}

function viewopen () {
  document.getElementById('viewload').style.display = 'none'
  keyevent = 1
}
