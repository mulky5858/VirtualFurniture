function isWebGL2Context (ngl) {
  return !!(ngl && (ngl.isWebGL2 ||
    (typeof WebGL2RenderingContext !== 'undefined' && ngl instanceof WebGL2RenderingContext)))
}

// 将页面内 GLSL ES 1.0 源码适配为 WebGL2 的 GLSL ES 3.00
function adaptShaderSource (ngl, source, isFragment) {
  if (!isWebGL2Context(ngl)) {
    return source
  }

  source = source.replace(/^\s*#extension\s+GL_OES_standard_derivatives\s*:\s*enable\s*;?\s*/m, '')
  source = source.replace(/\btexture2D\s*\(/g, 'texture(')
  source = source.replace(/\btextureCube\s*\(/g, 'texture(')

  if (isFragment) {
    source = source.replace(/\bvarying\b/g, 'in')
    source = source.replace(/\bgl_FragColor\b/g, 'fragColor')
    if (source.indexOf('out vec4 fragColor') === -1) {
      if (/precision\s+\w+\s+float\s*;/.test(source)) {
        source = source.replace(/(precision\s+\w+\s+float\s*;)/, '$1\nout vec4 fragColor;')
      } else {
        source = 'out vec4 fragColor;\n' + source
      }
    }
  } else {
    source = source.replace(/\battribute\b/g, 'in')
    source = source.replace(/\bvarying\b/g, 'out')
  }

  return '#version 300 es\n' + source
}

function getShader (ngl, id) {
  var shaderScript = document.getElementById(id)
  if (!shaderScript) {
    return null
  }

  var str = ''
  var k = shaderScript.firstChild
  while (k) {
    if (k.nodeType == 3) {
      str += k.textContent
    }
    k = k.nextSibling
  }

  var shader
  var isFragment = false
  if (shaderScript.type == 'x-shader/x-fragment') {
    shader = ngl.createShader(ngl.FRAGMENT_SHADER)
    isFragment = true
  } else if (shaderScript.type == 'x-shader/x-vertex') {
    shader = ngl.createShader(ngl.VERTEX_SHADER)
  } else {
    return null
  }

  ngl.shaderSource(shader, adaptShaderSource(ngl, str, isFragment))
  ngl.compileShader(shader)

  if (!ngl.getShaderParameter(shader, ngl.COMPILE_STATUS)) {
    alert(ngl.getShaderInfoLog(shader))
    return null
  }

  return shader
}

function enableAttrib (ngl, location) {
  if (location >= 0) {
    ngl.enableVertexAttribArray(location)
  }
}

// WebGL2 可能优化掉未使用 attribute，location 为 -1 时不可调用 vertexAttribPointer
function bindAttribBuffer (ngl, location, buffer) {
  if (location < 0 || !buffer) return
  ngl.bindBuffer(ngl.ARRAY_BUFFER, buffer.data || buffer)
  ngl.vertexAttribPointer(location, buffer.itemSize, ngl.FLOAT, false, 0, 0)
}

function createProgram (ngl, fragmentShaderID, vertexShaderID) {
  var fragmentShader = getShader(ngl, fragmentShaderID)
  var vertexShader = getShader(ngl, vertexShaderID)
  if (!fragmentShader || !vertexShader) {
    return null
  }

  var program = ngl.createProgram()
  ngl.attachShader(program, vertexShader)
  ngl.attachShader(program, fragmentShader)
  ngl.bindAttribLocation(program, 0, 'aVertexPosition')
  ngl.bindAttribLocation(program, 1, 'aVertexNormal')
  ngl.bindAttribLocation(program, 2, 'aTextureCoord')
  ngl.linkProgram(program)

  if (!ngl.getProgramParameter(program, ngl.LINK_STATUS)) {
    alert('无法加载着色器。')
    return null
  }

  program.vertexPositionAttribute = ngl.getAttribLocation(program, 'aVertexPosition')
  enableAttrib(ngl, program.vertexPositionAttribute)

  program.vertexNormalAttribute = ngl.getAttribLocation(program, 'aVertexNormal')
  enableAttrib(ngl, program.vertexNormalAttribute)

  program.textureCoordAttribute = ngl.getAttribLocation(program, 'aTextureCoord')
  enableAttrib(ngl, program.textureCoordAttribute)

  program.pMatrixUniform = ngl.getUniformLocation(program, 'uPMatrix')
  program.mvMatrixUniform = ngl.getUniformLocation(program, 'uMVMatrix')
  program.nMatrixUniform = ngl.getUniformLocation(program, 'uNMatrix')
  program.samplerUniform = ngl.getUniformLocation(program, 'uSampler')
  program.useTexturesUniform = ngl.getUniformLocation(program, 'uUseTextures')
  program.useLightingUniform = ngl.getUniformLocation(program, 'uUseLighting')
  program.ambientColorUniform = ngl.getUniformLocation(program, 'uAmbientColor')

  program.pointLightingLocationUniform = ngl.getUniformLocation(program, 'uPointLightingLocation')
  program.pointLightingColorUniform = ngl.getUniformLocation(program, 'uPointLightingColor')
  program.lightCountUniform = ngl.getUniformLocation(program, 'uLightCount')
  program.pointLightingLocationUniforms = []
  program.pointLightingColorUniforms = []
  for (var li = 0; li < 8; li++) {
    program.pointLightingLocationUniforms[li] = ngl.getUniformLocation(program, 'uPointLightingLocations[' + li + ']')
    program.pointLightingColorUniforms[li] = ngl.getUniformLocation(program, 'uPointLightingColors[' + li + ']')
  }

  program.useMaterialMapsUniform = ngl.getUniformLocation(program, 'uUseMaterialMaps')
  program.normalMapUniform = ngl.getUniformLocation(program, 'uNormalMap')
  program.roughnessMapUniform = ngl.getUniformLocation(program, 'uRoughnessMap')
  program.specularStrengthUniform = ngl.getUniformLocation(program, 'uSpecularStrength')
  program.shininessUniform = ngl.getUniformLocation(program, 'uShininess')

  return program
}

var shaderProgram
var shaderProgram2
var shadowProgram

var perVertexProgram
var perFragmentProgram

var perVertexProgram1
var perFragmentProgram2
var perVertexProgram2

function attachShadowUniforms (ngl, program) {
  program.invCameraViewUniform = ngl.getUniformLocation(program, 'uInvCameraView')
  program.lightWorldUniform = ngl.getUniformLocation(program, 'uLightWorld')
  program.shadowMapUniform = ngl.getUniformLocation(program, 'uShadowMap')
  program.useShadowUniform = ngl.getUniformLocation(program, 'uUseShadow')
  program.shadowBiasUniform = ngl.getUniformLocation(program, 'uShadowBias')
  program.shadowFarUniform = ngl.getUniformLocation(program, 'uShadowFar')
  program.shadowTexelSizeUniform = ngl.getUniformLocation(program, 'uShadowTexelSize')
}

function initShaders (ngl) {
  // WebGL1 法线贴图 cotangent frame 依赖该扩展；WebGL2 为核心功能
  if (!isWebGL2Context(ngl)) {
    ngl.getExtension('OES_standard_derivatives')
  }
  // perVertexProgram = createProgram(ngl,"per-vertex-lighting-fs", "per-vertex-lighting-vs")
  perFragmentProgram = createProgram(ngl, 'per-fragment-lighting-fs', 'per-fragment-lighting-vs')
  if (perFragmentProgram) {
    attachShadowUniforms(ngl, perFragmentProgram)
  }
  shadowProgram = createProgram(ngl, 'shadow-depth-fs', 'shadow-depth-vs')
  if (shadowProgram) {
    shadowProgram.shadowFarUniform = ngl.getUniformLocation(shadowProgram, 'uShadowFar')
  }
}
function initShaders2 (ngl) {
  perVertexProgram2 = createProgram(ngl, 'per-vertex-lighting-fs', 'per-vertex-lighting-vs')
// perFragmentProgram2 = createProgram(ngl,"per-fragment-lighting-fs", "per-fragment-lighting-vs")
}
