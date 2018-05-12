function roomnameOnClick () {
  document.getElementById('roomnameInputArea').style.display = 'block'
  document.getElementById('roomnameInputArea').value = document.getElementById('roomname').textContent
}

function keyfinishroomname (event) {
  if (event.keyCode == 13) {
    finishroomname()
  }
}
function finishroomname () {
  document.getElementById('roomnameInputArea').style.display = 'none'
  document.getElementById('roomname').textContent = document.getElementById('roomnameInputArea').value
}
