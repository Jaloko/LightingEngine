var time =  new Date().getTime();
var fpsCount = 0;
var fps = 0;
var logFPS = false;
var rot = 0;
var faceSize = 0;

function Light(x, y, red, green, blue) {
    this.location = {
        x : x,
        y : y
    },
    this.x = x,
    this.y = y,
    this.red = red,
    this.green = green,
    this.blue = blue
}

/*function Block(x, y, width, height) {
    this.x = x,
    this.y = y,
    this.width = width,
    this.height = height,

    this.getVertices = function() {
        var vertices = [
            {x: this.x, y: this.y},
            {x: this.x, y: this.y + this.height},
            {x: this.x + this.width, y:this.y + this.height},
            {x: this.x + this.width, y: this.y}
        ];

        return vertices;
    }
}*/

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
    this.rotate = function() {
        var angle = degToRad(this.rotation);
        for(var i = 0; i < shadowVertices.length; i++) {
            var px = this.x + this.vertices[i].x;
            var py = this.y + this.vertices[i].y;
            var ox = (this.x);
            var oy = (this.y);
            var x = Math.cos(angle) * (px-ox) - Math.sin(angle) * (py - oy) + ox;
            var y = Math.sin(angle) * (px-ox) + Math.cos(angle) * (py - oy) + oy;
            this.shadowVertices[i].x = x;
            this.shadowVertices[i].y = y;
/*            console.log("Vert: " + i + ": " + px + ", " + py + "   " + x + ", " + y);*/
        }
    }
}


function LightingEngine(canvas) {
    this.gl,
    this.canvas = canvas,
    this.mvMatrix = mat4.create(),
    this.pMatrix = mat4.create(),
    this.mvMatrixStack = [],
    this.shaderProgram,
    this.shaderProgram2,
    this.textureShaderProgram,
    this.foreground = [],
    this.background = [],
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
    this.lightColourBuffers = [],
    this.shadowBuffers = [],
    this.shadowColourBuffers = [],
    this.textures = [],
    this.mousePos = {
        x: 0,
        y: 0
    },
    this.init = function() {
        this.initGL();
        this.initShaders();
        // Probably Temporary
/*        this.initforegroundAndLights();*/
        this.initBuffers();
        this.initTextures();
        this.prepareGL();
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
        var fragmentShader = this.getShader(this.gl, "shader-fs");
        var vertexShader = this.getShader(this.gl, "shader-vs");
        var colourFragmentShader = this.getShader(this.gl, "shader-colour-fs");
        var textureVertexShader = this.getShader(this.gl, "shader-texture-vs");
        var textureFragmentShader = this.getShader(this.gl, "shader-texture-fs");
        this.shaderProgram = this.createShader(this.shaderProgram, false, vertexShader, fragmentShader);
        this.shaderProgram2 = this.createShader(this.shaderProgram2, false, vertexShader, colourFragmentShader);
        this.textureShaderProgram = this.createShader(this.textureShaderProgram, true, textureVertexShader, textureFragmentShader);
        this.gl.useProgram(this.shaderProgram);
    },
    this.initBuffers = function() {
        for(var f = 0; f < this.foreground.length; f++) {
            this.initPolygonBuffers(this.foreground, f);
        }

        for(var b = 0; b < this.background.length; b++) {
            this.initPolygonBuffers(this.background, b);
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

        this.lightBuffers[0] = this.gl.createBuffer();
    },
    this.initPolygonBuffers = function(array, i) {
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
    this.prepareGL = function() {
       /* this.gl.enable(this.gl.STENCIL_TEST);*/
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

        if(rot < 360) {
            rot++;
        } else if(rot >= 360) {
            rot = 0;
        }


        this.lights[this.lights.length - 1].location.x = this.mousePos.x;
        this.lights[this.lights.length - 1].location.y = Math.abs(this.mousePos.y - this.gl.viewportHeight);   
            
        this.lights[this.lights.length - 1].red = this.lightColour.r / this.lightIntensity;
        this.lights[this.lights.length - 1].green = this.lightColour.g / this.lightIntensity;
        this.lights[this.lights.length - 1].blue = this.lightColour.b / this.lightIntensity;
    },
    this.render = function() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        for(var b = 0; b < this.background.length; b++) {
            this.renderObject(this.background, b);
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        this.gl.useProgram(this.shaderProgram);
        this.gl.enable(this.gl.STENCIL_TEST);
        for(var l = 0; l < this.lights.length; l++) {  
            var theVertices = [];       
            this.gl.stencilOp(this.gl.KEEP, this.gl.KEEP, this.gl.REPLACE);
            this.gl.stencilFunc(this.gl.ALWAYS, 1, 1);
            this.gl.colorMask(false, false, false, false);
            this.gl.depthMask(false);
            for(var f = 0; f < this.foreground.length; f++) {
                this.foreground[f].rotation = rot;
                this.foreground[f].rotate();
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
            this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.shadowBuffers[0].itemSize, this.gl.FLOAT, false, 0, 0);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.shadowColourBuffers[0]);
            this.gl.vertexAttribPointer(this.shaderProgram.vertexColorAttribute, this.shadowColourBuffers[0].itemSize, this.gl.FLOAT, false, 0, 0);
            this.setMatrixUniforms(this.shaderProgram); 
            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.shadowBuffers[0].numItems);

            this.gl.colorMask(true, true, true, true);
            this.gl.stencilOp(this.gl.KEEP, this.gl.KEEP, this.gl.KEEP);
            this.gl.stencilFunc(this.gl.EQUAL, 0, 1);
            this.gl.uniform2f(this.gl.getUniformLocation(this.shaderProgram, "lightLocation"), this.lights[l].location.x, this.lights[l].location.y);
            this.gl.uniform3f(this.gl.getUniformLocation(this.shaderProgram, "lightColor"), this.lights[l].red, this.lights[l].green, this.lights[l].blue);
            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(this.gl.ONE, this.gl.ONE); 

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.lightBuffers[0]);
            vertices = [
                this.convertToMatrix(this.lights[l].location.x + this.gl.viewportWidth, true), this.convertToMatrix(this.lights[l].location.y + this.gl.viewportHeight,false),  0.0,
                0, this.convertToMatrix(this.lights[l].location.y + this.gl.viewportHeight, false),  0.0,
                this.convertToMatrix(this.lights[l].location.x + this.gl.viewportWidth, false), 0,  0.0,
                0, 0,  0.0
            ];
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.DYNAMIC_DRAW);
            this.lightBuffers[0].itemSize = 3;
            this.lightBuffers[0].numItems = 4; 

            // Draw lights
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.lightBuffers[0]);
            this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.lightBuffers[0].itemSize, this.gl.FLOAT, false, 0, 0);

            this.setMatrixUniforms(this.shaderProgram); 
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.lightBuffers[0].numItems);
            this.gl.disable(this.gl.BLEND);
            /*gl.useProgram(0);*/
            this.gl.clear(this.gl.STENCIL_BUFFER_BIT);
            
        }

        for(var f = 0; f < this.foreground.length; f++) {
            this.renderObject(this.foreground, f);
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);


        this.gl.useProgram(this.shaderProgram);
        for(var l = 0; l < this.lights.length; l++) { 
            this.gl.uniform2f(this.gl.getUniformLocation(this.shaderProgram, "lightLocation"), this.lights[l].location.x, this.lights[l].location.y);
            this.gl.uniform3f(this.gl.getUniformLocation(this.shaderProgram, "lightColor"), this.lights[l].red / 3, this.lights[l].green / 3, this.lights[l].blue / 3);
            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(this.gl.ONE, this.gl.ONE);  
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.lightBuffers[0]);
            vertices = [
                this.convertToMatrix(this.lights[l].location.x + this.gl.viewportWidth, true), this.convertToMatrix(this.lights[l].location.y + this.gl.viewportHeight,false),  0.0,
                0, this.convertToMatrix(this.lights[l].location.y + this.gl.viewportHeight, false),  0.0,
                this.convertToMatrix(this.lights[l].location.x + this.gl.viewportWidth, false), 0,  0.0,
                0, 0,  0.0
            ];
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.DYNAMIC_DRAW);
            this.lightBuffers[0].itemSize = 3;
            this.lightBuffers[0].numItems = 4; 

            // Draw lights
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.lightBuffers[0]);
            this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.lightBuffers[0].itemSize, this.gl.FLOAT, false, 0, 0);

            this.setMatrixUniforms(this.shaderProgram); 
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.lightBuffers[0].numItems);
        }

    },
    this.renderObject = function(array, i) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.objectBuffers[array[i].bufferIndex]);
        this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.objectBuffers[array[i].bufferIndex].itemSize, this.gl.FLOAT, false, 0, 0);

        if(array[i].textureURL == null) {
            this.gl.useProgram(this.shaderProgram2);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.objectColourBuffers[array[i].bufferIndex]);
            this.gl.vertexAttribPointer(this.shaderProgram.vertexColorAttribute, this.objectColourBuffers[array[i].bufferIndex].itemSize, this.gl.FLOAT, false, 0, 0);
            var matrixPos = this.convertVertToMatrix(array[i].x, array[i].y);
            mat4.translate(this.mvMatrix, this.mvMatrix, [matrixPos.x, matrixPos.y, 0.0]);
            this.mvPushMatrix();
            mat4.rotate(this.mvMatrix, this.mvMatrix, degToRad(rot), [0, 0, 1]);
            this.setMatrixUniforms(this.shaderProgram2);  
        } else {
            this.gl.useProgram(this.textureShaderProgram);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.objectTextureBuffers[array[i].bufferIndex]);
            this.gl.vertexAttribPointer(this.textureShaderProgram.textureCoordAttribute, this.objectTextureBuffers[array[i].bufferIndex].itemSize, this.gl.FLOAT, false, 0, 0);
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
            mat4.rotate(this.mvMatrix, this.mvMatrix, degToRad(rot), [0, 0, 1]);
            mat4.translate(this.mvMatrix, this.mvMatrix, [-matrixWidth / 2, -matrixHeight / 2, 0.0]);
            this.setMatrixUniforms(this.textureShaderProgram); 
        }

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.objectBuffers[array[i].bufferIndex].numItems);
        this.mvPopMatrix();
        mat4.translate(this.mvMatrix, this.mvMatrix, [-matrixPos.x, -matrixPos.y, 0.0]); 
    }
    this.createPolygon = function(xPos, yPos, numberOfVertices, faceSize) {
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

            this.foreground.push(new Polygon(xPos, yPos, faceSize, polygonVertices, shadowVertices));  
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
    },
    this.createLight = function(x, y) {
/*        this.lights.push(new Light(x, Math.abs(y - this.gl.viewportHeight), Math.random() * 10, Math.random() * 10,Math.random() * 10));*/
        this.lights.push(new Light(x, y, this.lightColour.r / this.lightIntensity, this.lightColour.g / this.lightIntensity, this.lightColour.b / this.lightIntensity));
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
    this.getShader = function(gl, id) {
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