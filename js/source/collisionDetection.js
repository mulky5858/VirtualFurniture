var modelMoveX1 = true
var modelMoveX2 = true
var modelMoveY1 = true
var modelMoveY2 = true
var modelMoveZ1 = true
var modelMoveZ2 = true
var boundaryBox = Array()

for (var i = 0; i <= MaxNumberOfObjects; i++) {
  boundaryBox[i] = Array()
}

function cameraCD () {
  if (viewstyle) {
    if ( (Math.floor(xPos + 10) < 0 || Math.floor(xPos + 10) > 19 || Math.floor(zPos + 10) < 0 || Math.floor(zPos + 10) > 19)) {
      xPos = lastXPos
      zPos = lastZPos
    }else {
      if (!mapdiv[Math.floor(xPos + 10)][Math.floor(zPos + 10)] && !testmode) {
        xPos = lastXPos
        zPos = lastZPos
      }
    }
  }
}

function modelCD () {
  // 我认为没有必要	

}
