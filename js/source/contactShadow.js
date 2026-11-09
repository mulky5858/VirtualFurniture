// 屏幕空间接触阴影：短、软、贴合；抑制键帽细碎自影与远处剪影
var useContactShadow = 1
var contactStrength = 0.3
var contactLength = 0.055
var contactThickness = 0.024
var contactBias = 0.0016

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
  'vec3 getNormal(vec2 uv, vec3 origin) {',
  '  vec3 px1 = getViewPos(uv + vec2(uTexel.x, 0.0)) - origin;',
  '  vec3 px2 = origin - getViewPos(uv - vec2(uTexel.x, 0.0));',
  '  vec3 py1 = getViewPos(uv + vec2(0.0, uTexel.y)) - origin;',
  '  vec3 py2 = origin - getViewPos(uv - vec2(0.0, uTexel.y));',
  '  vec3 dx = (dot(px1, px1) < dot(px2, px2)) ? px1 : px2;',
  '  vec3 dy = (dot(py1, py1) < dot(py2, py2)) ? py1 : py2;',
  '  return normalize(cross(dx, dy));',
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
  '  vec3 normal = getNormal(vTextureCoord, origin);',
  '  float nDotL = dot(normal, rayDir);',
  '  if (nDotL <= 0.1) {',
  '    gl_FragColor = vec4(1.0);',
  '    return;',
  '  }',
  // 近邻 + 稍远邻域深度起伏：键帽中心也能识别，桌面/地板仍平滑
  '  float z1 = linearizeDepth(texture2D(uDepth, vTextureCoord + vec2(uTexel.x * 2.0, 0.0)).r);',
  '  float z2 = linearizeDepth(texture2D(uDepth, vTextureCoord - vec2(uTexel.x * 2.0, 0.0)).r);',
  '  float z3 = linearizeDepth(texture2D(uDepth, vTextureCoord + vec2(0.0, uTexel.y * 2.0)).r);',
  '  float z4 = linearizeDepth(texture2D(uDepth, vTextureCoord - vec2(0.0, uTexel.y * 2.0)).r);',
  '  float z5 = linearizeDepth(texture2D(uDepth, vTextureCoord + vec2(uTexel.x * 6.0, uTexel.y * 3.0)).r);',
  '  float z6 = linearizeDepth(texture2D(uDepth, vTextureCoord - vec2(uTexel.x * 6.0, uTexel.y * 3.0)).r);',
  '  float detailNear = abs(z1 - originDepth) + abs(z2 - originDepth) + abs(z3 - originDepth) + abs(z4 - originDepth);',
  '  float detailWide = abs(z5 - originDepth) + abs(z6 - originDepth);',
  '  if (detailNear > 0.018 || (normal.y > 0.45 && detailWide > 0.012)) {',
  '    gl_FragColor = vec4(1.0);',
  '    return;',
  '  }',
  '  float maxLen = min(uLength, distToLight * 0.22);',
  '  float stepLen = maxLen / 12.0;',
  '  vec3 rayPos = origin + normal * uBias + rayDir * (stepLen * 0.6);',
  '  float occlusion = 0.0;',
  '  for (int i = 0; i < 12; i++) {',
  '    rayPos += rayDir * stepLen;',
  '    float traveled = stepLen * float(i + 1);',
  '    vec4 clip = uProj * vec4(rayPos, 1.0);',
  '    if (abs(clip.w) < 0.0001) continue;',
  '    vec2 uv = clip.xy / clip.w * 0.5 + 0.5;',
  '    if (uv.x <= 0.0 || uv.x >= 1.0 || uv.y <= 0.0 || uv.y >= 1.0) break;',
  '    float sampleDepthRaw = texture2D(uDepth, uv).r;',
  '    if (sampleDepthRaw > 0.9995) continue;',
  '    float sceneDepth = linearizeDepth(sampleDepthRaw);',
  '    float rayDepth = -rayPos.z;',
  '    float delta = rayDepth - sceneDepth;',
  '    float depthGap = abs(originDepth - sceneDepth);',
  // 远处剪影：柜子投到墙/远处地板
  '    if (depthGap > max(0.1, maxLen * 1.7)) {',
  '      if (delta > uThickness) break;',
  '      continue;',
  '    }',
  // 近共面（键帽、柜门缝）需要更长行程才算接触，避免细碎自影
  '    float minTravel = mix(0.048, 0.014, smoothstep(0.004, 0.022, depthGap));',
  '    if (traveled < minTravel) continue;',
  '    float thickness = uThickness * (1.0 + originDepth * 0.008);',
  '    if (delta > uBias && delta < thickness) {',
  '      float travel = clamp(traveled / maxLen, 0.0, 1.0);',
  '      float distFade = 1.0 - travel * travel;',
  '      float thickFade = 1.0 - smoothstep(uBias, thickness, delta);',
  '      float proxFade = 1.0 - smoothstep(0.018, max(0.07, maxLen), depthGap);',
  '      float facing = smoothstep(0.12, 0.55, nDotL);',
  // 键帽顶面：法线朝上且深度差仍偏小的命中再压一层
  '      float flatGuard = 1.0 - smoothstep(0.55, 0.92, normal.y) * (1.0 - smoothstep(0.01, 0.03, depthGap));',
  '      occlusion = max(occlusion, distFade * thickFade * proxFade * facing * flatGuard);',
  '      break;',
  '    }',
  '    if (delta > thickness) break;',
  '  }',
  '  occlusion = min(occlusion * 0.55, 0.28);',
  '  float shadow = 1.0 - occlusion;',
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
  '  for (int x = -2; x <= 2; x++) {',
  '    for (int y = -2; y <= 2; y++) {',
  '      vec2 uv = vTextureCoord + vec2(float(x), float(y)) * uTexel * 1.25;',
  '      float d = texture2D(uDepth, uv).r;',
  '      float w = 1.0 - smoothstep(0.0, 0.0015, abs(d - centerD));',
  '      float spatial = exp(-0.35 * float(x * x + y * y));',
  '      w *= spatial;',
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
