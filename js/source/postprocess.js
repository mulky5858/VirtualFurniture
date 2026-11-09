// 后处理公共框架：离屏场景、MSAA、合成、FXAA、色调映射
var useFXAA = 1
var useMSAA = 1
var useToneMapping = 1
var postExposure = 1.12
var postReady = false
var postSupported = false
var postNear = 0.1
var postFar = 100.0

var postSceneFBO = null
var postSceneColor = null
var postSceneDepth = null
var postMsFBO = null
var postMsColorRB = null
var postMsDepthRB = null
var postMsSamples = 0
var postPresentFBO = null
var postPresentColor = null
var postComposeFBO = null
var postComposeColor = null
var postQuadBuffer = null
var postQuadTexBuffer = null
var postWidth = 0
var postHeight = 0
var postViewMatrix = null

var postCompositeProgram = null
var postFinalProgram = null
var postFxaaProgram = null

var POST_VS = [
  'attribute vec3 aVertexPosition;',
  'attribute vec2 aTextureCoord;',
  'varying vec2 vTextureCoord;',
  'void main(void) {',
  '  vTextureCoord = aTextureCoord;',
  '  gl_Position = vec4(aVertexPosition.xy, 0.0, 1.0);',
  '}'
].join('\n')

var POST_COMPOSITE_FS = [
  'precision mediump float;',
  'varying vec2 vTextureCoord;',
  'uniform sampler2D uScene;',
  'uniform sampler2D uAO;',
  'uniform sampler2D uContact;',
  'uniform float uStrength;',
  'uniform float uContactStrength;',
  'uniform bool uUseContact;',
  'void main(void) {',
  '  vec4 color = texture2D(uScene, vTextureCoord);',
  '  float ao = texture2D(uAO, vTextureCoord).r;',
  '  ao = mix(1.0, ao, uStrength);',
  '  ao = mix(ao, 1.0, 0.08);',
  '  float contact = 1.0;',
  '  if (uUseContact) {',
  '    contact = texture2D(uContact, vTextureCoord).r;',
  '    contact = mix(1.0, contact, uContactStrength);',
  '  }',
  '  color.rgb *= ao * contact;',
  '  gl_FragColor = color;',
  '}'
].join('\n')

var POST_FINAL_FS = [
  'precision mediump float;',
  'varying vec2 vTextureCoord;',
  'uniform sampler2D uScene;',
  'uniform sampler2D uBloom;',
  'uniform float uBloomStrength;',
  'uniform bool uUseBloom;',
  'uniform bool uUseToneMap;',
  'uniform float uExposure;',
  'vec3 acesToneMap(vec3 x) {',
  '  float a = 2.51;',
  '  float b = 0.03;',
  '  float c = 2.43;',
  '  float d = 0.59;',
  '  float e = 0.14;',
  '  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);',
  '}',
  'void main(void) {',
  '  vec3 color = texture2D(uScene, vTextureCoord).rgb;',
  '  if (uUseBloom) {',
  '    color += texture2D(uBloom, vTextureCoord).rgb * uBloomStrength;',
  '  }',
  '  if (uUseToneMap) {',
  '    color *= uExposure;',
  '    color = acesToneMap(color);',
  '  }',
  '  gl_FragColor = vec4(color, 1.0);',
  '}'
].join('\n')

var POST_FXAA_FS = [
  'precision mediump float;',
  'varying vec2 vTextureCoord;',
  'uniform sampler2D uScene;',
  'uniform vec2 uResolution;',
  'void main(void) {',
  '  vec2 inv = 1.0 / uResolution;',
  '  vec3 rgbM = texture2D(uScene, vTextureCoord).rgb;',
  '  vec3 rgbNW = texture2D(uScene, vTextureCoord + vec2(-1.0, -1.0) * inv).rgb;',
  '  vec3 rgbNE = texture2D(uScene, vTextureCoord + vec2( 1.0, -1.0) * inv).rgb;',
  '  vec3 rgbSW = texture2D(uScene, vTextureCoord + vec2(-1.0,  1.0) * inv).rgb;',
  '  vec3 rgbSE = texture2D(uScene, vTextureCoord + vec2( 1.0,  1.0) * inv).rgb;',
  '  vec3 luma = vec3(0.299, 0.587, 0.114);',
  '  float lumaM = dot(rgbM, luma);',
  '  float lumaNW = dot(rgbNW, luma);',
  '  float lumaNE = dot(rgbNE, luma);',
  '  float lumaSW = dot(rgbSW, luma);',
  '  float lumaSE = dot(rgbSE, luma);',
  '  float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));',
  '  float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));',
  '  vec2 dir;',
  '  dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));',
  '  dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));',
  '  float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * 0.03125, 0.0078125);',
  '  float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);',
  '  dir = clamp(dir * rcpDirMin, vec2(-8.0), vec2(8.0)) * inv;',
  '  vec3 rgbA = 0.5 * (',
  '    texture2D(uScene, vTextureCoord + dir * (1.0 / 3.0 - 0.5)).rgb +',
  '    texture2D(uScene, vTextureCoord + dir * (2.0 / 3.0 - 0.5)).rgb);',
  '  vec3 rgbB = rgbA * 0.5 + 0.25 * (',
  '    texture2D(uScene, vTextureCoord + dir * -0.5).rgb +',
  '    texture2D(uScene, vTextureCoord + dir * 0.5).rgb);',
  '  float lumaB = dot(rgbB, luma);',
  '  if (lumaB < lumaMin || lumaB > lumaMax) gl_FragColor = vec4(rgbA, 1.0);',
  '  else gl_FragColor = vec4(rgbB, 1.0);',
  '}'
].join('\n')

function compilePostShader (type, source) {
  var shader = gl.createShader(type)
  var isFragment = type === gl.FRAGMENT_SHADER
  gl.shaderSource(shader, adaptShaderSource(gl, source, isFragment))
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('Post shader compile failed:', gl.getShaderInfoLog(shader))
    }
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createPostProgram (vsSource, fsSource) {
  var vs = compilePostShader(gl.VERTEX_SHADER, vsSource)
  var fs = compilePostShader(gl.FRAGMENT_SHADER, fsSource)
  if (!vs || !fs) return null

  var program = gl.createProgram()
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.bindAttribLocation(program, 0, 'aVertexPosition')
  gl.bindAttribLocation(program, 2, 'aTextureCoord')
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('Post program link failed')
    }
    return null
  }

  program.vertexPositionAttribute = gl.getAttribLocation(program, 'aVertexPosition')
  program.textureCoordAttribute = gl.getAttribLocation(program, 'aTextureCoord')
  return program
}

function createPostColorTarget (width, height, nearest) {
  var tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  var filter = nearest ? gl.NEAREST : gl.LINEAR
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.bindTexture(gl.TEXTURE_2D, null)
  return tex
}

function createPostDepthTexture (width, height) {
  var tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  // WebGL2：深度+模板，供选中描边；采样时仍可读深度
  if (isWebGL2Context(gl)) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH24_STENCIL8, width, height, 0, gl.DEPTH_STENCIL, gl.UNSIGNED_INT_24_8, null)
  } else {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null)
  }
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  if (isWebGL2Context(gl)) {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.NONE)
  }
  gl.bindTexture(gl.TEXTURE_2D, null)
  return tex
}

function destroyPostTexture (tex) {
  if (tex) gl.deleteTexture(tex)
}

function destroyPostFBO (fbo) {
  if (fbo) gl.deleteFramebuffer(fbo)
}

function destroyPostRB (rb) {
  if (rb) gl.deleteRenderbuffer(rb)
}

function destroyPostMultisampleTargets () {
  destroyPostRB(postMsColorRB)
  destroyPostRB(postMsDepthRB)
  destroyPostFBO(postMsFBO)
  postMsColorRB = null
  postMsDepthRB = null
  postMsFBO = null
  postMsSamples = 0
}

function createPostMultisampleTargets (width, height) {
  destroyPostMultisampleTargets()
  if (!useMSAA || !isWebGL2Context(gl)) return false

  var maxSamples = gl.getParameter(gl.MAX_SAMPLES) || 0
  var samples = Math.min(4, maxSamples)
  if (samples < 2) return false

  postMsColorRB = gl.createRenderbuffer()
  gl.bindRenderbuffer(gl.RENDERBUFFER, postMsColorRB)
  gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, gl.RGBA8, width, height)

  postMsDepthRB = gl.createRenderbuffer()
  gl.bindRenderbuffer(gl.RENDERBUFFER, postMsDepthRB)
  gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, gl.DEPTH24_STENCIL8, width, height)

  postMsFBO = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, postMsFBO)
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, postMsColorRB)
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, postMsDepthRB)

  var ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.bindRenderbuffer(gl.RENDERBUFFER, null)
  if (!ok) {
    destroyPostMultisampleTargets()
    return false
  }
  postMsSamples = samples
  return true
}

function resolvePostMultisample () {
  if (!postMsFBO || !postSceneFBO) return
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, postMsFBO)
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, postSceneFBO)
  gl.blitFramebuffer(
    0, 0, postWidth, postHeight,
    0, 0, postWidth, postHeight,
    gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
    gl.NEAREST
  )
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
}

function initPostQuad () {
  postQuadBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, postQuadBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 0,
    1, -1, 0,
    -1, 1, 0,
    1, 1, 0
  ]), gl.STATIC_DRAW)
  postQuadBuffer.itemSize = 3
  postQuadBuffer.numItems = 4

  postQuadTexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, postQuadTexBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 0,
    1, 0,
    0, 1,
    1, 1
  ]), gl.STATIC_DRAW)
  postQuadTexBuffer.itemSize = 2
  postQuadTexBuffer.numItems = 4
}

function bindPostQuad (program) {
  if (program.vertexPositionAttribute >= 0) {
    gl.enableVertexAttribArray(program.vertexPositionAttribute)
    gl.bindBuffer(gl.ARRAY_BUFFER, postQuadBuffer)
    gl.vertexAttribPointer(program.vertexPositionAttribute, postQuadBuffer.itemSize, gl.FLOAT, false, 0, 0)
  }
  if (program.textureCoordAttribute >= 0) {
    gl.enableVertexAttribArray(program.textureCoordAttribute)
    gl.bindBuffer(gl.ARRAY_BUFFER, postQuadTexBuffer)
    gl.vertexAttribPointer(program.textureCoordAttribute, postQuadTexBuffer.itemSize, gl.FLOAT, false, 0, 0)
  }
  if (shaderProgram && shaderProgram.vertexNormalAttribute >= 0) {
    gl.disableVertexAttribArray(shaderProgram.vertexNormalAttribute)
  }
}

function restoreSceneAttribs () {
  if (!shaderProgram) return
  enableAttrib(gl, shaderProgram.vertexPositionAttribute)
  enableAttrib(gl, shaderProgram.vertexNormalAttribute)
  enableAttrib(gl, shaderProgram.textureCoordAttribute)
}

function resizePostBuffers () {
  if (!postSupported || !gl) return
  var w = gl.viewportWidth | 0
  var h = gl.viewportHeight | 0
  if (w < 2 || h < 2) return
  if (w === postWidth && h === postHeight && postReady) {
    if (typeof resizeAOTargets === 'function') resizeAOTargets()
    if (typeof resizeContactShadowTargets === 'function') resizeContactShadowTargets()
    if (typeof resizeBloomTargets === 'function') resizeBloomTargets()
    return
  }

  postWidth = w
  postHeight = h

  destroyPostTexture(postSceneColor)
  destroyPostTexture(postSceneDepth)
  destroyPostTexture(postPresentColor)
  destroyPostTexture(postComposeColor)
  destroyPostFBO(postSceneFBO)
  destroyPostFBO(postPresentFBO)
  destroyPostFBO(postComposeFBO)
  destroyPostMultisampleTargets()

  postSceneColor = createPostColorTarget(postWidth, postHeight, false)
  postSceneDepth = createPostDepthTexture(postWidth, postHeight)
  postSceneFBO = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, postSceneFBO)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, postSceneColor, 0)
  if (isWebGL2Context(gl)) {
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.TEXTURE_2D, postSceneDepth, 0)
  } else {
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, postSceneDepth, 0)
  }
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    postReady = false
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    return
  }

  createPostMultisampleTargets(postWidth, postHeight)

  postComposeColor = createPostColorTarget(postWidth, postHeight, false)
  postComposeFBO = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, postComposeFBO)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, postComposeColor, 0)

  postPresentColor = createPostColorTarget(postWidth, postHeight, false)
  postPresentFBO = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, postPresentFBO)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, postPresentColor, 0)

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  postReady = true

  if (typeof resizeAOTargets === 'function') resizeAOTargets()
  if (typeof resizeContactShadowTargets === 'function') resizeContactShadowTargets()
  if (typeof resizeBloomTargets === 'function') resizeBloomTargets()
}

function initPostProcess () {
  postReady = false
  postSupported = false
  if (!gl) return

  if (!isWebGL2Context(gl)) {
    var depthExt = gl.getExtension('WEBGL_depth_texture') ||
      gl.getExtension('WEBKIT_WEBGL_depth_texture') ||
      gl.getExtension('MOZ_WEBGL_depth_texture')
    if (!depthExt) return
  }

  postCompositeProgram = createPostProgram(POST_VS, POST_COMPOSITE_FS)
  postFinalProgram = createPostProgram(POST_VS, POST_FINAL_FS)
  postFxaaProgram = createPostProgram(POST_VS, POST_FXAA_FS)
  if (!postCompositeProgram || !postFinalProgram) return

  postCompositeProgram.sceneUniform = gl.getUniformLocation(postCompositeProgram, 'uScene')
  postCompositeProgram.aoUniform = gl.getUniformLocation(postCompositeProgram, 'uAO')
  postCompositeProgram.contactUniform = gl.getUniformLocation(postCompositeProgram, 'uContact')
  postCompositeProgram.strengthUniform = gl.getUniformLocation(postCompositeProgram, 'uStrength')
  postCompositeProgram.contactStrengthUniform = gl.getUniformLocation(postCompositeProgram, 'uContactStrength')
  postCompositeProgram.useContactUniform = gl.getUniformLocation(postCompositeProgram, 'uUseContact')

  postFinalProgram.sceneUniform = gl.getUniformLocation(postFinalProgram, 'uScene')
  postFinalProgram.bloomUniform = gl.getUniformLocation(postFinalProgram, 'uBloom')
  postFinalProgram.bloomStrengthUniform = gl.getUniformLocation(postFinalProgram, 'uBloomStrength')
  postFinalProgram.useBloomUniform = gl.getUniformLocation(postFinalProgram, 'uUseBloom')
  postFinalProgram.useToneMapUniform = gl.getUniformLocation(postFinalProgram, 'uUseToneMap')
  postFinalProgram.exposureUniform = gl.getUniformLocation(postFinalProgram, 'uExposure')

  if (postFxaaProgram) {
    postFxaaProgram.sceneUniform = gl.getUniformLocation(postFxaaProgram, 'uScene')
    postFxaaProgram.resolutionUniform = gl.getUniformLocation(postFxaaProgram, 'uResolution')
  }

  initPostQuad()
  postSupported = true
  resizePostBuffers()

  if (typeof initAO === 'function') initAO()
  if (typeof initContactShadow === 'function') initContactShadow()
  if (typeof initBloom === 'function') initBloom()
}

function postEffectsEnabled () {
  var aoOn = typeof useAO !== 'undefined' && useAO
  var contactOn = typeof useContactShadow !== 'undefined' && useContactShadow
  var aaOn = (typeof useFXAA !== 'undefined' && useFXAA) ||
    (typeof useMSAA !== 'undefined' && useMSAA)
  var toneOn = typeof useToneMapping !== 'undefined' && useToneMapping
  var bloomOn = typeof useBloom !== 'undefined' && useBloom
  return !!(aoOn || contactOn || aaOn || toneOn || bloomOn)
}

function rebuildPostBuffers () {
  if (!postSupported || !gl) return
  postWidth = 0
  postHeight = 0
  postReady = false
  resizePostBuffers()
}

function beginPostScenePass (viewMatrix) {
  if (!postEffectsEnabled() || !postSupported) return false
  if (!postReady || postWidth !== (gl.viewportWidth | 0) || postHeight !== (gl.viewportHeight | 0)) {
    resizePostBuffers()
  }
  if (!postReady) return false

  if (viewMatrix) {
    if (!postViewMatrix) postViewMatrix = mat4.create()
    mat4.set(viewMatrix, postViewMatrix)
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, postMsFBO || postSceneFBO)
  gl.viewport(0, 0, postWidth, postHeight)
  return true
}

function applyPostAndPresent () {
  if (!postReady) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    return
  }

  resolvePostMultisample()
  gl.disable(gl.DEPTH_TEST)

  var aoMask = null
  if (typeof drawAOPass === 'function') {
    aoMask = drawAOPass()
  }
  if (!aoMask && typeof getWhiteAOMask === 'function') {
    aoMask = getWhiteAOMask()
  }

  var hasContact = false
  var contactTex = null
  if (typeof drawContactShadowPass === 'function') {
    hasContact = drawContactShadowPass()
    if (hasContact && typeof getContactShadowTexture === 'function') {
      contactTex = getContactShadowTexture()
    }
  }

  var aoStrengthValue = (typeof useAO !== 'undefined' && useAO && typeof aoStrength === 'number') ? aoStrength : 0.0
  var contactStrengthValue = (typeof contactStrength === 'number') ? contactStrength : 0.0

  // 1) AO / 接触阴影合成到中间缓冲
  gl.bindFramebuffer(gl.FRAMEBUFFER, postComposeFBO)
  gl.viewport(0, 0, postWidth, postHeight)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.useProgram(postCompositeProgram)
  bindPostQuad(postCompositeProgram)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, postSceneColor)
  gl.uniform1i(postCompositeProgram.sceneUniform, 0)
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, aoMask)
  gl.uniform1i(postCompositeProgram.aoUniform, 1)
  gl.uniform1f(postCompositeProgram.strengthUniform, aoStrengthValue)
  gl.activeTexture(gl.TEXTURE2)
  gl.bindTexture(gl.TEXTURE_2D, hasContact && contactTex ? contactTex : aoMask)
  gl.uniform1i(postCompositeProgram.contactUniform, 2)
  gl.uniform1i(postCompositeProgram.useContactUniform, hasContact ? 1 : 0)
  gl.uniform1f(postCompositeProgram.contactStrengthUniform, contactStrengthValue)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, postQuadBuffer.numItems)

  // 2) Bloom
  var bloomTex = null
  var bloomOn = !!(typeof useBloom !== 'undefined' && useBloom)
  if (bloomOn && typeof drawBloomPass === 'function') {
    bloomTex = drawBloomPass(postComposeColor)
  }
  if (!bloomTex) bloomOn = false

  // 3) Bloom 叠加 + 色调映射
  var doFxaa = !!(useFXAA && postFxaaProgram && postPresentFBO && postPresentColor)
  gl.bindFramebuffer(gl.FRAMEBUFFER, doFxaa ? postPresentFBO : null)
  gl.viewport(0, 0, postWidth, postHeight)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.useProgram(postFinalProgram)
  bindPostQuad(postFinalProgram)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, postComposeColor)
  gl.uniform1i(postFinalProgram.sceneUniform, 0)
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, bloomOn && bloomTex ? bloomTex : postComposeColor)
  gl.uniform1i(postFinalProgram.bloomUniform, 1)
  gl.uniform1i(postFinalProgram.useBloomUniform, bloomOn ? 1 : 0)
  gl.uniform1f(postFinalProgram.bloomStrengthUniform, typeof bloomStrength === 'number' ? bloomStrength : 0.0)
  gl.uniform1i(postFinalProgram.useToneMapUniform, useToneMapping ? 1 : 0)
  gl.uniform1f(postFinalProgram.exposureUniform, postExposure)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, postQuadBuffer.numItems)

  // 4) FXAA
  if (doFxaa) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, postWidth, postHeight)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.useProgram(postFxaaProgram)
    bindPostQuad(postFxaaProgram)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, postPresentColor)
    gl.uniform1i(postFxaaProgram.sceneUniform, 0)
    gl.uniform2f(postFxaaProgram.resolutionUniform, postWidth, postHeight)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, postQuadBuffer.numItems)
  }

  gl.enable(gl.DEPTH_TEST)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, null)
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, null)
  gl.activeTexture(gl.TEXTURE2)
  gl.bindTexture(gl.TEXTURE_2D, null)
  gl.useProgram(shaderProgram)
  restoreSceneAttribs()
}

// 兼容旧调用名
function beginAOScenePass (viewMatrix) {
  return beginPostScenePass(viewMatrix)
}

function applyAOAndPresent () {
  applyPostAndPresent()
}

function resizeAOBuffers () {
  resizePostBuffers()
}
