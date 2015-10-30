/**
 * The Shader class is used internally to give shader programs an identifier (name)
 * alongside the program itself
 *
 * @class Shader
 * @constructor
 * @param {String} name Name of the program
 * @param {Object} program The program object
 */
LE.Shader = function(name, program) {
    /**
     * @private
     * @property name
     * @type String 
     */
    this.name = name,
    /**
     * @private
     * @property program
     * @type Object 
     */
    this.program = program
}

/**
 * The Shaders class is used internally to tell the WebGLRender which shader is currently
 * selected. It also stores a list of all the shaders being used.
 *
 * @class Shaders
 * @constructor
 */
LE.Shaders = function() {
    /**
     * @private
     * @property selected
     * @type Object
     */
    this.selected,
    /**
     * @private
     * @property list
     * @type Array
     */
    this.list = []
};

/**
 * Sets the selected property to the shader. Also tells WebGL to use this shader
 *
 * @private
 * @method setCurrentShader
 * @param {Object} gl
 * @param {Object} shaderProgram
 */
LE.Shaders.prototype.setCurrentShader = function(gl, shaderProgram) {
    gl.useProgram(shaderProgram);
    this.selected = shaderProgram;
};

/**
 * Loads a shader from an HTML script tag
 *
 * @private
 * @method getShaderFromHTML
 * @param {Object} gl
 * @param {String} id
 */
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

/**
 * Loads a shader from a JavaScript variable
 *
 * @private
 * @method getShaderFromVar
 * @param {Object} gl
 * @param {String} shaderSrc
 * @param {String} type
 */
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

/**
 * Creates a shader program from a vertex shader and a fragment shader
 *
 * @private
 * @method createShader
 * @param {Object} gl
 * @param {Boolean} isTextureShader
 * @param {String} vertexShader
 * @param {String} fragmentShader
 */    
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

/**
 * Enables a shader programs internal attributes. This allows WebGL to parse
 * values to the shader program
 *
 * @private
 * @method enableRegularShaderAttribs
 * @param {Object} gl
 * @param {Object} shaderProgram
 */ 
LE.Shaders.prototype.enableRegularShaderAttribs = function(gl, shaderProgram) {
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
};

/**
 * Enables a texture shader programs internal attributes. This allows WebGL to parse
 * values to the shader program
 *
 * @private
 * @method enableTextureShaderAttribs
 * @param {Object} gl
 * @param {Object} shaderProgram
 */ 
LE.Shaders.prototype.enableTextureShaderAttribs = function(gl, shaderProgram) {
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
};
