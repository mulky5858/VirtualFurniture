// 屏幕空间接触阴影（短程、软边、忽略细碎自遮挡）
var useContactShadow = 1
var contactStrength = 0.45
var contactLength = 0.14
var contactThickness = 0.022
var contactBias = 0.0015
var contactMinScreenPx = 4.0

var contactFBO = null
var contactTexture = null
var contactBlurFBO = null
var contactBlurTexture = null
var contactProgram = null
var contactBlurProgram = null

var CONTACT_FS = [
  'precision mediump float;',
  'varying vec2 vTextureCoord;',
  'uniform sampler2D uDepth;',
  'uniform mat4 uProj;',
  'uniform vec3 uLightView;',
  'uniform float uNear;',
  'uniform float uFar;',
  'uniform float uLength;',
  'uniform float uThickness;',
  'uniform float uBias;',
  'uniform float uMinScreenPx;',
  'uniform vec2 uTexel;',
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
  '  if (depth > 0.9995) {',
  '    gl_FragColor = vec4(1.0);',
  '    return;',
  '  }',
  '  vec3 origin = getViewPos(vTextureCoord);',
  '  float originDepth = -origin.z;',
  '  vec3 toLight = uLightView - origin;',
  '  float distToLight = length(toLight);',
  '  if (distToLight < 0.05) {',
  '    gl_FragColor = vec4(1.0);',
  '    return;',
  '  }',
  '  vec3 rayDir = toLight / distToLight;',
  '  float maxLen = min(uLength, distToLight * 0.28);',
  '  float stepLen = maxLen / 16.0;',
  '  vec3 dx = getViewPos(vTextureCoord + vec2(uTexel.x, 0.0)) - origin;',
  '  vec3 dy = getViewPos(vTextureCoord + vec2(0.0, uTexel.y)) - origin;',
  '  vec3 normal = normalize(cross(dx, dy));',
  '  float nDotL = dot(normal, rayDir);',
  '  if (nDotL <= 0.05) {',
  '    gl_FragColor = vec4(1.0);',
  '    return;',
  '  }',
  // 起点抬高 + 跳过前几步，压键盘键帽这类细碎自阴影
  '  vec3 rayPos = origin + normal * max(uBias * 8.0, 0.004) + rayDir * (stepLen * 1.25);',
  '  float minUv = length(uTexel) * uMinScreenPx;',
  '  float minUv2 = minUv * minUv;',
  '  float shadow = 1.0;',
  '  for (int i = 0; i < 16; i++) {',
  '    rayPos += rayDir * stepLen;',
  '    vec4 clip = uProj * vec4(rayPos, 1.0);',
  '    if (abs(clip.w) < 0.0001) continue;',
  '    vec2 uv = clip.xy / clip.w * 0.5 + 0.5;',
  '    if (uv.x <= 0.0 || uv.x >= 1.0 || uv.y <= 0.0 || uv.y >= 1.0) break;',
  '    vec2 duv = uv - vTextureCoord;',
  '    if (dot(duv, duv) < minUv2) continue;',
  '    float sampleDepthRaw = texture2D(uDepth, uv).r;',
  '    if (sampleDepthRaw > 0.9995) continue;',
  '    float sceneDepth = linearizeDepth(sampleDepthRaw);',
  '    float rayDepth = -rayPos.z;',
  '    float delta = rayDepth - sceneDepth;',
  // 同深度薄片（键与键）直接忽略
  '    if (abs(originDepth - sceneDepth) < 0.012) continue;',
  '    float thickness = uThickness * (1.0 + originDepth * 0.015);',
  '    if (delta > uBias && delta < thickness) {',
  '      float travel = float(i + 1) / 16.0;',
  '      float distFade = 1.0 - travel * travel;',
  '      float thickFade = 1.0 - smoothstep(uBias, thickness, delta);',
  '      float facing = smoothstep(0.05, 0.4, nDotL);',
  '      float occ = distFade * thickFade * facing;',
  '      shadow = min(shadow, 1.0 - occ);',
  '      break;',
  '    }',
  '    if (delta > thickness) break;',
  '  }',
  '  shadow = mix(1.0, shadow, 0.88);',
  '  gl_FragColor = vec4(shadow, shadow, shadow, 1.0);',
  '}'
].join('\n')

var CONTACT_BLUR_FS = [
  'precision mediump float;',
  'varying vec2 vTextureCoord;',
  'uniform sampler2D uContact;',
  'uniform sampler2D uDepth;',
  'uniform vec2 uTexel;',
  'void main(void) {',
  '  float center = texture2D(uContact, vTextureCoord).r;',
  '  float centerD = texture2D(uDepth, vTextureCoord).r;',
  '  float result = 0.0;',
  '  float wSum = 0.0;',
  '  for (int x = -1; x <= 1; x++) {',
  '    for (int y = -1; y <= 1; y++) {',
  '      vec2 uv = vTextureCoord + vec2(float(x), float(y)) * uTexel;',
  '      float d = texture2D(uDepth, uv).r;',
  '      float w = 1.0 - smoothstep(0.0, 0.0012, abs(d - centerD));',
  '      result += texture2D(uContact, uv).r * w;',
  '      wSum += w;',
  '    }',
  '  }',
  '  float s = (wSum > 0.001) ? (result / wSum) : center;',
  '  gl_FragColor = vec4(s, s, s, 1.0);',
  '}'
].join('\n')

function resizeContactShadowTargets () {
  if (!postSupported || !gl || !postWidth) return

  destroyPostTexture(contactTexture)
  destroyPostTexture(contactBlurTexture)
  destroyPostFBO(contactFBO)
  destroyPostFBO(contactBlurFBO)

  contactTexture = createPostColorTarget(postWidth, postHeight, true)
  contactFBO = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, contactFBO)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, contactTexture, 0)

  contactBlurTexture = createPostColorTarget(postWidth, postHeight, true)
  contactBlurFBO = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, contactBlurFBO)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, contactBlurTexture, 0)

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
}

function initContactShadow () {
  if (!gl || !postSupported) return

  contactProgram = createPostProgram(POST_VS, CONTACT_FS)
  contactBlurProgram = createPostProgram(POST_VS, CONTACT_BLUR_FS)
  if (!contactProgram || !contactBlurProgram) return

  contactProgram.depthUniform = gl.getUniformLocation(contactProgram, 'uDepth')
  contactProgram.projUniform = gl.getUniformLocation(contactProgram, 'uProj')
  contactProgram.lightViewUniform = gl.getUniformLocation(contactProgram, 'uLightView')
  contactProgram.nearUniform = gl.getUniformLocation(contactProgram, 'uNear')
  contactProgram.farUniform = gl.getUniformLocation(contactProgram, 'uFar')
  contactProgram.lengthUniform = gl.getUniformLocation(contactProgram, 'uLength')
  contactProgram.thicknessUniform = gl.getUniformLocation(contactProgram, 'uThickness')
  contactProgram.biasUniform = gl.getUniformLocation(contactProgram, 'uBias')
  contactProgram.minScreenPxUniform = gl.getUniformLocation(contactProgram, 'uMinScreenPx')
  contactProgram.texelUniform = gl.getUniformLocation(contactProgram, 'uTexel')

  contactBlurProgram.contactUniform = gl.getUniformLocation(contactBlurProgram, 'uContact')
  contactBlurProgram.depthUniform = gl.getUniformLocation(contactBlurProgram, 'uDepth')
  contactBlurProgram.texelUniform = gl.getUniformLocation(contactBlurProgram, 'uTexel')

  resizeContactShadowTargets()
}

function getContactShadowTexture () {
  return contactBlurTexture || contactTexture
}

function drawContactShadowPass () {
  if (!useContactShadow || !contactProgram || !contactFBO || !postSceneDepth) return false
  if (typeof lighting !== 'undefined' && !lighting) return false
  if (typeof sceneLights === 'undefined' || !sceneLights.length) return false

  var lightEye = [0, 0, 0]
  var view = postViewMatrix || mvMatrix
  mat4.multiplyVec3(view, pointlight, lightEye)

  gl.bindFramebuffer(gl.FRAMEBUFFER, contactFBO)
  gl.viewport(0, 0, postWidth, postHeight)
  gl.clearColor(1, 1, 1, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.useProgram(contactProgram)
  bindPostQuad(contactProgram)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, postSceneDepth)
  gl.uniform1i(contactProgram.depthUniform, 0)
  gl.uniformMatrix4fv(contactProgram.projUniform, false, pMatrix)
  gl.uniform3f(contactProgram.lightViewUniform, lightEye[0], lightEye[1], lightEye[2])
  gl.uniform1f(contactProgram.nearUniform, postNear)
  gl.uniform1f(contactProgram.farUniform, postFar)
  gl.uniform1f(contactProgram.lengthUniform, contactLength)
  gl.uniform1f(contactProgram.thicknessUniform, contactThickness)
  gl.uniform1f(contactProgram.biasUniform, contactBias)
  gl.uniform1f(contactProgram.minScreenPxUniform, contactMinScreenPx)
  gl.uniform2f(contactProgram.texelUniform, 1 / postWidth, 1 / postHeight)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, postQuadBuffer.numItems)

  if (contactBlurProgram && contactBlurFBO) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, contactBlurFBO)
    gl.viewport(0, 0, postWidth, postHeight)
    gl.useProgram(contactBlurProgram)
    bindPostQuad(contactBlurProgram)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, contactTexture)
    gl.uniform1i(contactBlurProgram.contactUniform, 0)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, postSceneDepth)
    gl.uniform1i(contactBlurProgram.depthUniform, 1)
    gl.uniform2f(contactBlurProgram.texelUniform, 1 / postWidth, 1 / postHeight)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, postQuadBuffer.numItems)
  }

  return true
}
