var rttFramebuffer = Array()
var rttTexture = Array()
var TVScreenVertexPositionBuffer = Array()
var TVScreenVertexTextureCoordBuffer = Array()

for (var k = 1; k <= numofTVchannel; k++) {
  TVScreenVertexPositionBuffer[k] = { }
    TVScreenVertexTextureCoordBuffer[k] = { }
    }

function initTextureFramebuffer (channel) {
	rttFramebuffer[channel] = gl.createFramebuffer()
	gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer[channel])
	rttFramebuffer[channel].width = 512
	rttFramebuffer[channel].height = 512

	rttTexture[channel] = gl.createTexture()
	gl.bindTexture(gl.TEXTURE_2D, rttTexture[channel])
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST)
	gl.generateMipmap(gl.TEXTURE_2D)

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, rttFramebuffer[channel].width, rttFramebuffer[channel].height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

	var renderbuffer = gl.createRenderbuffer()
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer)
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, rttFramebuffer[channel].width, rttFramebuffer[channel].height)

	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rttTexture[channel], 0)
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer)

	gl.bindTexture(gl.TEXTURE_2D, null)
	gl.bindRenderbuffer(gl.RENDERBUFFER, null)
	gl.bindFramebuffer(gl.FRAMEBUFFER, null)
}

var cubeVertexPositionBuffer
var cubeVertexTextureCoordBuffer
var cubeVertexIndexBuffer

function initBuffers (channel) {
	cubeVertexPositionBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer)
	vertices = [-1.0, -1.0, 1.0, // front
	1.0, -1.0, 1.0,
	1.0, 1.0, 1.0,
	-1.0, 1.0, 1.0,

	-1.0, -1.0, -1.0, // back
	-1.0, 1.0, -1.0,
	1.0, 1.0, -1.0,
	1.0, -1.0, -1.0,

	-1.0, 1.0, -1.0, // top
	-1.0, 1.0, 1.0,
	1.0, 1.0, 1.0,
	1.0, 1.0, -1.0,

	-1.0, -1.0, -1.0, // bottom 
	1.0, -1.0, -1.0,
	1.0, -1.0, 1.0,
	-1.0, -1.0, 1.0,

	1.0, -1.0, -1.0, // right
	1.0, 1.0, -1.0,
	1.0, 1.0, 1.0,
	1.0, -1.0, 1.0,

	-1.0, -1.0, -1.0, // left
	-1.0, -1.0, 1.0,
	-1.0, 1.0, 1.0,
	-1.0, 1.0, -1.0]
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
	cubeVertexPositionBuffer.itemSize = 3
	cubeVertexPositionBuffer.numItems = 24

	cubeVertexTextureCoordBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer)
	var textureCoords = [
	0, 0, // Front face
	1, 0,
	1, 1,
	0, 1,

	1, 0, // Back face
	1, 1,
	0, 1,
	0, 0,

	0, 1, // Top face
	0, 0,
	1, 0,
	1, 1,

	1, 1, // Bottom face
	0, 1,
	0, 0,
	1, 0,

	1, 0, // Right face
	1, 1,
	0, 1,
	0, 0,

	0, 0, // Left face
	1, 0,
	1, 1,
	0, 1
	]
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW)
	cubeVertexTextureCoordBuffer.itemSize = 2
	cubeVertexTextureCoordBuffer.numItems = 24

	cubeVertexIndexBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer)
	var cubeVertexIndices = [0, 1, 2, 0, 2, 3,
	4, 5, 6, 4, 6, 7,
	8, 9, 10, 8, 10, 11,
	12, 13, 14, 12, 14, 15,
	16, 17, 18, 16, 18, 19,
	20, 21, 22, 20, 22, 23]
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW)
	cubeVertexIndexBuffer.itemSize = 1
	cubeVertexIndexBuffer.numItems = 36

	TVScreenVertexPositionBuffer[channel] = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, TVScreenVertexPositionBuffer[channel])
	vertices = [
	0.78, 0.47, 0,
	-0.79, 0.47, 0,
	0.78, -0.33, 0,
	-0.79, -0.33, 0]
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
	TVScreenVertexPositionBuffer[channel].itemSize = 3
	TVScreenVertexPositionBuffer[channel].numItems = 4

	TVScreenVertexTextureCoordBuffer[channel] = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, TVScreenVertexTextureCoordBuffer[channel])
	var textureCoords = [
	1.0, 1.0,
	0.0, 1.0,
	1.0, 0.0,
	0.0, 0.0]
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW)
	TVScreenVertexTextureCoordBuffer[channel].itemSize = 2
	TVScreenVertexTextureCoordBuffer[channel].numItems = 4
}

function drawSceneOnTVScreen (channel) {
	gl.viewport(0, 0, rttFramebuffer[channel].width, rttFramebuffer[channel].height)
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

	mat4.perspective(45, 1, 0.1, 100.0, pMatrix)

	mat4.identity(mvMatrix)

	mat4.translate(mvMatrix, [0, 0, -3.41])

	mvPushMatrix()

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer)
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)

	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer)
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0)

	gl.activeTexture(gl.TEXTURE0)
	gl.bindTexture(gl.TEXTURE_2D, onloadTVtexture[channel])
	gl.uniform1i(shaderProgram.samplerUniform, 0)

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer)
	setMatrixUniforms()
	gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0)
	mvPopMatrix()

	gl.bindTexture(gl.TEXTURE_2D, rttTexture[channel])
	gl.generateMipmap(gl.TEXTURE_2D)
	gl.bindTexture(gl.TEXTURE_2D, null)
}

function refreshTVtexture (i) {
	onloadTVtexture[i] = gl.createTexture()
	onloadTVtexture[i].image = new Image()
	onloadTVtexture[i].image.src = tvTexture[i][change[i]].image.src
	handleLoadedTexture(onloadTVtexture[i])
}
