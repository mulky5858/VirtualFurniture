var sliderleft
var viewLayoutLeft = 20
var viewLayoutTop = 150
var viewLayoutWidth = 750
var viewLayoutHeight = 450
var sidebarScaleCurrent = 1

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

function applySliderbarScale (sidebarLeft, scale) {
  var designSidebarW = 240
  var designSidebarH = 590
  var sliderbar = document.getElementById('sliderbar')
  if (!sliderbar) return

  sidebarScaleCurrent = scale
  sliderbar.style.left = sidebarLeft + 'px'
  sliderbar.style.top = '8px'
  sliderbar.style.width = designSidebarW + 'px'
  sliderbar.style.height = designSidebarH + 'px'
  sliderbar.style.backgroundSize = designSidebarW + 'px ' + designSidebarH + 'px'
  sliderbar.style.zoom = ''
  sliderbar.style.opacity = '1'
  sliderbar.style.visibility = 'visible'
  sliderbar.style.transformOrigin = 'top left'
  sliderbar.style.webkitTransformOrigin = 'top left'
  sliderbar.style.transform = 'scale(' + scale + ')'
  sliderbar.style.webkitTransform = 'scale(' + scale + ')'
  sliderleft = sidebarLeft
}

function refreshwebsite () {
  var bodyW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
  var bodyH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight

  var sideMargin = 16
  var gap = 12
  var topChrome = 150
  var bottomChrome = 40

  // 右侧菜单按设计稿 240×590 等比放大，随窗口可用空间变化
  var designSidebarW = 240
  var designSidebarH = 590
  var availSidebarH = Math.max(320, bodyH - 16)
  var availSidebarW = Math.max(240, Math.floor(bodyW * 0.30))
  var sidebarScale = Math.min(availSidebarW / designSidebarW, availSidebarH / designSidebarH)
  if (sidebarScale < 0.85) sidebarScale = 0.85
  if (sidebarScale > 1.85) sidebarScale = 1.85
  var sidebarW = Math.floor(designSidebarW * sidebarScale)

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
  setBox('titlepicture', viewLeft, 8, viewW, 40)
  var titleEl = document.getElementById('titlepicture')
  if (titleEl) {
    titleEl.style.backgroundSize = 'auto 100%'
    titleEl.style.backgroundPosition = 'left center'
    titleEl.style.backgroundRepeat = 'no-repeat'
  }
  setBox('buttonbar', viewLeft, 55, viewW, 90)

  applySliderbarScale(sidebarLeft, sidebarScale)

  var inputLeft = viewLeft + 30
  setBox('input', inputLeft, 65)
  // 右侧帮助/输入/输出/测试 贴按钮栏右缘排布
  var btnSize = 64
  var btnGap = 6
  var btnPitch = btnSize + btnGap
  var rightEdge = viewW - (inputLeft - viewLeft) // 相对 #input 的按钮栏右边界
  var rightMargin = 28
  var xTest = rightEdge - rightMargin - btnSize
  var xOutput = xTest - btnPitch
  var xInputBtn = xOutput - btnPitch
  var xHelp = xInputBtn - btnPitch
  setBox('help', xHelp)
  setBox('buttonInput', xInputBtn)
  setBox('buttonOutput', xOutput)
  setBox('testmode', xTest)
  setBox('helpText', xHelp)
  setBox('buttonInputText', xInputBtn)
  setBox('buttonOutputText', xOutput)
  setBox('promptAdd', sidebarLeft + Math.floor(50 * sidebarScale), Math.floor(140 * sidebarScale))
  setBox('caption', viewLeft, viewTop + viewH + 8, Math.max(viewW + gap + sidebarW, 600), 30)

  setBox('inputstream', Math.max(sideMargin, Math.floor(bodyW / 2 - 300)), Math.floor(bodyH / 2 - 200))
  setBox('outputstream', Math.max(sideMargin, Math.floor(bodyW / 2 - 300)), Math.floor(bodyH / 2 - 200))

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
  // 先算好最终尺寸，再显示（不做 transform 入场动画，避免把缩放盖掉或透明度卡住）
  refreshwebsite()

  document.getElementById('view').style.display = 'block'
  ButtonEffect('view', 'fadeInUp')
  document.getElementById('titlepicture').style.display = 'block'
  ButtonEffect('titlepicture', 'bounceInDown')
  document.getElementById('buttonbar').style.display = 'block'
  ButtonEffect('buttonbar', 'bounceInLeft')

  var sliderbar = document.getElementById('sliderbar')
  sliderbar.style.display = 'block'
  sliderbar.style.opacity = '1'
  sliderbar.style.visibility = 'visible'
  // 再应用一次缩放，保证可见且尺寸正确
  refreshwebsite()

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
}

function viewclose () {
  document.getElementById('viewload').style.display = 'block'
  keyevent = 0
}

function viewopen () {
  document.getElementById('viewload').style.display = 'none'
  keyevent = 1
}
