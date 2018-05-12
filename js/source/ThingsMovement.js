function ThingsDefualtLocation (num) {
  switch (num) {
    case 2:
      return [0, 0.5, 0]
      break
    case 7:
      return [0, -0.3, 0]
      break
    case 17:
      return [0, 0.5, 0]
      break
    case 4:
      return [0, -0.4, 0]
      break
    case 8:
      return [0, 0.4, 0]
      break
    case 27:
      return [0, -0.6, 0]
      break
    case 28:
      return [0, 0.5, 0]
      break
    case 10:
      return [0, 0.5, 0]
      break
    case 19:
      return [0, 0.3, 0]
      break
    case 36:
      return [0, 0.5, 0]
      break
    case 0:
      return [0, 0.3, 0]
      break
    case 15:
      return [0, 0.3, 0]
      break
    case 5:
      return [0, 0.5, 0]
      break
    case 29:
      return [0, 0.4, 0]
      break
    case 37:
      return [0, 0.4, 0]
      break
    case 6:
      return [0, 0.5, 0]
      break
    case 12:
      return [0, 0.3, 0]
      break
    case 11:
      return [0, 0.3, 0]
      break
    case 33:
      return [0, 0.3, 0]
      break
    case 38:
      return [0, -0.5, 0]
      break
    default:
      return [0, 0, 0]
      break
  }
}

var DoorIsOpen = Array()
var DoorAngle = Array()
var DoorPresentAngle = Array()
var DoorOpening = Array()

var atemp0 = Array()
var atemp2 = Array()

var dooratemp0 = Array()
var dooratemp2 = Array()

function openthedoor (j) {
  DoorAngle[j] = 100
  DoorOpening[j] = 1
  atemp0[j] = translateVector[38][j][0]
  atemp2[j] = translateVector[38][j][2]
  dooratemp0[j] = coordinate(38, j)[0]
  dooratemp2[j] = coordinate(38, j)[2]
  openthedoor_changeAngle(j, 0.1)
}
function closethedoor (j) {
  DoorAngle[j] = 0
  DoorOpening[j] = 1
  openthedoor_changeAngle(j, -0.1)
}

function openthedoor_changeAngle (j, angle) {
  DoorPresentAngle[j] += angle

  if (Math.abs(rotateAngle[38][j] % 360 - 0) < 1) {
    translateVector[38][j][0] = atemp0[j] + 0.55 - 0.55 * Math.cos(degToRad(DoorPresentAngle[j]))
    translateVector[38][j][2] = atemp2[j] + 0.55 * Math.sin(degToRad(DoorPresentAngle[j]))
  }
  if (Math.abs(rotateAngle[38][j] % 360 - 90) < 1) {
    translateVector[38][j][2] = atemp2[j] - 0.55 + 0.55 * Math.cos(degToRad(DoorPresentAngle[j]))
    translateVector[38][j][0] = atemp0[j] + 0.55 * Math.sin(degToRad(DoorPresentAngle[j]))
  }
  if (Math.abs(rotateAngle[38][j] % 360 - 180) < 1) {
    translateVector[38][j][0] = atemp0[j] - 0.55 + 0.55 * Math.cos(degToRad(DoorPresentAngle[j]))
    translateVector[38][j][2] = atemp2[j] - 0.55 * Math.sin(degToRad(DoorPresentAngle[j]))
  }
  if (Math.abs(rotateAngle[38][j] % 360 - 270) < 1) {
    translateVector[38][j][2] = atemp2[j] + 0.55 - 0.55 * Math.cos(degToRad(DoorPresentAngle[j]))
    translateVector[38][j][0] = atemp0[j] - 0.55 * Math.sin(degToRad(DoorPresentAngle[j]))
  }

  if (Math.abs(DoorPresentAngle[j] - DoorAngle[j]) > 0.2) setTimeout(function () { openthedoor_changeAngle(j, angle) }, 5)
  else DoorOpening[j] = 0
}
