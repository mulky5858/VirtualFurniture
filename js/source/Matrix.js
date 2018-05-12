var mvMatrix = mat4.create()
var mvMatrixStack = []
var pMatrix = mat4.create()

function mvPushMatrix () {
  var copy = mat4.create()
  mat4.set(mvMatrix, copy)
  mvMatrixStack.push(copy)
}

function mvPopMatrix () {
  if (mvMatrixStack.length == 0) {
    throw 'Invalid popMatrix!'
  }
  mvMatrix = mvMatrixStack.pop()
}

function setMatrixUniforms () {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix)
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix)

  var normalMatrix = mat3.create()
  mat4.toInverseMat3(mvMatrix, normalMatrix)
  mat3.transpose(normalMatrix)
  gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix)
}

var mvMatrix2 = mat4.create()
var mvMatrixStack2 = []
var pMatrix2 = mat4.create()

function mvPushMatrix2 () {
  var copy = mat4.create()
  mat4.set(mvMatrix2, copy)
  mvMatrixStack2.push(copy)
}

function mvPopMatrix2 () {
  if (mvMatrixStack2.length == 0) {
    throw 'Invalid popMatrix!'
  }
  mvMatrix2 = mvMatrixStack2.pop()
}

function setMatrixUniforms2 () {
  gl2.uniformMatrix4fv(shaderProgram2.pMatrixUniform, false, pMatrix2)
  gl2.uniformMatrix4fv(shaderProgram2.mvMatrixUniform, false, mvMatrix2)

  var normalMatrix = mat3.create()
  mat4.toInverseMat3(mvMatrix2, normalMatrix)
  mat3.transpose(normalMatrix)
  gl2.uniformMatrix3fv(shaderProgram2.nMatrixUniform, false, normalMatrix)
}
