var time =  new Date().getTime();
var fpsCount = 0;
var fps = 0;
var logFPS = true;

function Light(x, y, rotation, type, red, green, blue, intensity, radius) {
    this.location = {
        x : x,
        y : y
    },
    this.rotation = rotation,
    this.radius = radius,
    this.type = type,
    this.bufferIndex,
    this.red = red,
    this.green = green,
    this.blue = blue,
    this.intensity = intensity,
    this.setPosition = function(x, y) {
        this.location.x = x;
        this.location.y = y;
    },
    this.setRotation = function(angle) {
        this.rotation = angle;
    },
    this.setRadius = function(radius) {
        if(this.type == "point" || this.type == "directional") {
            console.log("Note: Settings the radius of a point or directional light will not affect it.");
        } else {
            this.radius = radius;
        }
    }
}

function Polygon(x, y, faceSize, vertices, shadowVertices, textureURL) {
    this.x = x,
    this.y = y,
    this.rotation = 0,
    this.faceSize = faceSize,
    this.vertices = vertices,
    this.shadowVertices = shadowVertices,
    this.bufferIndex,
    this.textureURL = textureURL,
    this.textureIndex,
    this.getVertices = function() {
        return this.shadowVertices; 
    },
    this.setRotation = function(angle) {
        if(this.rotation != angle) {
            this.rotation = angle;
            var a = degToRad(this.rotation);
            for(var i = 0; i < shadowVertices.length; i++) {
                var px = this.x + this.vertices[i].x;
                var py = this.y + this.vertices[i].y;
                if(this.textureURL == null) {
                    var ox = (this.x);
                    var oy = (this.y); 
                } else {
                    var ox = (this.x + this.faceSize / 2);
                    var oy = (this.y + this.faceSize / 2); 
                }
                var x = Math.cos(a) * (px-ox) - Math.sin(a) * (py - oy) + ox;
                var y = Math.sin(a) * (px-ox) + Math.cos(a) * (py - oy) + oy;
                this.shadowVertices[i].x = x;
                this.shadowVertices[i].y = y;
            } 
        }
    }
}


function LightingEngine(canvas) {
    this.gl,
    this.canvas = canvas,
    this.mvMatrix = mat4.create(),
    this.pMatrix = mat4.create(),
    this.mvMatrixStack = [],
    this.currentProgram,
    this.shaderProgram,
    this.shaderProgram2,
    this.spotLightShaderProgram,
    this.textureShaderProgram,
    this.foreground = [],
    this.background = [],
    this.ambientLight = {
        r: 255, g: 255, b: 255, a: 255
    },
    this.lights = [],
    this.lightColour = {
        r: 255, g: 255, b: 255
    },
    this.lightIntensity = 40,
    this.colourSpectrum = [],
    this.colourIndex = 0,
    this.objectBuffers = [],
    this.objectColourBuffers = [],
    this.objectTextureBuffers = [],
    this.lightBuffers = [],
    this.shadowBuffers = [],
    this.shadowColourBuffers = [],
    this.textures = [],
    this.initialized = false,
    this.init = function() {
        this.initGL();
        this.initShaders();
        this.initBuffers();
        this.initTextures();
        this.prepareGL();
        this.initialized = true;
    },
    this.initGL = function() {
        try {
            this.gl = this.canvas.getContext("webgl", {stencil:true});
            this.gl.viewportWidth = canvas.width;
            this.gl.viewportHeight = canvas.height;
            this.gl.viewportRatio = canvas.width / canvas.height;
        } catch(e) {
        }
        if (!this.gl) {
            alert("Could not initialise WebGL, sorry :-( ");
        }
    },
    this.initShaders = function() {
        var pointLightfragmentShader = this.getShaderFromVar(this.gl, pointLightFragShader, "Frag");
        var vertexShader = this.getShaderFromVar(this.gl, mainVertShader, "Vert");
        var spotLightfragmentShader = this.getShaderFromVar(this.gl, spotLightFragShader, "Frag");
        var colourFragmentShader = this.getShaderFromVar(this.gl, colourFragShader, "Frag");
        var textureVertexShader = this.getShaderFromVar(this.gl, textureFragShader, "Frag");
        var textureFragmentShader = this.getShaderFromVar(this.gl, textureVertShader, "Vert");
        this.shaderProgram = this.createShader(this.shaderProgram, false, vertexShader, pointLightfragmentShader);
        this.shaderProgram2 = this.createShader(this.shaderProgram2, false, vertexShader, colourFragmentShader);
        this.spotLightShaderProgram = this.createShader(this.spotLightShaderProgram, false, vertexShader, spotLightfragmentShader);
        this.textureShaderProgram = this.createShader(this.textureShaderProgram, true, textureVertexShader, textureFragmentShader);
        this.setCurrentShaderProgram(this.shaderProgram);
    },
    this.initBuffers = function() {
        for(var f = 0; f < this.foreground.length; f++) {
            this.initPolygonBuffer(this.foreground, f);
        }

        for(var b = 0; b < this.background.length; b++) {
            this.initPolygonBuffer(this.background, b);
        }

        this.shadowColourBuffers[0] = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.shadowColourBuffers[0]);
        colors = []

        // This number should not be fixed. TEMPORARY
        for (var i=0; i < 3000; i++) {
          colors = colors.concat([1.0, 1.0, 1.0, 0.5]);
        }
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
        this.shadowColourBuffers[0].itemSize = 4;
        this.shadowColourBuffers[0].numItems = 3000;

        this.shadowBuffers[0] = this.gl.createBuffer();

        for(var l = 0; l < this.lights.length; l++) {
            this.initLightBuffer(this.lights, l);
        }
    },
    this.initPolygonBuffer = function(array, i) {
        for(var ii = i; ii >= 0; ii--) {
            if(array[i] != array[ii] && array[i].vertices.length == array[ii].vertices.length &&
                array[i].faceSize == array[ii].faceSize) {
                array[i].bufferIndex = array[ii].bufferIndex;
            } else if(ii == 0) {
                array[i].bufferIndex = this.objectBuffers.length;

                this.objectBuffers[this.objectBuffers.length] = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.objectBuffers[array[i].bufferIndex]);

                var vertices = [];

                if(array[i].textureURL != null) {
                    vertices = [
                        this.convertToMatrix(array[i].faceSize, true), this.convertToMatrix(array[i].faceSize, false),  0.0,
                        0,  this.convertToMatrix(array[i].faceSize, false),  0.0,
                        this.convertToMatrix(array[i].faceSize, true), 0,  0.0,
                        0, 0,  0.0,
                    ];
                    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

                } else {
                    for(var v = 0; v < array[i].vertices.length; v++) {
                        vertices.push(this.convertToMatrix(array[i].vertices[v].x, true), 
                        this.convertToMatrix(array[i].vertices[v].y, false),
                        0.0);

                        if(v % 3 == 1) {
                            vertices.push(0.0, 0.0, 0.0); 
                        }
                    }
                    var validation = [7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52];
                    for(var val = 0; val < validation.length; val++) {
                        if(array[i].vertices.length == validation[val]) {
                            vertices.push(0.0, 0.0, 0.0); 
                            break; 
                        }
                    }

                    vertices.push(this.convertToMatrix(array[i].vertices[0].x, true));
                    vertices.push(this.convertToMatrix(array[i].vertices[0].y, false));
                    vertices.push(0.0); 

                    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
                }

                this.objectBuffers[array[i].bufferIndex].itemSize = 3;
                this.objectBuffers[array[i].bufferIndex].numItems = vertices.length / 3;  

                // Color vertices
                if(array[i].textureURL == null) {
                    this.objectColourBuffers[array[i].bufferIndex] = this.gl.createBuffer();
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.objectColourBuffers[array[i].bufferIndex]);
                    colors = [];
                    for (var c = 0; c < vertices.length; c++) {
                      colors = colors.concat([0.1, 0.1, 0.1, 1.0]);
                    }
                    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
                    this.objectColourBuffers[array[i].bufferIndex].itemSize = 4;
                    this.objectColourBuffers[array[i].bufferIndex].numItems = vertices.length / 3;
                } else {
                    this.objectTextureBuffers[array[i].bufferIndex] = this.gl.createBuffer();
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.objectTextureBuffers[array[i].bufferIndex]);
                    var textureCoords = [
                        1.0, 1.0,
                        0.0, 1.0,
                        1.0, 0.0, 
                        0.0, 0.0,
                    ];
                    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureCoords), this.gl.STATIC_DRAW);
                    this.objectTextureBuffers[array[i].bufferIndex].itemSize = 2;
                    this.objectTextureBuffers[array[i].bufferIndex].numItems = 4;
                }
            }
        }
    },
    this.initTextures = function() {
        for(var f = 0; f < this.foreground.length; f++) {
            if(this.foreground[f].textureURL != null) {
                this.assignTextureIndices(this.foreground, f);  
            }
        }

        for(var b = 0; b < this.background.length; b++) {
            if(this.background[b].textureURL != null) {
                this.assignTextureIndices(this.background, b);
            }
        }
    },
    this.assignTextureIndices = function(array, i) {
        var self = this;
        var createNew = true;
        for(var t = 0; t < this.textures.length; t++) {
            // Required for the equals check bellow
            var temp = this.gl.createTexture();
            temp.image = new Image();
            temp.image.src = array[i].textureURL;
            //
            if(temp.image.src == this.textures[t].image.src) {
                array[i].textureIndex = t;
                createNew = false;
                break;
            }
        }
        if(createNew == true) {
            var texture = this.gl.createTexture();
            this.textures.push(texture);
            this.textures[this.textures.length -1].image = new Image();
            this.textures[this.textures.length -1].image.onload = function() {
                for(var i = 0; i < self.textures.length; i++) {
                    if(self.textures[i].hasLoaded == false) {
                        self.handleLoadedTexture(self.textures[i]);
                        break; 
                    } 
                }
            }
            this.textures[this.textures.length -1].image.src = array[i].textureURL; 
            this.textures[this.textures.length -1].hasLoaded = false;
            array[i].textureIndex = this.textures.length -1;
        }
    },
    this.handleLoadedTexture = function(texture) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, texture.image);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        texture.hasLoaded = true;
    },
    this.initLightBuffer = function(array, i) {
        for(var ii = i; ii >= 0; ii--) {
            if(array[i] != array[ii] && array[i].type == array[ii].type) {
                array[i].bufferIndex = array[ii].bufferIndex;
            } else if(ii == 0) {
                array[i].bufferIndex = this.lightBuffers.length;
                this.lightBuffers[this.lightBuffers.length] = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.lightBuffers[array[i].bufferIndex]);

                if(array[i].type == "point" || array[i].type == "spot") {
                    vertices = [
                        this.convertToMatrix(this.gl.viewportWidth, true), this.convertToMatrix(this.gl.viewportHeight,false),  0.0,
                        this.convertToMatrix(-this.gl.viewportWidth, true), this.convertToMatrix(this.gl.viewportHeight, false),  0.0,
                        this.convertToMatrix(this.gl.viewportWidth, true), this.convertToMatrix(-this.gl.viewportHeight, false),  0.0,
                        this.convertToMatrix(-this.gl.viewportWidth, true), this.convertToMatrix(-this.gl.viewportHeight, false),  0.0
                    ];

                    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.DYNAMIC_DRAW);

                    this.lightBuffers[array[i].bufferIndex].itemSize = 3;
                    this.lightBuffers[array[i].bufferIndex].numItems = 4;  
                } else if(array[i].type == "directional") {
                    vertices = [
                        0, 0,  0.0,
                        this.convertToMatrix(this.gl.viewportWidth, true), this.convertToMatrix(this.gl.viewportHeight, false),  0.0,
                        this.convertToMatrix(this.gl.viewportWidth, true), this.convertToMatrix(-this.gl.viewportHeight, false),  0.0,
                    ];

                    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.DYNAMIC_DRAW);

                    this.lightBuffers[array[i].bufferIndex].itemSize = 3;
                    this.lightBuffers[array[i].bufferIndex].numItems = 3;  
                }
            }
        }
    },
    this.prepareGL = function() {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
        mat4.ortho(this.pMatrix, -this.gl.viewportRatio, this.gl.viewportRatio, -1.0, 1.0, 0.1, 100.0);
        mat4.identity(this.mvMatrix);
        mat4.translate(this.mvMatrix, this.mvMatrix, [-this.gl.viewportRatio , -1.0 , -1.0]);
        this.gl.enable(this.gl.DEPTH_TEST);
/*        This.gl.frontFace(this.gl.CW);
        this.gl.enable(this.gl.CULL_FACE);*/
        this.gl.enable(this.gl.STENCIL_TEST);
    },
    this.setMatrixUniforms = function(shaderProgram) {
        this.gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, this.pMatrix);
        this.gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, this.mvMatrix);
    },
    this.update = function() {
        fpsCount++;
        if(new Date().getTime() > time + 1000) {
            time += 1000;
            fps = fpsCount;
            fpsCount = 0;
            if(logFPS == true) {
                console.log("FPS: " + fps);
                console.log("# of Lights: " + this.lights.length);
                console.log("----------------");   
            }
        }
    },
    this.render = function() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        for(var b = 0; b < this.background.length; b++) {
            this.renderObject(this.background, b);
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        this.setCurrentShaderProgram(this.shaderProgram);
        this.gl.enable(this.gl.STENCIL_TEST);
        for(var l = 0; l < this.lights.length; l++) {  
            var theVertices = [];       
            this.gl.stencilOp(this.gl.KEEP, this.gl.KEEP, this.gl.REPLACE);
            this.gl.stencilFunc(this.gl.ALWAYS, 1, 1);
            this.gl.colorMask(false, false, false, false);
            this.gl.depthMask(false);
            for(var f = 0; f < this.foreground.length; f++) {
                var vertices = this.foreground[f].getVertices();
                for(var v = 0; v < vertices.length; v++) {
                    var currentVertex = vertices[v];
                    var nextVertex = vertices[(v + 1) % vertices.length]; 
                    var edge = Vector2f.sub(nextVertex, currentVertex);
                    var normal = {
                        // Inverting these can allow/stop block blending
                        x: -edge.y,
                        y: edge.x
                    }

                    var lightToCurrent = Vector2f.sub(currentVertex, this.lights[l].location);
                    if(Vector2f.dot(normal, lightToCurrent) > 0) {
                        var point1 = Vector2f.add(currentVertex, scale(500, Vector2f.sub(currentVertex, this.lights[l].location)));
                        var point2 = Vector2f.add(nextVertex, scale(500, Vector2f.sub(nextVertex, this.lights[l].location)));

                        theVertices.push(
                            // Triangle 1
                            this.convertToMatrix(point1.x, true), this.convertToMatrix(point1.y, false),  0.0,
                            this.convertToMatrix(currentVertex.x, true), this.convertToMatrix(currentVertex.y, false), 0.0,
                            this.convertToMatrix(point2.x, true), this.convertToMatrix(point2.y, false),  0.0,
                            // Triangle 2
                            this.convertToMatrix(currentVertex.x, true), this.convertToMatrix(currentVertex.y, false), 0.0,
                            this.convertToMatrix(point2.x, true), this.convertToMatrix(point2.y, false),  0.0,
                            this.convertToMatrix(nextVertex.x, true), this.convertToMatrix(nextVertex.y, false),  0.0   );
                    }
                }
            }
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.shadowBuffers[0]);

            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(theVertices), this.gl.DYNAMIC_DRAW);
            this.shadowBuffers[0].itemSize = 3;
            this.shadowBuffers[0].numItems = theVertices.length / 3;

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.shadowBuffers[0]);
            this.gl.vertexAttribPointer(this.currentProgram.vertexPositionAttribute, this.shadowBuffers[0].itemSize, this.gl.FLOAT, false, 0, 0);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.shadowColourBuffers[0]);
            this.gl.vertexAttribPointer(this.currentProgram.vertexColorAttribute, this.shadowColourBuffers[0].itemSize, this.gl.FLOAT, false, 0, 0);
            this.setMatrixUniforms(this.currentProgram); 
            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.shadowBuffers[0].numItems);

            this.gl.colorMask(true, true, true, true);
            this.gl.stencilOp(this.gl.KEEP, this.gl.KEEP, this.gl.KEEP);
            this.gl.stencilFunc(this.gl.EQUAL, 0, 1);
            if(this.lights[l].type == "point") {
                this.setCurrentShaderProgram(this.shaderProgram);
            } else if(this.lights[l].type == "spot") {
                this.setCurrentShaderProgram(this.spotLightShaderProgram);
            } 
            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(this.gl.ONE, this.gl.ONE); 
            this.gl.uniform2f(this.gl.getUniformLocation(this.currentProgram, "lightLocation"), this.lights[l].location.x, this.lights[l].location.y);
            this.gl.uniform3f(this.gl.getUniformLocation(this.currentProgram, "lightColor"), this.lights[l].red / this.lights[l].intensity, this.lights[l].green / this.lights[l].intensity, this.lights[l].blue / this.lights[l].intensity);
            if(this.lights[l].radius != null) {
                this.gl.uniform1f(this.gl.getUniformLocation(this.currentProgram, "radius"), this.lights[l].radius);
            }
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.lightBuffers[this.lights[l].bufferIndex]);
            this.gl.vertexAttribPointer(this.currentProgram.vertexPositionAttribute, this.lightBuffers[this.lights[l].bufferIndex].itemSize, this.gl.FLOAT, false, 0, 0);
            var matrixPos = this.convertVertToMatrix(this.lights[l].location.x, this.lights[l].location.y);
            mat4.translate(this.mvMatrix, this.mvMatrix, [matrixPos.x, matrixPos.y, 0.0]);
            this.mvPushMatrix();
            mat4.rotate(this.mvMatrix, this.mvMatrix, degToRad(this.lights[l].rotation), [0, 0, 1]); 
            this.setMatrixUniforms(this.currentProgram);
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.lightBuffers[this.lights[l].bufferIndex].numItems);
            this.mvPopMatrix();
            mat4.translate(this.mvMatrix, this.mvMatrix, [-matrixPos.x, -matrixPos.y, 0.0]);
            this.gl.disable(this.gl.BLEND);
            /*gl.useProgram(0);*/
            this.gl.clear(this.gl.STENCIL_BUFFER_BIT);       
        }

        for(var f = 0; f < this.foreground.length; f++) {
            this.renderObject(this.foreground, f);
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        for(var l = 0; l < this.lights.length; l++) {
            if(this.lights[l].type == "point") {
                this.setCurrentShaderProgram(this.shaderProgram);
            } else if(this.lights[l].type == "spot") {
                this.setCurrentShaderProgram(this.spotLightShaderProgram);
            } 
            this.gl.uniform2f(this.gl.getUniformLocation(this.currentProgram, "lightLocation"), this.lights[l].location.x, this.lights[l].location.y);
            this.gl.uniform3f(this.gl.getUniformLocation(this.currentProgram, "lightColor"), this.lights[l].red / this.lights[l].intensity, this.lights[l].green / this.lights[l].intensity, this.lights[l].blue / this.lights[l].intensity);
            if(this.lights[l].radius != null) {
                this.gl.uniform1f(this.gl.getUniformLocation(this.currentProgram, "radius"), this.lights[l].radius);
            }
            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(this.gl.ONE, this.gl.ONE); 
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.lightBuffers[this.lights[l].bufferIndex]);
            this.gl.vertexAttribPointer(this.currentProgram.vertexPositionAttribute, this.lightBuffers[this.lights[l].bufferIndex].itemSize, this.gl.FLOAT, false, 0, 0);
            var matrixPos = this.convertVertToMatrix(this.lights[l].location.x, this.lights[l].location.y);
            mat4.translate(this.mvMatrix, this.mvMatrix, [matrixPos.x, matrixPos.y, 0.0]);
            this.mvPushMatrix();
            mat4.rotate(this.mvMatrix, this.mvMatrix, degToRad(this.lights[l].rotation), [0, 0, 1]);
            this.setMatrixUniforms(this.currentProgram);
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.lightBuffers[this.lights[l].bufferIndex].numItems);
            this.mvPopMatrix(); 
            mat4.translate(this.mvMatrix, this.mvMatrix, [-matrixPos.x, -matrixPos.y, 0.0]);
        }
        this.gl.disable(this.gl.BLEND);

    },
    this.renderObject = function(array, i) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.objectBuffers[array[i].bufferIndex]);
        this.gl.vertexAttribPointer(this.currentProgram.vertexPositionAttribute, this.objectBuffers[array[i].bufferIndex].itemSize, this.gl.FLOAT, false, 0, 0);

        if(array[i].textureURL == null) {
            this.setCurrentShaderProgram(this.shaderProgram2);
            this.gl.uniform4f(this.gl.getUniformLocation(this.currentProgram, "ambientLight"), this.ambientLight.r / 255, this.ambientLight.g / 255, this.ambientLight.b / 255, this.ambientLight.a / 255);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.objectColourBuffers[array[i].bufferIndex]);
            this.gl.vertexAttribPointer(this.shaderProgram.vertexColorAttribute, this.objectColourBuffers[array[i].bufferIndex].itemSize, this.gl.FLOAT, false, 0, 0);
            var matrixPos = this.convertVertToMatrix(array[i].x, array[i].y);
            mat4.translate(this.mvMatrix, this.mvMatrix, [matrixPos.x, matrixPos.y, 0.0]);
            this.mvPushMatrix();
            mat4.rotate(this.mvMatrix, this.mvMatrix, degToRad(array[i].rotation), [0, 0, 1]);
            this.setMatrixUniforms(this.shaderProgram2);  
        } else {
            this.setCurrentShaderProgram(this.textureShaderProgram);
            this.gl.uniform4f(this.gl.getUniformLocation(this.currentProgram, "ambientLight"), this.ambientLight.r / 255, this.ambientLight.g  / 255, this.ambientLight.b  / 255, this.ambientLight.a  / 255);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.objectTextureBuffers[array[i].bufferIndex]);
            this.gl.vertexAttribPointer(this.currentProgram.textureCoordAttribute, this.objectTextureBuffers[array[i].bufferIndex].itemSize, this.gl.FLOAT, false, 0, 0);
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[array[i].textureIndex]);
            this.gl.uniform1i(this.textureShaderProgram.samplerUniform, 0); 
            var matrixPos = this.convertVertToMatrix(array[i].x, array[i].y);
            var matrixWidth = this.convertToMatrix(array[i].faceSize, true);
            var matrixHeight = this.convertToMatrix(array[i].faceSize, false);
            mat4.translate(this.mvMatrix, this.mvMatrix, [matrixPos.x, matrixPos.y, 0.0]);
            this.mvPushMatrix();
            // Move matrix to center of shape
            mat4.translate(this.mvMatrix, this.mvMatrix, [matrixWidth / 2, matrixHeight / 2, 0.0]);
            mat4.rotate(this.mvMatrix, this.mvMatrix, degToRad(array[i].rotation), [0, 0, 1]);
            mat4.translate(this.mvMatrix, this.mvMatrix, [-matrixWidth / 2, -matrixHeight / 2, 0.0]);
            this.setMatrixUniforms(this.textureShaderProgram); 
        }

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.objectBuffers[array[i].bufferIndex].numItems);
        this.mvPopMatrix();
        mat4.translate(this.mvMatrix, this.mvMatrix, [-matrixPos.x, -matrixPos.y, 0.0]); 
    },
    this.setCurrentShaderProgram = function(shaderProgram) {
        this.gl.useProgram(shaderProgram);
        this.currentProgram = shaderProgram;
    }
    this.createPolygon = function(xPos, yPos, numberOfVertices, faceSize, isForeground) {
        if(numberOfVertices < 3) {
            console.log("Error: To create a polygon it must have at least 3 vertices!");
        } else if(numberOfVertices > 52) {
            console.log("Error: Currently only support polygons with up to 52 vertices.");
        } else {
            var polygonVertices = [];
            for(var i = 0; i < numberOfVertices; i++) {
                polygonVertices.push( { x: (Math.sin(i/numberOfVertices*2*Math.PI) * faceSize), y: (Math.cos(i/numberOfVertices*2*Math.PI) * faceSize)} );
            }
            var shadowVertices = [];
            for(var i = 0; i < numberOfVertices; i++) {
                shadowVertices.push( { x: (Math.sin(i/numberOfVertices*2*Math.PI) * faceSize) + xPos, y: (Math.cos(i/numberOfVertices*2*Math.PI) * faceSize) + yPos } );
            }
            if(isForeground == true) {
                this.foreground.push(new Polygon(xPos, yPos, faceSize, polygonVertices, shadowVertices)); 
            } else if(isForeground == false) {
                this.background.push(new Polygon(xPos, yPos, faceSize, polygonVertices, shadowVertices));
            }

            if(this.initialized == true) {
                if(isForeground == true) {
                    this.initPolygonBuffers(this.foreground, this.foreground.length - 1); 
                } else if(isForeground == false) {
                    this.initPolygonBuffers(this.background, this.background.length - 1); 
                }
            } 
        }
    },
    this.createSquare = function(xPos, yPos, faceSize, textureURL, isForeground) {
        if(isForeground == null) {
            isForeground = false;
        }
        var polygonVertices = [
            {x: 0, y: 0},
            {x: 0, y: faceSize},
            {x: faceSize, y: faceSize},
            {x: faceSize, y: 0}
        ];
        var shadowVertices = [
            // There is a problem here somewhere
            {x: xPos,y: yPos},
            {x: xPos, y: faceSize + yPos},
            {x: faceSize + xPos, y: faceSize + yPos},
            {x: faceSize + xPos, y: yPos}
        ];
        if(isForeground == true) {
            this.foreground.push(new Polygon(xPos, yPos, faceSize, polygonVertices, shadowVertices, textureURL));
        } else if(isForeground == false) {
            this.background.push(new Polygon(xPos, yPos, faceSize, polygonVertices, shadowVertices, textureURL));
        }

        if(this.initialized == true) {
            if(isForeground == true) {
                this.initPolygonBuffer(this.foreground, this.foreground.length - 1); 
                this.assignTextureIndices(this.foreground, this.foreground.length - 1);
            } else {
                this.initPolygonBuffer(this.background, this.background.length - 1); 
                this.assignTextureIndices(this.background, this.background.length - 1); 
            }
        }
    },
    this.getForeground = function(index) {
        if(index >= this.foreground.length) {
            console.log("Error: Cannot get foreground object with index: " + index + ". The maximum possible index is: " + (this.foreground.length - 1));
        } else {
            return this.foreground[index];
        }
    },
    this.getBackground = function(index) {
        if(index >= this.background.length) {
            console.log("Error: Cannot get background object with index: " + index + ". The maximum possible index is: " + (this.background.length - 1));
        } else {
            return this.background[index];
        }
    },
    this.setAmbientLight = function(r, g, b, a) {
        this.ambientLight = {
            r: r, g: g, b: b, a: a
        }
    },
    this.createPointLight = function(x, y) {
/*        this.lights.push(new Light(x, Math.abs(y - this.gl.viewportHeight), Math.random() * 10, Math.random() * 10,Math.random() * 10));*/
        this.lights.push(new Light(x, y, 0, "point", this.lightColour.r, this.lightColour.g, this.lightColour.b, this.lightIntensity));
        if(this.initialized == true) {
            this.initLightBuffer(this.lights, this.lights.length - 1);
        }
    },
    this.createSpotLight = function(x, y, radius) {
        this.lights.push(new Light(x, y, 0, "spot", this.lightColour.r, this.lightColour.g, this.lightColour.b, this.lightIntensity, radius));
        if(this.initialized == true) {
            this.initLightBuffer(this.lights, this.lights.length - 1);
        }
    },
    this.createDirectionalLight = function(x, y, angle) {
        this.lights.push(new Light(x, y, angle, "directional", this.lightColour.r, this.lightColour.g, this.lightColour.b, this.lightIntensity));
        if(this.initialized == true) {
            this.initLightBuffer(this.lights, this.lights.length - 1);
        }
    },
    this.getLight = function(index) {
        if(index >= this.lights.length) {
            console.log("Error: Cannot get light with index: " + index + ". The maximum possible index is: " + (this.lights.length - 1));
        } else {
            return this.lights[index];
        }
    },
    this.setLightColour = function(r, g, b) {
        this.lightColour = {
            r: r, g: g, b: b
        }
    },
    this.setLightIntensity = function(intensity) {
        if(intensity < 0) {
            console.log("Error: Cannot set light intensity bellow '0'.");
        } else {
            this.lightIntensity = intensity;  
        }
    },
    this.setupColourSpectrum = function() {
        var rgbRange = 255;
        var r = rgbRange;
        var g = 0;
        var b = 0;
        // From red to yellow:
        for (var g=0;g<=rgbRange;g++) {
            this.colourSpectrum.push(colour = {r: r, g: g, b : b});
        }
        // From yellow to green:
        for (var r=rgbRange;r>=0;r--) {
            this.colourSpectrum.push(colour = {r: r, g: g, b : b});
        }
        // From green to blue:
        for (var b=0;b<=rgbRange;b++,g--) {
            this.colourSpectrum.push(colour = {r: r, g: g, b : b});
        }
        // From blue to red:
        for (var d=0;d<=rgbRange;d++,b--,r++) {
            this.colourSpectrum.push(colour = {r: r, g: g, b : b});
        }
    },
    this.incrementColourSpectrum = function(incrementAmount) {
        if(incrementAmount == null) {
            this.colourIndex++;
        } else {
            this.colourIndex += incrementAmount; 
        }
        if(this.colourIndex > this.colourSpectrum.length - 1) {
            this.colourIndex = 0;
        }
        this.setLightColour(this.colourSpectrum[this.colourIndex].r, this.colourSpectrum[this.colourIndex].g, this.colourSpectrum[this.colourIndex].b);
    },
    this.decrementColourSpectrum = function(decrementAmount) {
        if(decrementAmount == null) {
            this.colourIndex--;
        } else {
            this.colourIndex -= decrementAmount;  
        }
        if(this.colourIndex < 0) {
            this.colourIndex = this.colourSpectrum.length - 1;
        }
        this.setLightColour(this.colourSpectrum[this.colourIndex].r, this.colourSpectrum[this.colourIndex].g, this.colourSpectrum[this.colourIndex].b);
    },
    this.convertToMatrix = function(value, isWidth) {
        if(isWidth == true) {
            return (value / this.gl.viewportWidth * this.gl.viewportRatio * 2);
        } else {
            return (value / this.gl.viewportHeight * 2);
        }
    },
    this.convertVertToMatrix = function(x, y) {
        return verts = { x: x / this.gl.viewportWidth * this.gl.viewportRatio * 2, y: y / this.gl.viewportHeight * 2 };
    },
    this.getShaderFromHTML = function(gl, id) {
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
            shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = this.gl.createShader(this.gl.VERTEX_SHADER);
        } else {
            return null;
        }
        this.gl.shaderSource(shader, str);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert(this.gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    },
    this.getShaderFromVar = function(gl, shaderSrc, type) {
        var shader;
        if(type == "Vert" || type == "Vertex" || type == "VertexShader") {
            shader = this.gl.createShader(gl.VERTEX_SHADER);  
        } else if(type == "Frag" || type == "Fragment" || type == "FragmentShader") {
            shader = this.gl.createShader(gl.FRAGMENT_SHADER); 
        } else {
            console.log("Error: Cannot get shader. Invalid type provided.");
            return;
        }
        this.gl.shaderSource(shader, shaderSrc);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert(this.gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    },
    this.createShader = function(shaderProgram, isTextureShader, vertexShader, fragmentShader) {
        shaderProgram = this.gl.createProgram();
        this.gl.attachShader(shaderProgram, vertexShader);
        this.gl.attachShader(shaderProgram, fragmentShader);
        this.gl.linkProgram(shaderProgram);
        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            alert("Could not initialise shader: " + shaderProgram);
        }
        this.gl.useProgram(shaderProgram);
        if(isTextureShader == true) {
            this.enableTextureShaderAttribs(shaderProgram);  
        } else {
            this.enableRegularShaderAttribs(shaderProgram);  
        }
        shaderProgram.pMatrixUniform = this.gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = this.gl.getUniformLocation(shaderProgram, "uMVMatrix");

        return shaderProgram;
    },
    this.enableRegularShaderAttribs = function(shaderProgram) {
        shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(shaderProgram, "aVertexPosition");
        this.gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
        shaderProgram.vertexColorAttribute = this.gl.getAttribLocation(shaderProgram, "aVertexColor");
        this.gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
    },
    this.enableTextureShaderAttribs = function(shaderProgram) {
        shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(shaderProgram, "aVertexPosition");
        this.gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
        shaderProgram.textureCoordAttribute = this.gl.getAttribLocation(shaderProgram, "aTextureCoord");
        this.gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
    },
    this.mvPushMatrix = function() {
        var copy = mat4.create();
        mat4.copy(copy, this.mvMatrix);
        this.mvMatrixStack.push(copy);  
    },
    this.mvPopMatrix = function() {
        if (this.mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        this.mvMatrix = this.mvMatrixStack.pop();
    },
    this.resize = function(width, height) {
        canvas.width = width;
        canvas.height = height;
        mat4.translate(this.mvMatrix, this.mvMatrix, [+this.gl.viewportRatio , +1.0 , 0.0]);
        this.gl.viewportWidth = width;
        this.gl.viewportHeight = height;
        this.gl.viewportRatio = width / height;
        this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
        mat4.ortho(this.pMatrix, -this.gl.viewportRatio, this.gl.viewportRatio, -1.0, 1.0, 0.1, 100.0);
        mat4.translate(this.mvMatrix, this.mvMatrix, [-this.gl.viewportRatio , -1.0 , 0.0]);
    }
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}