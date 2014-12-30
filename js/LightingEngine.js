var time =  new Date().getTime();
var fpsCount = 0;
var fps = 0;
var logFPS = true;

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

function Polygon(x, y, faceSize, vertices, shadowVertices) {
    this.x = x,
    this.y = y,
    this.faceSize = faceSize,
    this.vertices = vertices,
    this.shadowVertices = shadowVertices,
    this.bufferIndex,
    this.getVertices = function() {
/*        var theVertices = [
            this.vertices[0].x + this.x, this.vertices[0].y + this.y, 0.0,
            this.vertices[1].x + this.x, this.vertices[1].y + this.y, 0.0,
            this.x, this.y,  0.0,
            this.vertices[2].x + this.x, this.vertices[2].y + this.y,  0.0
        ];

        return theVertices;*/

        return this.shadowVertices;
    }
}

function LightingEngine(canvas) {
    this.gl,
    this.canvas = canvas,
    this.mvMatrix = mat4.create(),
    this.pMatrix = mat4.create(),
    this.shaderProgram,
    this.shaderProgram2,
    this.objects = [],
    this.lights = [],
    this.lightColour = {
        r: 255, g: 255, b: 255
    },
    this.lightIntensity = 40,
    this.colourSpectrum = [],
    this.colourIndex = 0,
    this.objectBuffers = [],
    this.objectColourBuffers = [],
    this.lightBuffers = [],
    this.lightColourBuffers = [],
    this.shadowBuffers = [],
    this.shadowColourBuffers = [],
    this.mousePos = {
        x: 0,
        y: 0
    },
    this.init = function() {
        this.initGL();
        this.initShaders();
        // Probably Temporary
        this.initObjectsAndLights();
        this.initBuffers();
        this.prepareGL();
    },
    this.initGL = function() {
        try {
            this.gl = this.canvas.getContext("webgl", {stencil:true});
            this.gl.viewportWidth = canvas.width;
            this.gl.viewportHeight = canvas.height;
        } catch(e) {
        }
        if (!this.gl) {
            alert("Could not initialise WebGL, sorry :-( ");
        }
    },
    this.initShaders = function() {
        var fragmentShader = this.getShader(this.gl, "shader-fs");
        var vertexShader = this.getShader(this.gl, "shader-vs");
        var fragmentShader2 = this.getShader(this.gl, "shader-fs2");
        this.shaderProgram = this.createShader(this.shaderProgram, vertexShader, fragmentShader);
        this.shaderProgram2 = this.createShader(this.shaderProgram2, vertexShader, fragmentShader2);
        this.gl.useProgram(this.shaderProgram);
    },
    this.initBuffers = function() {
        for(var i = 0; i < this.objects.length; i++) {
            for(var ii = i; ii >= 0; ii--) {
                if(this.objects[i] != this.objects[ii] && this.objects[i].vertices.length == this.objects[ii].vertices.length &&
                    this.objects[i].faceSize == this.objects[ii].faceSize) {
                    this.objects[i].bufferIndex = this.objects[ii].bufferIndex;
                } else if(ii == 0) {
                    this.objects[i].bufferIndex = this.objectBuffers.length;

                    this.objectBuffers[this.objectBuffers.length] = this.gl.createBuffer();
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.objectBuffers[this.objects[i].bufferIndex]);
        /*            vertices = [
                        this.convertToMatrix(this.objects[i].width, true), this.convertToMatrix(this.objects[i].height, false),  0.0,
                        0,  this.convertToMatrix(this.objects[i].height, false),  0.0,
                        this.convertToMatrix(this.objects[i].width, true), 0,  0.0,
                        0, 0,  0.0,
                    ];*/
                    vertices = [];

                    for(var v = 0; v < this.objects[i].vertices.length; v++) {
                        vertices.push(this.convertToMatrix(this.objects[i].vertices[v].x, true), 
                        this.convertToMatrix(this.objects[i].vertices[v].y, false),
                        0.0);

                        if(v % 3 == 1) {
                            vertices.push(0.0, 0.0, 0.0); 
                        }

                    }
                    var validation = [7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52];
                    for(var val = 0; val < validation.length; val++) {
                        if(this.objects[i].vertices.length == validation[val]) {
                            vertices.push(0.0, 0.0, 0.0); 
                            break; 
                        }
                    }

                    vertices.push(this.convertToMatrix(this.objects[i].vertices[0].x, true));
                    vertices.push(this.convertToMatrix(this.objects[i].vertices[0].y, false));
                    vertices.push(0.0); 

                    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
                    this.objectBuffers[this.objects[i].bufferIndex].itemSize = 3;
                    this.objectBuffers[this.objects[i].bufferIndex].numItems = vertices.length / 3; 

                    // Color vertices
                    this.objectColourBuffers[this.objects[i].bufferIndex] = this.gl.createBuffer();
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.objectColourBuffers[this.objects[i].bufferIndex]);
                    colors = [];
                    for (var c = 0; c < vertices.length; c++) {
                      colors = colors.concat([0.1, 0.1, 0.1, 1.0]);
                    }
                    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
                    this.objectColourBuffers[this.objects[i].bufferIndex].itemSize = 4;
                    this.objectColourBuffers[this.objects[i].bufferIndex].numItems = vertices.length / 3;
                }
            }
        }

        console.log(this.objectBuffers.length);

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
    this.prepareGL = function() {
       /* this.gl.enable(this.gl.STENCIL_TEST);*/
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
        mat4.ortho(this.pMatrix, -1.0, 1.0, -1.0, 1.0, 0.1, 100.0);
        mat4.identity(this.mvMatrix);
        mat4.translate(this.mvMatrix, this.mvMatrix, [-1.0 , -1.0 , -1.0]);
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


        this.lights[this.lights.length - 1].location.x = this.mousePos.x;
        this.lights[this.lights.length - 1].location.y = Math.abs(this.mousePos.y - this.gl.viewportHeight);   
            
        this.lights[this.lights.length - 1].red = this.lightColour.r / this.lightIntensity;
        this.lights[this.lights.length - 1].green = this.lightColour.g / this.lightIntensity;
        this.lights[this.lights.length - 1].blue = this.lightColour.b / this.lightIntensity;
    },
    this.render = function() {
        this.gl.useProgram(this.shaderProgram);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.STENCIL_TEST);
        for(var l = 0; l < this.lights.length; l++) {  
            var theVertices = [];       
            for(var o = 0; o < this.objects.length; o++) {
                var vertices = this.objects[o].getVertices();
                this.gl.stencilOp(this.gl.KEEP, this.gl.KEEP, this.gl.REPLACE);
                this.gl.stencilFunc(this.gl.ALWAYS, 1, 1);
                this.gl.colorMask(false, false, false, false);

                for(var v = 0; v < vertices.length; v++) {
                    var currentVertex = vertices[v];
                    var nextVertex = vertices[(v + 1) % vertices.length]; 
                    var edge = Vector2f.sub(nextVertex, currentVertex);
                    var normal = {
                        x: edge.y,
                        y: -edge.x
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

        this.gl.disable(this.gl.STENCIL_TEST);
        this.gl.useProgram(this.shaderProgram2);
        for(var o = 0; o < this.objects.length; o++) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.objectBuffers[this.objects[o].bufferIndex]);
            this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.objectBuffers[this.objects[o].bufferIndex].itemSize, this.gl.FLOAT, false, 0, 0);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.objectColourBuffers[this.objects[o].bufferIndex]);
            this.gl.vertexAttribPointer(this.shaderProgram.vertexColorAttribute, this.objectColourBuffers[this.objects[o].bufferIndex].itemSize, this.gl.FLOAT, false, 0, 0);
            var matrixPos = this.convertVertToMatrix(this.objects[o].x, this.objects[o].y);
            mat4.translate(this.mvMatrix, this.mvMatrix, [matrixPos.x, matrixPos.y, 0.0]);
            this.setMatrixUniforms(this.shaderProgram2);
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.objectBuffers[this.objects[o].bufferIndex].numItems);
            mat4.translate(this.mvMatrix, this.mvMatrix, [-matrixPos.x, -matrixPos.y, 0.0]);
        }

    },
    this.createPolygon = function(xPos, yPos, numberOfVertices, faceSize) {
        if(numberOfVertices < 3) {
            console.log("To create a polygon it must have at least 3 vertices!");
        } else if(numberOfVertices > 52) {
            console.log("Currently only support polygons with up to 52 vertices.");
        } else {
            var polygonVertices = [];
            for(var i = 0; i < numberOfVertices; i++) {
                polygonVertices.push( { x: (Math.sin(i/numberOfVertices*2*Math.PI) * faceSize), y: (Math.cos(i/numberOfVertices*2*Math.PI) * faceSize)} );
            }
            var shadowVertices = []
            for(var i = 0; i < numberOfVertices; i++) {
                shadowVertices.push( { x: (Math.sin(i/numberOfVertices*2*Math.PI) * faceSize) + xPos, y: (Math.cos(i/numberOfVertices*2*Math.PI) * faceSize) + yPos } );
            }
            this.objects.push(new Polygon(xPos, yPos, faceSize, polygonVertices, shadowVertices));
        }
    },
    this.initObjectsAndLights = function(){
        for(var i = 0; i < 30; i++) {
            var w = 50, h = 50;
            this.createPolygon(Math.floor(Math.random() * this.gl.viewportWidth), Math.floor(Math.random() * this.gl.viewportHeight), Math.floor(Math.random() * 10) + 3, Math.floor(Math.random() * 50) + 5);
           /* this.objects.push(new Block(Math.floor(Math.random() * this.gl.viewportWidth - w), Math.floor(Math.random() * this.gl.viewportHeight - h), w, h));*/
        }
        this.lights.push(new Light(Math.floor(Math.random() * this.gl.viewportWidth), Math.floor(Math.random() * this.gl.viewportHeight), 
            10,10,10));
    },
    this.createLight = function(x, y) {
/*        this.lights.push(new Light(x, Math.abs(y - this.gl.viewportHeight), Math.random() * 10, Math.random() * 10,Math.random() * 10));*/
        this.lights.push(new Light(x, Math.abs(y - this.gl.viewportHeight), this.lightColour.r / this.lightIntensity, this.lightColour.g / this.lightIntensity, this.lightColour.b / this.lightIntensity));
    },
    this.setLightColour = function(r, g, b) {
        this.lightColour = {
            r: r, g: g, b: b
        }
    },
    this.setLightIntensity = function(intensity) {
        if(intensity < 0) {
            console.log("Cannot set light intensity bellow '0'.");
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
            return (value / this.gl.viewportWidth * 2);
        } else {
            return (value / this.gl.viewportHeight * 2);
        }
    },
    this.convertVertToMatrix = function(x, y) {
        return verts = { x: x / this.gl.viewportWidth * 2, y: y / this.gl.viewportHeight * 2 };
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
    }
    this.createShader = function(shaderProgram, vertexShader, fragmentShader) {
        shaderProgram = this.gl.createProgram();
        this.gl.attachShader(shaderProgram, vertexShader);
        this.gl.attachShader(shaderProgram, fragmentShader);
        this.gl.linkProgram(shaderProgram);
        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }
        this.gl.useProgram(shaderProgram);
        shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(shaderProgram, "aVertexPosition");
        this.gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
        shaderProgram.vertexColorAttribute = this.gl.getAttribLocation(shaderProgram, "aVertexColor");
        this.gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
        shaderProgram.pMatrixUniform = this.gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = this.gl.getUniformLocation(shaderProgram, "uMVMatrix");

        return shaderProgram;
    }
}