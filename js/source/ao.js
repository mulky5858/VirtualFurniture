// SSAO：屏幕空间环境光遮蔽
var useAO = 1
var aoStrength = 0.48
var aoRadius = 0.28
var aoBias = 0.03
var aoKernelSize = 16
var aoFullRes = 1

var aoFBO = null
var aoTexture = null
var aoBlurFBO = null
var aoBlurTexture = null
var aoNoiseTexture = null
var aoKernel = []
var aoPassW = 0
var aoPassH = 0

var aoProgram = null
var aoBlurProgram = null

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
  '  occlusion = pow(clamp(occlusion, 0.0, 1.0), 1.15);',
  '  gl_FragColor = vec4(occlusion, occlusion, occlusion, 1.0);',
  '}'
].join('\n')

var AO_BLUR_FS = [
  'precision mediump float;',
  'varying vec2 vTextureCoord;',
  'uniform sampler2D uAO;',
  'uniform sampler2D uDepth;',
  'uniform vec2 uTexel;',
  'void main(void) {',
  '  float centerAO = texture2D(uAO, vTextureCoord).r;',
  '  float centerD = texture2D(uDepth, vTextureCoord).r;',
  '  float result = 0.0;',
  '  float wSum = 0.0;',
  '  for (int x = -1; x <= 1; x++) {',
  '    for (int y = -1; y <= 1; y++) {',
  '      vec2 uv = vTextureCoord + vec2(float(x), float(y)) * uTexel;',
  '      float d = texture2D(uDepth, uv).r;',
  '      float w = 1.0 - smoothstep(0.0, 0.0015, abs(d - centerD));',
  '      result += texture2D(uAO, uv).r * w;',
  '      wSum += w;',
  '    }',
  '  }',
  '  float ao = (wSum > 0.001) ? (result / wSum) : centerAO;',
  '  gl_FragColor = vec4(ao, ao, ao, 1.0);',
  '}'
].join('\n')

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

function resizeAOTargets () {
  if (!postSupported || !gl || !postWidth) return

  if (aoFullRes) {
    aoPassW = postWidth
    aoPassH = postHeight
  } else {
    aoPassW = Math.max(1, postWidth >> 1)
    aoPassH = Math.max(1, postHeight >> 1)
  }

  destroyPostTexture(aoTexture)
  destroyPostTexture(aoBlurTexture)
  destroyPostFBO(aoFBO)
  destroyPostFBO(aoBlurFBO)

  aoTexture = createPostColorTarget(aoPassW, aoPassH, true)
  aoFBO = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, aoFBO)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, aoTexture, 0)

  aoBlurTexture = createPostColorTarget(aoPassW, aoPassH, true)
  aoBlurFBO = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, aoBlurFBO)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, aoBlurTexture, 0)

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
}

function initAO () {
  if (!gl || !postSupported) return

  aoProgram = createPostProgram(POST_VS, AO_FS)
  aoBlurProgram = createPostProgram(POST_VS, AO_BLUR_FS)
  if (!aoProgram || !aoBlurProgram) return

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
  aoBlurProgram.depthUniform = gl.getUniformLocation(aoBlurProgram, 'uDepth')
  aoBlurProgram.texelUniform = gl.getUniformLocation(aoBlurProgram, 'uTexel')

  initAOKernelAndNoise()
  resizeAOTargets()
}

function getWhiteAOMask () {
  if (!aoBlurFBO || !aoBlurTexture) return null
  gl.bindFramebuffer(gl.FRAMEBUFFER, aoBlurFBO)
  gl.viewport(0, 0, aoPassW || postWidth, aoPassH || postHeight)
  gl.clearColor(1, 1, 1, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  return aoBlurTexture
}

function drawAOPass () {
  if (!useAO || !aoProgram || !aoBlurProgram || !aoFBO || !postSceneDepth) return null

  gl.bindFramebuffer(gl.FRAMEBUFFER, aoFBO)
  gl.viewport(0, 0, aoPassW, aoPassH)
  gl.clearColor(1, 1, 1, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.useProgram(aoProgram)
  bindPostQuad(aoProgram)

  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, postSceneDepth)
  gl.uniform1i(aoProgram.depthUniform, 0)
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, aoNoiseTexture)
  gl.uniform1i(aoProgram.noiseUniform, 1)
  gl.uniformMatrix4fv(aoProgram.projUniform, false, pMatrix)
  gl.uniform2f(aoProgram.noiseScaleUniform, aoPassW / 4, aoPassH / 4)
  gl.uniform2f(aoProgram.texelUniform, 1 / postWidth, 1 / postHeight)
  gl.uniform1f(aoProgram.radiusUniform, aoRadius)
  gl.uniform1f(aoProgram.biasUniform, aoBias)
  gl.uniform1f(aoProgram.nearUniform, postNear)
  gl.uniform1f(aoProgram.farUniform, postFar)
  for (var i = 0; i < aoKernelSize; i++) {
    gl.uniform3f(aoProgram.kernelUniforms[i], aoKernel[i][0], aoKernel[i][1], aoKernel[i][2])
  }
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, postQuadBuffer.numItems)

  gl.bindFramebuffer(gl.FRAMEBUFFER, aoBlurFBO)
  gl.viewport(0, 0, aoPassW, aoPassH)
  gl.useProgram(aoBlurProgram)
  bindPostQuad(aoBlurProgram)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, aoTexture)
  gl.uniform1i(aoBlurProgram.aoUniform, 0)
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, postSceneDepth)
  gl.uniform1i(aoBlurProgram.depthUniform, 1)
  gl.uniform2f(aoBlurProgram.texelUniform, 1 / aoPassW, 1 / aoPassH)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, postQuadBuffer.numItems)

  return aoBlurTexture
}
