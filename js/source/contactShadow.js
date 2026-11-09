// 屏幕空间接触阴影
var useContactShadow = 1
var contactStrength = 0.75
var contactLength = 0.45
var contactThickness = 0.08
var contactBias = 0.002

var contactFBO = null
var contactTexture = null
var contactProgram = null

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
  '    gl_FragColor = vec4(1.0);',
  '    return;',
  '  }',
  '  vec3 origin = getViewPos(vTextureCoord);',
  '  vec3 toLight = uLightView - origin;',
  '  float distToLight = length(toLight);',
  '  if (distToLight < 0.001) {',
  '    gl_FragColor = vec4(1.0);',
  '    return;',
  '  }',
  '  vec3 rayDir = toLight / distToLight;',
  '  float maxLen = min(uLength, distToLight * 0.95);',
  '  float stepLen = maxLen / 12.0;',
  '  float shadow = 1.0;',
  '  for (int i = 1; i <= 12; i++) {',
  '    vec3 samplePos = origin + rayDir * (stepLen * float(i));',
  '    vec4 clip = uProj * vec4(samplePos, 1.0);',
  '    if (abs(clip.w) < 0.0001) continue;',
  '    vec2 uv = clip.xy / clip.w * 0.5 + 0.5;',
  '    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) break;',
  '    float rayDepth = -samplePos.z;',
  '    float sceneDepth = linearizeDepth(texture2D(uDepth, uv).r);',
  '    float delta = rayDepth - sceneDepth;',
  '    if (delta > uBias && delta < uThickness) {',
  '      float t = float(i) / 12.0;',
  '      float fade = 1.0 - t;',
  '      float soft = 1.0 - smoothstep(uBias, uThickness, delta);',
  '      shadow = min(shadow, 1.0 - fade * soft);',
  '      break;',
  '    }',
  '  }',
  '  gl_FragColor = vec4(shadow, shadow, shadow, 1.0);',
  '}'
].join('\n')

function resizeContactShadowTargets () {
  if (!postSupported || !gl || !postWidth) return

  destroyPostTexture(contactTexture)
  destroyPostFBO(contactFBO)

  contactTexture = createPostColorTarget(postWidth, postHeight, true)
  contactFBO = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, contactFBO)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, contactTexture, 0)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
}

function initContactShadow () {
  if (!gl || !postSupported) return

  contactProgram = createPostProgram(POST_VS, CONTACT_FS)
  if (!contactProgram) return

  contactProgram.depthUniform = gl.getUniformLocation(contactProgram, 'uDepth')
  contactProgram.projUniform = gl.getUniformLocation(contactProgram, 'uProj')
  contactProgram.lightViewUniform = gl.getUniformLocation(contactProgram, 'uLightView')
  contactProgram.nearUniform = gl.getUniformLocation(contactProgram, 'uNear')
  contactProgram.farUniform = gl.getUniformLocation(contactProgram, 'uFar')
  contactProgram.lengthUniform = gl.getUniformLocation(contactProgram, 'uLength')
  contactProgram.thicknessUniform = gl.getUniformLocation(contactProgram, 'uThickness')
  contactProgram.biasUniform = gl.getUniformLocation(contactProgram, 'uBias')

  resizeContactShadowTargets()
}

function getContactShadowTexture () {
  return contactTexture
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
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, postQuadBuffer.numItems)
  return true
}
