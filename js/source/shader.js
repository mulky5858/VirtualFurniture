function getShader(ngl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = ngl.createShader(ngl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = ngl.createShader(ngl.VERTEX_SHADER);
        } else {
            return null;
        }

        ngl.shaderSource(shader, str);
        ngl.compileShader(shader);

        if (!ngl.getShaderParameter(shader, ngl.COMPILE_STATUS)) {
            alert(ngl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    

    function  createProgram(ngl,fragmentShaderID, vertexShaderID) {
        var fragmentShader = getShader(ngl, fragmentShaderID);
        var vertexShader = getShader(ngl, vertexShaderID);

        var program = ngl.createProgram();
        ngl.attachShader(program, vertexShader);
        ngl.attachShader(program, fragmentShader);
        ngl.linkProgram(program);

        if (!ngl.getProgramParameter(program, ngl.LINK_STATUS)) {
            alert("无法加载着色器。");
        }

   

		
		program.vertexPositionAttribute = ngl.getAttribLocation(program, "aVertexPosition");
		ngl.enableVertexAttribArray(program.vertexPositionAttribute);
				
		program.vertexNormalAttribute = ngl.getAttribLocation(program, "aVertexNormal");
		ngl.enableVertexAttribArray(program.vertexNormalAttribute);
				
		program.textureCoordAttribute = ngl.getAttribLocation(program, "aTextureCoord");
		ngl.enableVertexAttribArray(program.textureCoordAttribute);

		program.pMatrixUniform = ngl.getUniformLocation(program, "uPMatrix");
		program.mvMatrixUniform = ngl.getUniformLocation(program, "uMVMatrix");
		program.nMatrixUniform = ngl.getUniformLocation(program, "uNMatrix")
		program.samplerUniform = ngl.getUniformLocation(program, "uSampler");
		program.useTexturesUniform = ngl.getUniformLocation(program, "uUseTextures");
		program.useLightingUniform = ngl.getUniformLocation(program, "uUseLighting");
		program.ambientColorUniform = ngl.getUniformLocation(program, "uAmbientColor");
		

		
		program.pointLightingLocationUniform = ngl.getUniformLocation(program, "uPointLightingLocation");
        program.pointLightingColorUniform = ngl.getUniformLocation(program, "uPointLightingColor");
		
	
		return program;
		}	

		
    
    var shaderProgram;
	var shaderProgram2;
	
    var perVertexProgram;
    var perFragmentProgram;
	
	var perVertexProgram1;
    var perFragmentProgram2;


    function initShaders(ngl) {
        //perVertexProgram = createProgram(ngl,"per-vertex-lighting-fs", "per-vertex-lighting-vs");
        perFragmentProgram = createProgram(ngl,"per-fragment-lighting-fs", "per-fragment-lighting-vs");
    }
    function initShaders2(ngl) {
        perVertexProgram2 = createProgram(ngl,"per-vertex-lighting-fs", "per-vertex-lighting-vs");
        //perFragmentProgram2 = createProgram(ngl,"per-fragment-lighting-fs", "per-fragment-lighting-vs");
    }