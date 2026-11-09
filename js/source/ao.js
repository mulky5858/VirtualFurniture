var useAO = 1
var aoReady = false
var aoSupported = false
var aoStrength = 0.72
var aoRadius = 0.55
var aoBias = 0.035
var aoNear = 0.1
var aoFar = 100.0
var aoKernelSize = 16

var aoSceneFBO = null
var aoSceneColor = null
var aoSceneDepth = null
var aoFBO = null
var aoTexture = null
var aoBlurFBO = null
var aoBlurTexture = null
var aoNoiseTexture = null
var aoQuadBuffer = null
var aoQuadTexBuffer = null
var aoKernel = []
var aoWidth = 0
var aoHeight = 0
var aoHalfW = 0
var aoHalfH = 0

var aoProgram = null
var aoBlurProgram = null
var aoCompositeProgram = null

var AO_VS = [
  'attribute vec3 aVertexPosition;',
  'attribute vec2 aTextureCoord;',
  'varying vec2 vTextureCoord;',
  'void main(void) {',
  '  vTextureCoord = aTextureCoord;',
  '  gl_Position = vec4(aVertexPosition.xy, 0.0, 1.0);',
  '}'
].join('\n')

var AO_FS = [
  'precision mediump float;',
  'varying vec2 vTextureCoord;',
  'uniform sampler2D uDepth;',
  'uniform sampler2D uNoise;',
  'uniform mat4 uProj;',
  'uniform vec2 uNoiseScale;',
  'uniform vec2 uTexel;',
  'uniform float uRadius;',
  'uniform float uBias;',
  'uniform float uNear;',
  'uniform float uFar;',
  'uniform vec3 uKernel[16];',
  'float linearizeDepth(float d) {',
  '  float z = d * 2.0 - 1.0;',
  '  return (2.0 * uNear * uFar) / (uFar + uNear - z * (uFar - uNear));',
  '}',
  'vec3 getViewPos(vec2 uv) {',
  '  float depth = texture2D(uDepth, uv).r;',
  '  float z = linearizeDepth(depth);',
  '  vec2 ndc = uv * 2.0 - 1.0;',
  '  return vec3(ndc.x * z / uProj[0][0], ndc.y * z / uProj[1][1], -z);',
  '}',
  'void main(void) {',
  '  float depth = texture2D(uDepth, vTextureCoord).r;',
  '  if (depth > 0.999) {',
  '    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);',
  '    return;',
  '  }',
  '  vec3 fragPos = getViewPos(vTextureCoord);',
  '  vec3 dx = getViewPos(vTextureCoord + vec2(uTexel.x, 0.0)) - fragPos;',
  '  vec3 dy = getViewPos(vTextureCoord + vec2(0.0, uTexel.y)) - fragPos;',
  '  vec3 normal = normalize(cross(dx, dy));',
  '  vec3 randomVec = texture2D(uNoise, vTextureCoord * uNoiseScale).xyz * 2.0 - 1.0;',
  '  randomVec.z = 0.0;',
  '  randomVec = normalize(randomVec + vec3(0.0001, 0.0, 0.0));',
  '  vec3 tangent = normalize(randomVec - normal * dot(randomVec, normal));',
  '  vec3 bitangent = cross(normal, tangent);',
  '  mat3 TBN = mat3(tangent, bitangent, normal);',
  '  float occlusion = 0.0;',
  '  for (int i = 0; i < 16; i++) {',
  '    vec3 samplePos = fragPos + TBN * uKernel[i] * uRadius;',
  '    vec4 offset = uProj * vec4(samplePos, 1.0);',
  '    offset.xyz /= offset.w;',
  '    offset.xy = offset.xy * 0.5 + 0.5;',
  '    float sampleDepth = -linearizeDepth(texture2D(uDepth, clamp(offset.xy, 0.0, 1.0)).r);',
  '    float rangeCheck = smoothstep(0.0, 1.0, uRadius / abs(fragPos.z - sampleDepth));',
  '    occlusion += (sampleDepth >= samplePos.z + uBias ? 1.0 : 0.0) * rangeCheck;',
  '  }',
  '  occlusion = 1.0 - (occlusion / 16.0);',
  '  occlusion = pow(clamp(occlusion, 0.0, 1.0), 1.35);',
  '  gl_FragColor = vec4(occlusion, occlusion, occlusion, 1.0);',
  '}'
].join('\n')

var AO_BLUR_FS = [
  'precision mediump float;',
  'varying vec2 vTextureCoord;',
  'uniform sampler2D uAO;',
  'uniform vec2 uTexel;',
  'void main(void) {',
  '  float result = 0.0;',
  '  for (int x = -1; x <= 1; x++) {',
  '    for (int y = -1; y <= 1; y++) {',
  '      result += texture2D(uAO, vTextureCoord + vec2(float(x), float(y)) * uTexel).r;',
  '    }',
  '  }',
  '  result /= 9.0;',
  '  gl_FragColor = vec4(result, result, result, 1.0);',
  '}'
].join('\n')

var AO_COMPOSITE_FS = [
  'precision mediump float;',
  'varying vec2 vTextureCoord;',
  'uniform sampler2D uScene;',
  'uniform sampler2D uAO;',
  'uniform float uStrength;',
  'void main(void) {',
  '  vec4 color = texture2D(uScene, vTextureCoord);',
  '  float ao = texture2D(uAO, vTextureCoord).r;',
  '  float shade = mix(1.0, ao, uStrength);',
  '  color.rgb *= mix(shade, 1.0, 0.12);',
  '  gl_FragColor = color;',
  '}'
].join('\n')

function compileAOShader (type, source) {
  var shader = gl.createShader(type)
  var isFragment = type === gl.FRAGMENT_SHADER
  gl.shaderSource(shader, adaptShaderSource(gl, source, isFragment))
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('AO shader compile failed:', gl.getShaderInfoLog(shader))
    }
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createAOProgramFromSource (vsSource, fsSource) {
  var vs = compileAOShader(gl.VERTEX_SHADER, vsSource)
  var fs = compileAOShader(gl.FRAGMENT_SHADER, fsSource)
  if (!vs || !fs) return null

  var program = gl.createProgram()
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.bindAttribLocation(program, 0, 'aVertexPosition')
  gl.bindAttribLocation(program, 2, 'aTextureCoord')
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('AO program link failed')
    }
    return null
  }

  program.vertexPositionAttribute = gl.getAttribLocation(program, 'aVertexPosition')
  program.textureCoordAttribute = gl.getAttribLocation(program, 'aTextureCoord')
  return program
}

function createAOColorTarget (width, height) {
  var tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.bindTexture(gl.TEXTURE_2D, null)
  return tex
}

function createAODepthTexture (width, height) {
  var tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  if (isWebGL2Context(gl)) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null)
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

function destroyAOTexture (tex) {
  if (tex) gl.deleteTexture(tex)
}

function destroyAOFBO (fbo) {
  if (fbo) gl.deleteFramebuffer(fbo)
}

function initAOKernelAndNoise () {
  aoKernel = []
  for (var i = 0; i < aoKernelSize; i++) {
    var sample = [
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random()
    ]
    var len = Math.sqrt(sample[0] * sample[0] + sample[1] * sample[1] + sample[2] * sample[2]) || 1
    sample[0] /= len
    sample[1] /= len
    sample[2] /= len
    var scale = i / aoKernelSize
    scale = 0.1 + scale * scale * 0.9
    aoKernel.push([sample[0] * scale, sample[1] * scale, sample[2] * scale])
  }

  var noiseData = new Uint8Array(16 * 4)
  for (var n = 0; n < 16; n++) {
    noiseData[n * 4] = Math.floor(Math.random() * 255)
    noiseData[n * 4 + 1] = Math.floor(Math.random() * 255)
    noiseData[n * 4 + 2] = 128
    noiseData[n * 4 + 3] = 255
  }
  aoNoiseTexture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, aoNoiseTexture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 4, 4, 0, gl.RGBA, gl.UNSIGNED_BYTE, noiseData)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
  gl.bindTexture(gl.TEXTURE_2D, null)
}

function initAOQuad () {
  aoQuadBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, aoQuadBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 0,
    1, -1, 0,
    -1, 1, 0,
    1, 1, 0
  ]), gl.STATIC_DRAW)
  aoQuadBuffer.itemSize = 3
  aoQuadBuffer.numItems = 4

  aoQuadTexBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, aoQuadTexBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 0,
    1, 0,
    0, 1,
    1, 1
  ]), gl.STATIC_DRAW)
  aoQuadTexBuffer.itemSize = 2
  aoQuadTexBuffer.numItems = 4
}

function resizeAOBuffers () {
  if (!aoSupported || !gl) return
  var w = gl.viewportWidth | 0
  var h = gl.viewportHeight | 0
  if (w < 2 || h < 2) return
  if (w === aoWidth && h === aoHeight && aoReady) return

  aoWidth = w
  aoHeight = h
  aoHalfW = Math.max(1, w >> 1)
  aoHalfH = Math.max(1, h >> 1)

  destroyAOTexture(aoSceneColor)
  destroyAOTexture(aoSceneDepth)
  destroyAOTexture(aoTexture)
  destroyAOTexture(aoBlurTexture)
  destroyAOFBO(aoSceneFBO)
  destroyAOFBO(aoFBO)
  destroyAOFBO(aoBlurFBO)

  aoSceneColor = createAOColorTarget(aoWidth, aoHeight)
  aoSceneDepth = createAODepthTexture(aoWidth, aoHeight)
  aoSceneFBO = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, aoSceneFBO)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, aoSceneColor, 0)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, aoSceneDepth, 0)
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    aoReady = false
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    return
  }

  aoTexture = createAOColorTarget(aoHalfW, aoHalfH)
  aoFBO = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, aoFBO)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, aoTexture, 0)

  aoBlurTexture = createAOColorTarget(aoHalfW, aoHalfH)
  aoBlurFBO = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, aoBlurFBO)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, aoBlurTexture, 0)

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  aoReady = true
}

function initAO () {
  aoReady = false
  aoSupported = false
  if (!gl) return

  if (!isWebGL2Context(gl)) {
    var depthExt = gl.getExtension('WEBGL_depth_texture') ||
      gl.getExtension('WEBKIT_WEBGL_depth_texture') ||
      gl.getExtension('MOZ_WEBGL_depth_texture')
    if (!depthExt) return
  }

  aoProgram = createAOProgramFromSource(AO_VS, AO_FS)
  aoBlurProgram = createAOProgramFromSource(AO_VS, AO_BLUR_FS)
  aoCompositeProgram = createAOProgramFromSource(AO_VS, AO_COMPOSITE_FS)
  if (!aoProgram || !aoBlurProgram || !aoCompositeProgram) return

  aoProgram.depthUniform = gl.getUniformLocation(aoProgram, 'uDepth')
  aoProgram.noiseUniform = gl.getUniformLocation(aoProgram, 'uNoise')
  aoProgram.projUniform = gl.getUniformLocation(aoProgram, 'uProj')
  aoProgram.noiseScaleUniform = gl.getUniformLocation(aoProgram, 'uNoiseScale')
  aoProgram.texelUniform = gl.getUniformLocation(aoProgram, 'uTexel')
  aoProgram.radiusUniform = gl.getUniformLocation(aoProgram, 'uRadius')
  aoProgram.biasUniform = gl.getUniformLocation(aoProgram, 'uBias')
  aoProgram.nearUniform = gl.getUniformLocation(aoProgram, 'uNear')
  aoProgram.farUniform = gl.getUniformLocation(aoProgram, 'uFar')
  aoProgram.kernelUniforms = []
  for (var i = 0; i < aoKernelSize; i++) {
    aoProgram.kernelUniforms[i] = gl.getUniformLocation(aoProgram, 'uKernel[' + i + ']')
  }

  aoBlurProgram.aoUniform = gl.getUniformLocation(aoBlurProgram, 'uAO')
  aoBlurProgram.texelUniform = gl.getUniformLocation(aoBlurProgram, 'uTexel')

  aoCompositeProgram.sceneUniform = gl.getUniformLocation(aoCompositeProgram, 'uScene')
  aoCompositeProgram.aoUniform = gl.getUniformLocation(aoCompositeProgram, 'uAO')
  aoCompositeProgram.strengthUniform = gl.getUniformLocation(aoCompositeProgram, 'uStrength')

  initAOKernelAndNoise()
  initAOQuad()
  aoSupported = true
  resizeAOBuffers()
}

function bindAOQuad (program) {
  if (program.vertexPositionAttribute >= 0) {
    gl.enableVertexAttribArray(program.vertexPositionAttribute)
    gl.bindBuffer(gl.ARRAY_BUFFER, aoQuadBuffer)
    gl.vertexAttribPointer(program.vertexPositionAttribute, aoQuadBuffer.itemSize, gl.FLOAT, false, 0, 0)
  }
  if (program.textureCoordAttribute >= 0) {
    gl.enableVertexAttribArray(program.textureCoordAttribute)
    gl.bindBuffer(gl.ARRAY_BUFFER, aoQuadTexBuffer)
    gl.vertexAttribPointer(program.textureCoordAttribute, aoQuadTexBuffer.itemSize, gl.FLOAT, false, 0, 0)
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

function beginAOScenePass () {
  if (!useAO || !aoSupported) return false
  if (!aoReady || aoWidth !== (gl.viewportWidth | 0) || aoHeight !== (gl.viewportHeight | 0)) {
    resizeAOBuffers()
  }
  if (!aoReady) return false

  gl.bindFramebuffer(gl.FRAMEBUFFER, aoSceneFBO)
  gl.viewport(0, 0, aoWidth, aoHeight)
  return true
}

function applyAOAndPresent () {
  if (!aoReady) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    return
  }

  gl.disable(gl.DEPTH_TEST)
  gl.bindFramebuffer(gl.FRAMEBUFFER, aoFBO)
  gl.viewport(0, 0, aoHalfW, aoHalfH)
  gl.clearColor(1, 1, 1, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.useProgram(aoProgram)
  bindAOQuad(aoProgram)

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, aoSceneDepth)
  gl.uniform1i(aoProgram.depthUniform, 0)
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, aoNoiseTexture)
  gl.uniform1i(aoProgram.noiseUniform, 1)
  gl.uniformMatrix4fv(aoProgram.projUniform, false, pMatrix)
  gl.uniform2f(aoProgram.noiseScaleUniform, aoHalfW / 4, aoHalfH / 4)
  gl.uniform2f(aoProgram.texelUniform, 1 / aoWidth, 1 / aoHeight)
  gl.uniform1f(aoProgram.radiusUniform, aoRadius)
  gl.uniform1f(aoProgram.biasUniform, aoBias)
  gl.uniform1f(aoProgram.nearUniform, aoNear)
  gl.uniform1f(aoProgram.farUniform, aoFar)
  for (var i = 0; i < aoKernelSize; i++) {
    gl.uniform3f(aoProgram.kernelUniforms[i], aoKernel[i][0], aoKernel[i][1], aoKernel[i][2])
  }
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, aoQuadBuffer.numItems)

  gl.bindFramebuffer(gl.FRAMEBUFFER, aoBlurFBO)
  gl.viewport(0, 0, aoHalfW, aoHalfH)
  gl.useProgram(aoBlurProgram)
  bindAOQuad(aoBlurProgram)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, aoTexture)
  gl.uniform1i(aoBlurProgram.aoUniform, 0)
  gl.uniform2f(aoBlurProgram.texelUniform, 1 / aoHalfW, 1 / aoHalfH)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, aoQuadBuffer.numItems)

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.viewport(0, 0, aoWidth, aoHeight)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.useProgram(aoCompositeProgram)
  bindAOQuad(aoCompositeProgram)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, aoSceneColor)
  gl.uniform1i(aoCompositeProgram.sceneUniform, 0)
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, aoBlurTexture)
  gl.uniform1i(aoCompositeProgram.aoUniform, 1)
  gl.uniform1f(aoCompositeProgram.strengthUniform, aoStrength)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, aoQuadBuffer.numItems)

  gl.enable(gl.DEPTH_TEST)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, null)
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, null)
  gl.useProgram(shaderProgram)
  restoreSceneAttribs()
}
