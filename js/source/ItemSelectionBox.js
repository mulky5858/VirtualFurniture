var selectionOutlineReady = false
var selectionOutlineTexture = null
var selectionMaskFBO = null
var selectionMaskTex = null
var selectionMaskDepthRB = null
var selectionMaskW = 0
var selectionMaskH = 0
var selectionEdgeProgram = null
var selectionQuadPos = null
var selectionQuadUV = null

var SELECTION_EDGE_FS = [
  'precision mediump float;',
  'varying vec2 vTextureCoord;',
  'uniform sampler2D uMask;',
  'uniform vec2 uTexel;',
  'uniform float uThickness;',
  'void main(void) {',
  '  float m = texture2D(uMask, vTextureCoord).r;',
  // 物体内部像素一律不画，避免表面中间发白
  '  if (m > 0.5) discard;',
  '  float edge = 0.0;',
  '  for (int i = 1; i <= 3; i++) {',
  '    float s = float(i) * uThickness;',
  '    vec2 t = uTexel * s;',
  '    edge = max(edge, texture2D(uMask, vTextureCoord + vec2( t.x, 0.0)).r);',
  '    edge = max(edge, texture2D(uMask, vTextureCoord + vec2(-t.x, 0.0)).r);',
  '    edge = max(edge, texture2D(uMask, vTextureCoord + vec2( 0.0, t.y)).r);',
  '    edge = max(edge, texture2D(uMask, vTextureCoord + vec2( 0.0,-t.y)).r);',
  '    edge = max(edge, texture2D(uMask, vTextureCoord + vec2( t.x, t.y)).r);',
  '    edge = max(edge, texture2D(uMask, vTextureCoord + vec2( t.x,-t.y)).r);',
  '    edge = max(edge, texture2D(uMask, vTextureCoord + vec2(-t.x, t.y)).r);',
  '    edge = max(edge, texture2D(uMask, vTextureCoord + vec2(-t.x,-t.y)).r);',
  '  }',
  '  if (edge < 0.5) discard;',
  '  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);',
  '}'
].join('\n')

function initSelectionOutline () {
  if (!gl || selectionOutlineReady) return

  selectionOutlineTexture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, selectionOutlineTexture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([255, 255, 255, 255]))
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)

  if (typeof createPostProgram === 'function' && typeof POST_VS !== 'undefined') {
    selectionEdgeProgram = createPostProgram(POST_VS, SELECTION_EDGE_FS)
  }
  if (selectionEdgeProgram) {
    selectionEdgeProgram.maskUniform = gl.getUniformLocation(selectionEdgeProgram, 'uMask')
    selectionEdgeProgram.texelUniform = gl.getUniformLocation(selectionEdgeProgram, 'uTexel')
    selectionEdgeProgram.thicknessUniform = gl.getUniformLocation(selectionEdgeProgram, 'uThickness')
    selectionEdgeProgram.vertexPositionAttribute = gl.getAttribLocation(selectionEdgeProgram, 'aVertexPosition')
    selectionEdgeProgram.textureCoordAttribute = gl.getAttribLocation(selectionEdgeProgram, 'aTextureCoord')
  }

  selectionQuadPos = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, selectionQuadPos)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0
  ]), gl.STATIC_DRAW)

  selectionQuadUV = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, selectionQuadUV)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 0, 1, 0, 0, 1, 1, 1
  ]), gl.STATIC_DRAW)

  selectionOutlineReady = !!selectionEdgeProgram
}

function ensureSelectionMaskTargets (width, height) {
  if (selectionMaskFBO && selectionMaskW === width && selectionMaskH === height) return true

  if (selectionMaskTex) gl.deleteTexture(selectionMaskTex)
  if (selectionMaskDepthRB) gl.deleteRenderbuffer(selectionMaskDepthRB)
  if (selectionMaskFBO) gl.deleteFramebuffer(selectionMaskFBO)

  selectionMaskW = width
  selectionMaskH = height
  selectionMaskTex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, selectionMaskTex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  selectionMaskDepthRB = gl.createRenderbuffer()
  gl.bindRenderbuffer(gl.RENDERBUFFER, selectionMaskDepthRB)
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)

  selectionMaskFBO = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, selectionMaskFBO)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, selectionMaskTex, 0)
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, selectionMaskDepthRB)
  var ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.bindRenderbuffer(gl.RENDERBUFFER, null)
  if (!ok) {
    gl.deleteTexture(selectionMaskTex)
    gl.deleteRenderbuffer(selectionMaskDepthRB)
    gl.deleteFramebuffer(selectionMaskFBO)
    selectionMaskTex = null
    selectionMaskDepthRB = null
    selectionMaskFBO = null
    selectionMaskW = 0
    selectionMaskH = 0
    return false
  }
  return true
}

// 调试用旧 DOM 选择框（showItemSelectionBox=1 时）
function ItemSelectionBox (i, j) {
  if (!windowBox[i] || !windowBox[i][j]) picking()
  if (!windowBox[i] || !windowBox[i][j]) return
  var newdiv = document.createElement('div')
  newdiv.style.position = 'absolute'
  newdiv.style.left = (viewLayoutLeft + windowBox[i][j][0] * viewLayoutWidth) + 'px'
  newdiv.style.top = (viewLayoutTop + (1 - windowBox[i][j][3]) * viewLayoutHeight) + 'px'
  newdiv.style.width = ((windowBox[i][j][1] - windowBox[i][j][0]) * viewLayoutWidth) + 'px'
  newdiv.style.height = ((windowBox[i][j][3] - windowBox[i][j][2]) * viewLayoutHeight) + 'px'
  newdiv.style.border = '2px solid #ffffff'
  newdiv.style.backgroundColor = 'transparent'
  newdiv.style.pointerEvents = 'none'
  newdiv.style.boxSizing = 'border-box'
  newdiv.onclick = function () { this.style.display = 'none' }
  document.body.appendChild(newdiv)
  setTimeout(function () {
    if (newdiv.parentNode) newdiv.parentNode.removeChild(newdiv)
  }, 800)
}

function drawSelectedObjectMesh (num, idx) {
  var ang = rotateAngle[num][idx]
  if (num == 38 && typeof DoorPresentAngle !== 'undefined') {
    ang += DoorPresentAngle[idx]
  }

  mvPushMatrix()
  mat4.translate(mvMatrix, translateVector[num][idx])
  mat4.multiply(mvMatrix, translateMatrix[num][idx])
  mat4.rotateY(mvMatrix, degToRad(ang))
  mat4.scale(mvMatrix, translateScale[num][idx])

  bindAttribBuffer(gl, shaderProgram.vertexPositionAttribute, ThingsVertexPositionBuffer[num])
  bindAttribBuffer(gl, shaderProgram.vertexNormalAttribute, ThingsVertexNormalBuffer[num])
  bindAttribBuffer(gl, shaderProgram.textureCoordAttribute, ThingsVertexTextureCoordBuffer[num])
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ThingsVertexIndexBuffer[num].data)
  setMatrixUniforms()
  gl.drawElements(gl.TRIANGLES, ThingsVertexIndexBuffer[num].numItems, gl.UNSIGNED_SHORT, 0)
  mvPopMatrix()
}

function drawSelectionOutline () {
  if (!isObjectSelected() || !gl) return
  if (typeof shadowProgram !== 'undefined' && shaderProgram === shadowProgram) return

  var num = selectedi
  var idx = selectedj
  if (!flagThings[num] || !flagThings[num][idx]) return
  if (!ThingsVertexIndexBuffer[num] || !ThingsVertexIndexBuffer[num].data) return

  if (!selectionOutlineReady) initSelectionOutline()
  if (!selectionOutlineReady || !selectionEdgeProgram) return

  var width = gl.viewportWidth | 0
  var height = gl.viewportHeight | 0
  if (typeof postWidth === 'number' && postWidth > 1 && typeof postReady !== 'undefined' && postReady) {
    var curFbo = gl.getParameter(gl.FRAMEBUFFER_BINDING)
    if (curFbo) {
      width = postWidth
      height = postHeight
    }
  }
  if (width < 2 || height < 2) return
  if (!ensureSelectionMaskTargets(width, height)) return

  var prevFBO = gl.getParameter(gl.FRAMEBUFFER_BINDING)
  var prevViewport = gl.getParameter(gl.VIEWPORT)
  var prevDepthTest = gl.isEnabled(gl.DEPTH_TEST)
  var prevBlend = gl.isEnabled(gl.BLEND)
  var prevCull = gl.isEnabled(gl.CULL_FACE)
  var prevProgram = gl.getParameter(gl.CURRENT_PROGRAM)

  // 1) 离屏画选中物体遮罩（白=物体，黑=背景）
  gl.bindFramebuffer(gl.FRAMEBUFFER, selectionMaskFBO)
  gl.viewport(0, 0, width, height)
  gl.disable(gl.BLEND)
  gl.disable(gl.CULL_FACE)
  gl.enable(gl.DEPTH_TEST)
  gl.depthMask(true)
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  gl.useProgram(shaderProgram)
  gl.uniform1i(shaderProgram.useLightingUniform, 0)
  gl.uniform1i(shaderProgram.useTexturesUniform, 1)
  if (typeof bindMaterialMaps === 'function') bindMaterialMaps(null)
  if (typeof bindShadowUniforms === 'function') bindShadowUniforms(false)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, selectionOutlineTexture)
  gl.uniform1i(shaderProgram.samplerUniform, 0)
  if (shaderProgram.vertexPositionAttribute >= 0) gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute)
  if (shaderProgram.vertexNormalAttribute >= 0) gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute)
  if (shaderProgram.textureCoordAttribute >= 0) gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute)

  drawSelectedObjectMesh(num, idx)

  // 2) 回到场景缓冲，只在遮罩外缘画白色（物体内部直接 discard）
  gl.bindFramebuffer(gl.FRAMEBUFFER, prevFBO)
  gl.viewport(prevViewport[0], prevViewport[1], prevViewport[2], prevViewport[3])
  gl.disable(gl.DEPTH_TEST)
  gl.depthMask(false)
  gl.disable(gl.BLEND)

  gl.useProgram(selectionEdgeProgram)
  if (selectionEdgeProgram.vertexPositionAttribute >= 0) {
    gl.enableVertexAttribArray(selectionEdgeProgram.vertexPositionAttribute)
    gl.bindBuffer(gl.ARRAY_BUFFER, selectionQuadPos)
    gl.vertexAttribPointer(selectionEdgeProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0)
  }
  if (selectionEdgeProgram.textureCoordAttribute >= 0) {
    gl.enableVertexAttribArray(selectionEdgeProgram.textureCoordAttribute)
    gl.bindBuffer(gl.ARRAY_BUFFER, selectionQuadUV)
    gl.vertexAttribPointer(selectionEdgeProgram.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0)
  }
  if (shaderProgram && shaderProgram.vertexNormalAttribute >= 0) {
    gl.disableVertexAttribArray(shaderProgram.vertexNormalAttribute)
  }

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, selectionMaskTex)
  gl.uniform1i(selectionEdgeProgram.maskUniform, 0)
  gl.uniform2f(selectionEdgeProgram.texelUniform, 1 / width, 1 / height)
  gl.uniform1f(selectionEdgeProgram.thicknessUniform, 1.0)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

  // 恢复状态
  gl.useProgram(prevProgram || shaderProgram)
  if (typeof restoreSceneAttribs === 'function') restoreSceneAttribs()
  else if (shaderProgram) {
    enableAttrib(gl, shaderProgram.vertexPositionAttribute)
    enableAttrib(gl, shaderProgram.vertexNormalAttribute)
    enableAttrib(gl, shaderProgram.textureCoordAttribute)
  }

  if (prevDepthTest) gl.enable(gl.DEPTH_TEST)
  else gl.disable(gl.DEPTH_TEST)
  if (prevBlend) gl.enable(gl.BLEND)
  else gl.disable(gl.BLEND)
  if (prevCull) gl.enable(gl.CULL_FACE)
  else gl.disable(gl.CULL_FACE)
  gl.depthMask(true)

  gl.uniform1i(shaderProgram.useLightingUniform, lighting ? 1 : 0)
  if (typeof bindShadowUniforms === 'function') {
    bindShadowUniforms(!!(lighting && typeof sceneLights !== 'undefined' && sceneLights.length > 0))
  }
}
