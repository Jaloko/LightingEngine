LE.Shader = function(name, program) {
    this.name = name,
    this.program = program
}

LE.Shaders = function() {
    this.selected,
    this.list = []
};

LE.Shaders.prototype.setCurrentShader = function(gl, shaderProgram) {
    gl.useProgram(shaderProgram);
    this.selected = shaderProgram;
};

LE.Shaders.prototype.getShaderFromHTML = function(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
    if (k.nodeType == 3)
        str += k.textContent;
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(this.gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(this.gl.VERTEX_SHADER);
    } else {
        return null;
    }
    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
};

LE.Shaders.prototype.getShaderFromVar = function(gl, shaderSrc, type) {
    var shader;
    if(type == "Vert" || type == "Vertex" || type == "VertexShader") {
        shader = gl.createShader(gl.VERTEX_SHADER);  
    } else if(type == "Frag" || type == "Fragment" || type == "FragmentShader") {
        shader = gl.createShader(gl.FRAGMENT_SHADER); 
    } else {
        console.log("Error: Cannot get shader. Invalid type provided.");
        return;
    }
    gl.shaderSource(shader, shaderSrc);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
};
    
LE.Shaders.prototype.createShader = function(gl, isTextureShader, vertexShader, fragmentShader) {
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shader: " + shaderProgram);
    }
    gl.useProgram(shaderProgram);
    if(isTextureShader == true) {
        this.enableTextureShaderAttribs(gl, shaderProgram);  
    } else {
        this.enableRegularShaderAttribs(gl, shaderProgram);  
    }
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

    return shaderProgram;
};

LE.Shaders.prototype.enableRegularShaderAttribs = function(gl, shaderProgram) {
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
};

LE.Shaders.prototype.enableTextureShaderAttribs = function(gl, shaderProgram) {
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
};
