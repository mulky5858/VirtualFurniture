function ItemSelectionBox (i, j) {
  var newdiv = document.createElement('div')
  newdiv.style.position = 'absolute'
  newdiv.style.left = (viewLayoutLeft + windowBox[i][j][0] * viewLayoutWidth) + 'px'
  newdiv.style.top = (viewLayoutTop + (1 - windowBox[i][j][3]) * viewLayoutHeight) + 'px'
  newdiv.style.width = ((windowBox[i][j][1] - windowBox[i][j][0]) * viewLayoutWidth) + 'px'
  newdiv.style.height = ((windowBox[i][j][3] - windowBox[i][j][2]) * viewLayoutHeight) + 'px'
  newdiv.style.backgroundColor = '#000'
  newdiv.onclick = function () { this.style.display = 'none'; }
  document.body.appendChild(newdiv)
}
