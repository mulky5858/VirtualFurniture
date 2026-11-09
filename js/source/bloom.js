// Bloom：提亮提取 + 降采样模糊
var useBloom = 1
var bloomStrength = 0.45
var bloomThreshold = 0.72
var bloomSoftKnee = 0.35
var bloomIterations = 2

var bloomW = 0
var bloomH = 0
var bloomBrightFBO = null
var bloomBrightTex = null
var bloomFBOA = null
var bloomTexA = null
var bloomFBOB = null
var bloomTexB = null
var bloomExtractProgram = null
var bloomBlurProgram = null
var bloomResultTex = null

var BLOOM_EXTRACT_FS = [
  'precision mediump float;',
  'varying vec2 vTextureCoord;',
  'uniform sampler2D uScene;',
  'uniform float uThreshold;',
  'uniform float uKnee;',
  'void main(void) {',
  '  vec3 c = texture2D(uScene, vTextureCoord).rgb;',
  '  float bri = max(c.r, max(c.g, c.b));',
  '  float soft = clamp(bri - uThreshold + uKnee, 0.0, 2.0 * uKnee);',
  '  soft = (soft * soft) / (4.0 * max(uKnee, 0.0001));',
  '  float contrib = max(bri - uThreshold, soft);',
  '  contrib /= max(bri, 0.0001);',
  '  gl_FragColor = vec4(c * contrib, 1.0);',
  '}'
].join('\n')

var BLOOM_BLUR_FS = [
  'precision mediump float;',
  'varying vec2 vTextureCoord;',
  'uniform sampler2D uScene;',
  'uniform vec2 uDirection;',
  'uniform vec2 uTexel;',
  'void main(void) {',
  '  vec2 off = uDirection * uTexel;',
  '  vec3 c = texture2D(uScene, vTextureCoord).rgb * 0.227027;',
  '  c += texture2D(uScene, vTextureCoord + off * 1.384615).rgb * 0.316216;',
  '  c += texture2D(uScene, vTextureCoord - off * 1.384615).rgb * 0.316216;',
  '  c += texture2D(uScene, vTextureCoord + off * 3.230769).rgb * 0.070270;',
  '  c += texture2D(uScene, vTextureCoord - off * 3.230769).rgb * 0.070270;',
  '  gl_FragColor = vec4(c, 1.0);',
  '}'
].join('\n')

function resizeBloomTargets () {
  if (!postSupported || !gl || !postWidth) return

  bloomW = Math.max(1, postWidth >> 1)
  bloomH = Math.max(1, postHeight >> 1)

  destroyPostTexture(bloomBrightTex)
  destroyPostTexture(bloomTexA)
  destroyPostTexture(bloomTexB)
  destroyPostFBO(bloomBrightFBO)
  destroyPostFBO(bloomFBOA)
  destroyPostFBO(bloomFBOB)

  bloomBrightTex = createPostColorTarget(bloomW, bloomH, false)
  bloomBrightFBO = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, bloomBrightFBO)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, bloomBrightTex, 0)

  bloomTexA = createPostColorTarget(bloomW, bloomH, false)
  bloomFBOA = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, bloomFBOA)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, bloomTexA, 0)

  bloomTexB = createPostColorTarget(bloomW, bloomH, false)
  bloomFBOB = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, bloomFBOB)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, bloomTexB, 0)

  bloomResultTex = null
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
}

function initBloom () {
  if (!gl || !postSupported) return

  bloomExtractProgram = createPostProgram(POST_VS, BLOOM_EXTRACT_FS)
  bloomBlurProgram = createPostProgram(POST_VS, BLOOM_BLUR_FS)
  if (!bloomExtractProgram || !bloomBlurProgram) return

  bloomExtractProgram.sceneUniform = gl.getUniformLocation(bloomExtractProgram, 'uScene')
  bloomExtractProgram.thresholdUniform = gl.getUniformLocation(bloomExtractProgram, 'uThreshold')
  bloomExtractProgram.kneeUniform = gl.getUniformLocation(bloomExtractProgram, 'uKnee')

  bloomBlurProgram.sceneUniform = gl.getUniformLocation(bloomBlurProgram, 'uScene')
  bloomBlurProgram.directionUniform = gl.getUniformLocation(bloomBlurProgram, 'uDirection')
  bloomBlurProgram.texelUniform = gl.getUniformLocation(bloomBlurProgram, 'uTexel')

  resizeBloomTargets()
}

function getBloomTexture () {
  return bloomResultTex
}

function bloomBlurDirection (srcTex, dstFbo, dirX, dirY) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, dstFbo)
  gl.viewport(0, 0, bloomW, bloomH)
  gl.useProgram(bloomBlurProgram)
  bindPostQuad(bloomBlurProgram)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, srcTex)
  gl.uniform1i(bloomBlurProgram.sceneUniform, 0)
  gl.uniform2f(bloomBlurProgram.directionUniform, dirX, dirY)
  gl.uniform2f(bloomBlurProgram.texelUniform, 1 / bloomW, 1 / bloomH)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, postQuadBuffer.numItems)
}

function drawBloomPass (sourceTexture) {
  if (!useBloom || !bloomExtractProgram || !bloomBlurProgram || !sourceTexture) return null
  if (!bloomBrightFBO || !bloomFBOA || !bloomFBOB) return null

  gl.bindFramebuffer(gl.FRAMEBUFFER, bloomBrightFBO)
  gl.viewport(0, 0, bloomW, bloomH)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.useProgram(bloomExtractProgram)
  bindPostQuad(bloomExtractProgram)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, sourceTexture)
  gl.uniform1i(bloomExtractProgram.sceneUniform, 0)
  gl.uniform1f(bloomExtractProgram.thresholdUniform, bloomThreshold)
  gl.uniform1f(bloomExtractProgram.kneeUniform, bloomSoftKnee)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, postQuadBuffer.numItems)

  var src = bloomBrightTex
  for (var i = 0; i < bloomIterations; i++) {
    bloomBlurDirection(src, bloomFBOA, 1.0, 0.0)
    bloomBlurDirection(bloomTexA, bloomFBOB, 0.0, 1.0)
    src = bloomTexB
  }

  bloomResultTex = bloomTexB
  return bloomResultTex
}
