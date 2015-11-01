/**
 * The WebGLRenderer class renders the Scene using a WebGL canvas context and a camera
 *
 * @class WebGLRenderer
 * @constructor
 * @param {Object} parameters Parameters is an object that contains the WebGLRenderers properties
 * @param {DOMElement} parameters.canvas
 * @param {LE.Scene} [parameters.scene=new LE.Scene()]
 * @param {LE.OrthographicCamera} [parameters.camera=new LE.OrthographicCamera(0, 0)]
 */
LE.WebGLRenderer = function(parameters) {
    if(parameters == null) {
        console.error("To create a WebGLRenderer a canvas needs to be provided.")
    }
    // Variable declarations
    /**
     * Stores the WebGL canvas context
     *
     * @private
     * @property gl
     * @type Object
     */
    this.gl,
    /**
     * Stores the canvas element
     *
     * @private
     * @property canvas
     * @type Object
     */
    this.canvas = parameters.canvas,
    /**
     * Stores the Scene. This is interchangeable with any Scene during runtime
     *
     * @property scene
     * @type Scene
     * @default new LE.Scene()
     */
    this._scene = parameters.scene || new LE.Scene(),
    /**
     * Stores the Camera. This is interchangeable with any Camera during runtime
     *
     * @property camera
     * @type Camera
     * @default new LE.OrthographicCamera(0, 0)
     */
    this._camera = parameters.camera || new LE.OrthographicCamera(0, 0),
    /**
     * Stores the shaders
     *
     * @private
     * @property shaders
     * @type Shaders
     * @default new LE.Shaders()
     */
    this.shaders = new LE.Shaders();

    // Constructor
    this.initGL();
    this.initShaders();
    this.prepareGL();
};

LE.WebGLRenderer.prototype = {
    get scene() {
        return this._scene;
    },
    set scene(scene) {
        if(scene instanceof LE.Scene) {
            this._scene = scene;
            if(this.gl != null) {
                this._scene.init(this.gl);
            }
        } else {
            console.warn("Object is not of type LE.Scene!");
        }
    },
    get camera() {
        return this._camera;
    },

    set camera(camera) {
        if(camera instanceof LE.OrthographicCamera) {
            this._camera = camera;
            if(this.gl != null) {
                this._camera.ortho(-this.gl.viewportRatio, this.gl.viewportRatio, -1.0, 1.0, 0.1, 100.0);
                this._camera.translate(-this.gl.viewportRatio, -1.0, -1.0);
            }
        } else {
            console.warn("Object is not of type LE.OrthographicCamera!");
        }
    }
};

/**
 * Initialises the WebGL context
 *
 * @method initGL
 * @private
 */
LE.WebGLRenderer.prototype.initGL = function() {
    try {
        // Experimental webgl so it can run in internet explorer and edge
        this.gl = this.canvas.getContext("experimental-webgl", {stencil:true});
        this.gl.viewportWidth = canvas.width;
        this.gl.viewportHeight = canvas.height;
        this.gl.viewportRatio = canvas.width / canvas.height;

        if(this.scene != null) {
            this.scene.init(this.gl);
        }
    } catch(e) {
    }
    if (!this.gl) {
        alert("Could not initialise WebGL, sorry :-( ");
    }
};

/**
 * Initialises the shaders
 *
 * @method initShaders
 * @private
 */
LE.WebGLRenderer.prototype.initShaders = function() {
    // Shader Parts
    var pointLightfragmentShader = this.shaders.getShaderFromVar(this.gl, LE.ShaderLib.POINT_LIGHT_FRAG, "Frag");
    var pointLightfragmentShader2 = this.shaders.getShaderFromVar(this.gl, LE.ShaderLib.POINT_LIGHT_FRAG2, "Frag");
    var vertexShader = this.shaders.getShaderFromVar(this.gl, LE.ShaderLib.MAIN_VERT, "Vert");
    var radialPointLightfragmentShader = this.shaders.getShaderFromVar(this.gl, LE.ShaderLib.RADIAL_LIGHT_FRAG, "Frag");
    var colourFragmentShader = this.shaders.getShaderFromVar(this.gl, LE.ShaderLib.COLOUR_FRAG, "Frag");
    var textureFragmentShader = this.shaders.getShaderFromVar(this.gl, LE.ShaderLib.TEXTURE_FRAG, "Frag");
    var textureVertexShader = this.shaders.getShaderFromVar(this.gl, LE.ShaderLib.TEXTURE_VERT, "Vert");
    // Create Shader Programs
    this.shaders.list.push(new LE.Shader('PrimaryPointLightShader', this.shaders.createShader(this.gl, false, vertexShader, pointLightfragmentShader)));
    this.shaders.list.push(new LE.Shader('SecondaryPointLightShader', this.shaders.createShader(this.gl, false, vertexShader, pointLightfragmentShader2)));
    this.shaders.list.push(new LE.Shader('RadialPointLightShader', this.shaders.createShader(this.gl, false, vertexShader, radialPointLightfragmentShader)));
    this.shaders.list.push(new LE.Shader('PolygonShader', this.shaders.createShader(this.gl, false, vertexShader, colourFragmentShader)));
    this.shaders.list.push(new LE.Shader('TextureShader', this.shaders.createShader(this.gl, true, textureVertexShader, textureFragmentShader)));
    this.shaders.setCurrentShader(this.gl, this.shaders.list[0].program);
};

/**
 * Prepares WebGL for rendering
 *
 * @method prepareGL
 * @private
 */
LE.WebGLRenderer.prototype.prepareGL = function() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
    this.camera.ortho(-this.gl.viewportRatio, this.gl.viewportRatio, -1.0, 1.0, 0.1, 100.0);
    this.camera.identity(this.camera.mvMatrix);
    this.camera.translate(-this.gl.viewportRatio, -1.0, -1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    // Makes drawing clockwise
    this.gl.frontFace(this.gl.CW);
    this.gl.enable(this.gl.STENCIL_TEST);
};

/**
 * Sets projection and model view matrix uniforms
 *
 * @method setMatrixUniforms
 * @param {Object} shaderProgram
 * @private
 */
LE.WebGLRenderer.prototype.setMatrixUniforms = function(shaderProgram) {
    this.gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, this.camera.pMatrix);
    this.gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, this.camera.mvMatrix);
};

/**
 * Sets the clear colour of the canvas
 *
 * @method setClearColour
 * @param {Number} r Red
 * @param {Number} g Green
 * @param {Number} b Blue
 * @param {Number} a Alpha
 */
LE.WebGLRenderer.prototype.setClearColour = function(r, g, b, a) {
    this.gl.clearColor(r / 255, g / 255, b / 255, a / 255);
};

/**
 * Clears the canvas element
 *
 * @method clear
 */
LE.WebGLRenderer.prototype.clear = function() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
};

/**
 * Wraps on top of the camera translation function
 *
 * @method translate
 * @param {Number} x
 * @param {Number} y
 * @param {Number} rotation
 * @private
 */
LE.WebGLRenderer.prototype.translate = function(x, y, rotation) {
    this.camera.translate(LE.Utilities.toMatrix(this.gl, x, true), LE.Utilities.toMatrix(this.gl, y, false), 0.0);
};

/**
 * Resizes the canvas element and the WebGL viewport
 *
 * @method resize
 * @param {Number} width Resize width
 * @param {Number} height Resize height
 */
LE.WebGLRenderer.prototype.resize = function(width, height) {
    if(width != canvas.width || height != canvas.height) {
        canvas.width = width;
        canvas.height = height;
        this.camera.translate(+this.gl.viewportRatio, +1.0 , +1.0)
        this.gl.viewportWidth = width;
        this.gl.viewportHeight = height;
        this.gl.viewportRatio = width / height;
        this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
        this.camera.ortho(-this.gl.viewportRatio, this.gl.viewportRatio, -1.0, 1.0, 0.1, 100.0);
        this.camera.translate(-this.gl.viewportRatio , -1.0 , -1.0);
        this.scene.initBuffers();
    }
};

/**
 * Renders the objects and lights in the scene to the canvas element
 *
 * @method render
 */
LE.WebGLRenderer.prototype.render = function() {
    this.renderObjects();
    this.renderShadowObjects();
    this.renderLightsAndShadows();
};

/**
 * Renders the objects in the scene to the canvas element. This should not be called if the render function is being called. 
 * This is simply here so each part of the scene can be rendered separately if needed
 *
 * @method renderObjects
 */
LE.WebGLRenderer.prototype.renderObjects = function() {
    this.translate(-this.camera.x, -this.camera.y);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    for(var o = 0; o < this.scene.objects.length; o++) {
        var size = LE.Utilities.sizeFromVerts(this.scene.objects[o].vertices);
        if(LE.Utilities.checkScreenBounds(this.camera.x, this.camera.y, this.gl.viewportWidth, this.gl.viewportHeight,
            size.width, size.height, this.scene.objects[o].x, this.scene.objects[o].y)) {
            if(this.scene.objects[o] instanceof LE.Texture) {
                this.renderTextureObject(this.scene.objects, o); 
            } else {
                this.renderObject(this.scene.objects, o); 
            }
        }
    }
    this.translate(this.camera.x, this.camera.y);
};

/**
 * Renders the shadow objects in the scene to the canvas element. This should not be called if the render function is being called. 
 * This is simply here so each part of the scene can be rendered separately if needed
 *
 * @method renderShadowObjects
 */
LE.WebGLRenderer.prototype.renderShadowObjects = function() {
    this.translate(-this.camera.x, -this.camera.y);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    for(var so = 0; so < this.scene.shadowObjects.length; so++) {
        var size = LE.Utilities.sizeFromVerts(this.scene.shadowObjects[so].vertices);
        if(LE.Utilities.checkScreenBounds(this.camera.x, this.camera.y, this.gl.viewportWidth, this.gl.viewportHeight,
            size.width, size.height, this.scene.shadowObjects[so].x, this.scene.shadowObjects[so].y)) {
            if(this.scene.shadowObjects[so] instanceof LE.Texture) {
                this.renderTextureObject(this.scene.shadowObjects, so); 
            } else {
                this.renderObject(this.scene.shadowObjects, so); 
            }
        }
    }
    this.translate(this.camera.x, this.camera.y);
};
  
/**
 * Renders the lights and shadows in the scene to the canvas element. This should not be called if the render function is being called. 
 * This is simply here so each part of the scene can be rendered separately if needed
 *
 * @method renderLightsAndShadows
 */  
LE.WebGLRenderer.prototype.renderLightsAndShadows = function() {
    this.translate(-this.camera.x, -this.camera.y);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    if(this.pointLightShaderSelected == true) {
        this.shaders.setCurrentShader(this.gl, this.shaders.list[0].program);
    } else {
        this.shaders.setCurrentShader(this.gl, this.shaders.list[1].program);
    }
    this.gl.enable(this.gl.STENCIL_TEST);
    this.gl.depthMask(false);
    for(var l = 0; l < this.scene.lights.length; l++) {  
        var theVertices = [];       
        this.gl.stencilOp(this.gl.KEEP, this.gl.KEEP, this.gl.REPLACE);
        this.gl.stencilFunc(this.gl.ALWAYS, 1, 1);
        this.gl.colorMask(false, false, false, false);
        var foreStart = 0;
        if(this.scene.lights[l].polygonIndex != null) {
            foreStart = this.scene.lights[l].polygonIndex;
        }
        if(LE.Utilities.checkScreenBounds(this.camera.x, this.camera.y, this.gl.viewportWidth, this.gl.viewportHeight, 500, 500, this.scene.lights[l].x, this.scene.lights[l].y)) {
            for(var so = foreStart; so < this.scene.shadowObjects.length; so++) {
                if(so > foreStart && this.scene.lights[l].polygonIndex != null) {
                    break;
                }
                var r1, r2, bb, cc, d;
                if(this.scene.lights[l].type === LE.Lights.RADIAL_POINT_LIGHT) {
                    var size = LE.Utilities.sizeFromVerts(this.scene.shadowObjects[so].vertices);
                    r1 = this.scene.lights[l].radius + size.width + size.height;
                    r2 = 1;
                    bb = (this.scene.lights[l].x) - (this.scene.shadowObjects[so].x + size.width / 2);
                    bb = bb * bb;
                    cc = (this.scene.lights[l].y) - (this.scene.shadowObjects[so].y + size.height / 2);
                    cc = cc * cc;
                    d = Math.sqrt(bb + cc);
                } else {
                    r1 = 1;
                    r2 = 1;
                    d = 1;
                }

                if(r1 + r2 > d) {
                    // This could be a performance hit but means the engine doesnt need to check for changed positions
                    // and rotations.
                    var vertices = [];
                    for(var i = 0; i < this.scene.shadowObjects[so].vertices.length; i++) {
                        vertices.push({x: this.scene.shadowObjects[so].vertices[i].x + this.scene.shadowObjects[so].x,
                                       y: this.scene.shadowObjects[so].vertices[i].y + this.scene.shadowObjects[so].y});
                    }
                    // Performance hit end
                    for(var v = 0; v < vertices.length; v++) {
                        var currentVertex = vertices[v];
                        var nextVertex = vertices[(v + 1) % vertices.length]; 
                        var edge = LE.Vector2.sub(nextVertex, currentVertex);
                        var normal = {
                            // Inverting these can allow/stop block blending
                            x: edge.y,
                            y: -edge.x
                        }
                        var lightLocation = {x: this.scene.lights[l].x, y: this.scene.lights[l].y};
                        var lightToCurrent = LE.Vector2.sub(currentVertex, lightLocation);
                        if(LE.Vector2.dot(normal, lightToCurrent) > 0) {
                            var point1 = LE.Vector2.add(currentVertex, LE.Vector2.scale(500, LE.Vector2.sub(currentVertex, lightLocation)));
                            var point2 = LE.Vector2.add(nextVertex, LE.Vector2.scale(500, LE.Vector2.sub(nextVertex, lightLocation)));
                            // Manual vertToMatrix conversion. Because this is called thousands of times a function call slows it down.
                            theVertices.push(
                                // Triangle 1
                                point1.x / this.gl.viewportWidth * this.gl.viewportRatio * 2, point1.y / this.gl.viewportHeight * 2,  0.0,
                                currentVertex.x / this.gl.viewportWidth * this.gl.viewportRatio * 2, currentVertex.y / this.gl.viewportHeight * 2, 0.0,
                                point2.x / this.gl.viewportWidth * this.gl.viewportRatio * 2, point2.y / this.gl.viewportHeight * 2,  0.0,
                                // Triangle 2
                                currentVertex.x / this.gl.viewportWidth * this.gl.viewportRatio * 2, currentVertex.y / this.gl.viewportHeight * 2, 0.0,
                                point2.x / this.gl.viewportWidth * this.gl.viewportRatio * 2, point2.y / this.gl.viewportHeight * 2,  0.0,
                                nextVertex.x / this.gl.viewportWidth * this.gl.viewportRatio * 2, nextVertex.y / this.gl.viewportHeight * 2,  0.0   );
                        }
                    } 
                }
            }

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.scene.shadowBuffers[0]);

            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(theVertices), this.gl.DYNAMIC_DRAW);
            this.scene.shadowBuffers[0].itemSize = 3;
            this.scene.shadowBuffers[0].numItems = theVertices.length / 3;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.scene.shadowBuffers[0]);
            this.gl.vertexAttribPointer(this.shaders.selected.vertexPositionAttribute, this.scene.shadowBuffers[0].itemSize, this.gl.FLOAT, false, 0, 0);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.scene.shadowColourBuffers[0]);
            this.gl.vertexAttribPointer(this.shaders.selected.vertexColorAttribute, this.scene.shadowColourBuffers[0].itemSize, this.gl.FLOAT, false, 0, 0);
            this.setMatrixUniforms(this.shaders.selected); 
            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.scene.shadowBuffers[0].numItems);
        }
        // Lights get rendered here
        this.gl.colorMask(true, true, true, true);
        if(LE.Utilities.checkScreenBounds(this.camera.x, this.camera.y, this.gl.viewportWidth, this.gl.viewportHeight, 500, 500, this.scene.lights[l].x, this.scene.lights[l].y)) {

            this.gl.stencilOp(this.gl.KEEP, this.gl.KEEP, this.gl.KEEP);
            this.gl.stencilFunc(this.gl.EQUAL, 0, 1);

            this.shaders.setCurrentShader(this.gl, this.shaders.list[this.scene.lights[l].shader].program);

            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(this.gl.ONE, this.gl.ONE); 
            this.gl.uniform2f(this.gl.getUniformLocation(this.shaders.selected, "lightLocation"), this.scene.lights[l].x - this.camera.x, this.scene.lights[l].y - this.camera.y);
            this.gl.uniform3f(this.gl.getUniformLocation(this.shaders.selected, "lightColor"), this.scene.lights[l].colour.r * this.scene.lights[l].intensity, this.scene.lights[l].colour.g * this.scene.lights[l].intensity, this.scene.lights[l].colour.b * this.scene.lights[l].intensity);
            if(this.scene.lights[l].radius != null) {
                this.gl.uniform1f(this.gl.getUniformLocation(this.shaders.selected, "radius"), this.scene.lights[l].radius);
            }

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.scene.lightBuffers[this.scene.lights[l].bufferIndex]);      
            this.gl.vertexAttribPointer(this.shaders.selected.vertexColorAttribute, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.vertexAttribPointer(this.shaders.selected.vertexPositionAttribute, this.scene.lightBuffers[this.scene.lights[l].bufferIndex].itemSize, this.gl.FLOAT, false, 0, 0);
            var matrixPos = LE.Utilities.vertToMatrix(this.gl, this.scene.lights[l].x, this.scene.lights[l].y);
            //mat4.translate(this.mvMatrix, this.mvMatrix, [matrixPos.x, matrixPos.y, 0.0]);
            this.camera.translate(matrixPos.x, matrixPos.y, 0.0);
            this.camera.mvPushMatrix();
            if(this.scene.lights[l].rotation != null) {
                this.camera.rotate(LE.Utilities.degToRad(this.scene.lights[l].rotation), 0, 0, 1);
                //mat4.rotate(this.mvMatrix, this.mvMatrix, LE.Utilities.degToRad(this.scene.lights[l].rotation), [0, 0, 1]); 
            }
            this.setMatrixUniforms(this.shaders.selected);
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.scene.lightBuffers[this.scene.lights[l].bufferIndex].numItems);
            this.camera.mvPopMatrix();
            this.camera.translate(-matrixPos.x, -matrixPos.y, 0.0);
            //mat4.translate(this.mvMatrix, this.mvMatrix, [-matrixPos.x, -matrixPos.y, 0.0]);
            this.gl.disable(this.gl.BLEND);
            this.gl.clear(this.gl.STENCIL_BUFFER_BIT); 
        }
    }
    this.translate(this.camera.x, this.camera.y);
};

/**
 * Renders a single texture object
 *
 * @method renderTextureObject
 * @param {Array} array
 * @param {Number} i Index in the given array
 * @private
 */
LE.WebGLRenderer.prototype.renderTextureObject = function(array, i) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.scene.objectBuffers[array[i].bufferIndex]);
    this.gl.vertexAttribPointer(this.shaders.selected.vertexPositionAttribute, this.scene.objectBuffers[array[i].bufferIndex].itemSize, this.gl.FLOAT, false, 0, 0);

    // Support transparent textures
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.enable(this.gl.BLEND);
    this.shaders.setCurrentShader(this.gl, this.shaders.list[4].program);
    // Need to handle ambient light code
    this.gl.uniform4f(this.gl.getUniformLocation(this.shaders.selected, "ambientLight"), this.scene.ambientLight.colour.r / 255, this.scene.ambientLight.colour.g / 255, this.scene.ambientLight.colour.b / 255, this.scene.ambientLight.colour.a / 255);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.scene.objectTextureBuffers[array[i].bufferIndex]);
    this.gl.vertexAttribPointer(this.shaders.selected.textureCoordAttribute, this.scene.objectTextureBuffers[array[i].bufferIndex].itemSize, this.gl.FLOAT, false, 0, 0);
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.scene.textures[array[i].textureIndex]);
    this.gl.uniform1i(this.shaders.selected.samplerUniform, 0); 
    var matrixPos = LE.Utilities.vertToMatrix(this.gl, array[i].x, array[i].y);
    var cp = LE.Utilities.vertToMatrix(this.gl, array[i].centerPoint.x, array[i].centerPoint.y);
    this.camera.translate(matrixPos.x, matrixPos.y, 0.0);
    this.camera.mvPushMatrix();
    // Move matrix to center of shape
    this.camera.translate(cp.x, cp.y, 0.0);
    this.camera.rotate(LE.Utilities.degToRad(array[i].rotation), 0, 0, 1);
    this.camera.translate(-cp.x, -cp.y, 0.0);
    this.setMatrixUniforms(this.shaders.selected); 

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.scene.objectBuffers[array[i].bufferIndex].numItems);
    this.camera.mvPopMatrix();
    this.camera.translate(-matrixPos.x, -matrixPos.y, 0.0);
    this.gl.disable(this.gl.BLEND);
}

/**
 * Renders a single object
 *
 * @method renderObject
 * @param {Array} array
 * @param {Number} i Index in the given array
 * @private
 */
LE.WebGLRenderer.prototype.renderObject = function(array, i) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.scene.objectBuffers[array[i].bufferIndex]);
    this.gl.vertexAttribPointer(this.shaders.selected.vertexPositionAttribute, this.scene.objectBuffers[array[i].bufferIndex].itemSize, this.gl.FLOAT, false, 0, 0);

    this.shaders.setCurrentShader(this.gl, this.shaders.list[3].program);
    // Need to handle ambient light code
    this.gl.uniform4f(this.gl.getUniformLocation(this.shaders.selected, "ambientLight"), this.scene.ambientLight.colour.r / 250, this.scene.ambientLight.colour.g / 255, this.scene.ambientLight.colour.b / 255, this.scene.ambientLight.colour.a / 255);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.scene.objectColourBuffers[array[i].bufferIndex]);
    this.gl.vertexAttribPointer(this.shaders.selected.vertexColorAttribute, this.scene.objectColourBuffers[array[i].bufferIndex].itemSize, this.gl.FLOAT, false, 0, 0);
    var matrixPos = LE.Utilities.vertToMatrix(this.gl, array[i].x, array[i].y);
    var cp = LE.Utilities.vertToMatrix(this.gl, array[i].centerPoint.x, array[i].centerPoint.y);
    this.camera.translate(matrixPos.x, matrixPos.y, 0.0);
    this.camera.mvPushMatrix();
    // Move matrix to center of shape
    this.camera.translate(cp.x, cp.y, 0.0);
    this.camera.rotate(LE.Utilities.degToRad(array[i].rotation), 0, 0, 1);
    this.camera.translate(-cp.x, -cp.y, 0.0);

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.scene.objectIndexBuffers[array[i].bufferIndex]);
    this.setMatrixUniforms(this.shaders.selected);  
    this.gl.drawElements(this.gl.TRIANGLES, this.scene.objectIndexBuffers[array[i].bufferIndex].numItems, this.gl.UNSIGNED_SHORT, 0);

    this.camera.mvPopMatrix();
    this.camera.translate(-matrixPos.x, -matrixPos.y, 0.0);
    this.gl.disable(this.gl.BLEND);
};
