var sliderleft

function refreshwebsite () {
  document.getElementById('titlepicture').style.left = document.body.clientWidth / 2 - 500
  document.getElementById('buttonbar').style.left = document.body.clientWidth / 2 - 500
  document.getElementById('view').style.left = document.body.clientWidth / 2 - 500
  document.getElementById('viewload').style.left = document.body.clientWidth / 2 - 500
  document.getElementById('sliderbar').style.left = document.body.clientWidth / 2 + 260

  document.getElementById('input').style.left = document.body.clientWidth / 2 - 500 + 30
  document.getElementById('promptAdd').style.left = document.body.clientWidth / 2 + 350

  document.getElementById('caption').style.left = document.body.clientWidth / 2 - 500

  document.getElementById('inputstream').style.left = document.body.clientWidth / 2 - 300
  document.getElementById('outputstream').style.left = document.body.clientWidth / 2 - 300

  document.getElementById('thingsinformation').style.left = document.body.clientWidth / 2 + 50
  document.getElementById('thingsinformationText').style.left = document.body.clientWidth / 2 + 65

  document.getElementById('roomname').style.left = document.body.clientWidth / 2 - 100
  document.getElementById('roomnameInputArea').style.left = document.body.clientWidth / 2 - 100

  document.getElementById('logonarea').style.top = document.body.clientHeight / 2 - 250
  document.getElementById('logonarea').style.left = -250

  // sliderleft=document.body.clientWidth/2-500+30
  // document.getElementById("button").style.left =sliderleft
  // document.getElementById("floatingBox").style.left =sliderleft+80

  if (showMap) {
    mapleft = document.body.clientWidth / 2 - 500 + 25
    refreshmap()
    document.getElementById('openmap').style.left = mapleft - 20
    document.getElementById('player').style.left = mapleft
    document.getElementById('player').style.top = maptop
  }
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
}

function viewclose () {
  document.getElementById('viewload').style.display = 'block'
  keyevent = 0
}

function viewopen () {
  document.getElementById('viewload').style.display = 'none'
  keyevent = 1
}
