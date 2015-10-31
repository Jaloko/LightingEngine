/**
 * The Scene class contains the objects that are rendered with the WebGLRenderer
 *
 * @class Scene
 * @constructor
 * @param {Object} [parameters] Parameters is an object that contains the Scenes properties
 * @param {AmbientLight} [parameters.ambientLight=new LE.AmbientLight(new LE.Colour(255, 255, 255, 255))] Default value is an ambient light with maximum brightness.
 */
LE.Scene = function(parameters) {
    // Stop error if no parameters given
    if(parameters == null) {
        parameters = { };
    }
    // Variable declarations
    /**
     * Stores a reference to the WebGL canvas context
     *
     * @private
     * @property gl
     * @type Object
     */
    this.gl,
    /**
     * Stores the lights
     *
     * @private
     * @property lights
     * @type Array
     */
    this.lights = [],
    /**
     * Stores the objects that cast shadows
     *
     * @private
     * @property shadowObjects
     * @type Array
     */
    this.shadowObjects = [],
    /**
     * Stores the objects that do not cast shadows
     *
     * @private
     * @property objects
     * @type Array
     */
    this.objects = [],
    /**
     * Stores the ambient light
     *
     * @property ambientLight
     * @type AmbientLight
     * @default new LE.AmbientLight(new LE.Colour(255, 255, 255, 255))
     */
    this.ambientLight = parameters.ambientLight || new LE.AmbientLight(new LE.Colour(255, 255, 255, 255)),
    /**
     * Stores all the texture data to be rendered by WebGL
     *
     * @private
     * @property textures
     * @type Array
     */
    this.textures = [],

    // WebGL Buffers
    /**
     * Stores all the WebGL vertex buffers
     *
     * @private
     * @property objectBuffers
     * @type Array
     */
    this.objectBuffers = [],
    /**
     * Stores all the WebGL colour vertex buffers
     *
     * @private
     * @property objectColourBuffers 
     * @type Array
     */
    this.objectColourBuffers = [],
    /**
     * Stores all the WebGL texture vertex buffers
     *
     * @private
     * @property objectTextureBuffers 
     * @type Array
     */
    this.objectTextureBuffers = [],
    /**
     * Stores all the WebGL light vertex buffers
     *
     * @private
     * @property lightBuffers
     * @type Array
     */
    this.lightBuffers = [],
    /**
     * Stores all the WebGL shadow vertex buffers
     *
     * @private
     * @property shadowBuffers 
     * @type Array
     */
    this.shadowBuffers = [],
    /**
     * Stores all the WebGL shadow colour vertex buffers
     *
     * @private
     * @property shadowColourBuffers 
     * @type Array
     */
    this.shadowColourBuffers = [];
};

/**
 * Initialise the scene with a WebGL context
 *
 * @method init
 * @param {Object} gl
 * @private
 */
LE.Scene.prototype.init = function(gl) {
    this.gl = gl
    this.initBuffers();
    this.initTextures();
};

/**
 * Initialise all buffers, this includes object, texture and light buffers
 *
 * @method initBuffers
 * @param {Object} gl
 * @private
 */
LE.Scene.prototype.initBuffers = function(gl) {
    for(var so = 0; so < this.shadowObjects.length; so++) {
        if(this.shadowObjects[so] instanceof LE.Texture) {
            this.initTextureBuffer(this.shadowObjects, so);
        } else {
            this.initPolygonBuffer(this.shadowObjects, so);
        }
    }

    for(var o = 0; o < this.objects.length; o++) {
        if(this.shadowObjects[o] instanceof LE.Texture) {
            this.initTextureBuffer(this.objects, o);
        } else {
            this.initPolygonBuffer(this.objects, o);
        }
    }

    this.shadowColourBuffers[0] = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.shadowColourBuffers[0]);
    colors = [];

    // This number should not be fixed. TEMPORARY
    for (var i=0; i < 10000; i++) {
      colors = colors.concat([1.0, 1.0, 1.0, 0.5]);
    }
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
    this.shadowColourBuffers[0].itemSize = 4;
    this.shadowColourBuffers[0].numItems = 10000;

    this.shadowBuffers[0] = this.gl.createBuffer();

    for(var l = 0; l < this.lights.length; l++) {
        this.initLightBuffer(this.lights, l);
    }
};

/**
 * Initialise a texture buffer
 *
 * @method initTextureBuffer
 * @param {Array} array
 * @param {Number} i Index in the given array
 * @private
 */
LE.Scene.prototype.initTextureBuffer = function(array, i) {
    var size = LE.Utilities.sizeFromVerts(array[i].renderVerts);
    for(var ii = i; ii >= 0; ii--) {
        var iiSize = LE.Utilities.sizeFromVerts(array[ii].renderVerts);
        if(array[i] != array[ii]  && array[i].renderVerts.length == array[ii].renderVerts.length
            && size.width == iiSize.width && size.height == iiSize.height) {
            array[i].bufferIndex = array[ii].bufferIndex;
        } else if(ii == 0) {
            array[i].bufferIndex = this.objectBuffers.length;

            this.objectBuffers[this.objectBuffers.length] = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.objectBuffers[array[i].bufferIndex]);

            var renderVerts = [];

            renderVerts = [
                LE.Utilities.toMatrix(this.gl, size.width, true), LE.Utilities.toMatrix(this.gl, size.height, false),  0.0,
                0,  LE.Utilities.toMatrix(this.gl, size.height, false),  0.0,
                LE.Utilities.toMatrix(this.gl, size.width, true), 0,  0.0,
                0, 0,  0.0,
            ];
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(renderVerts), this.gl.STATIC_DRAW);

            this.objectBuffers[array[i].bufferIndex].itemSize = 3;
            this.objectBuffers[array[i].bufferIndex].numItems = renderVerts.length / 3;  

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

/**
 * Checks if a given polygon is equal to another polygon
 *
 * @method comparePolygons
 * @param {Object} object1
 * @param {Object} object2
 * @private
 */
LE.Scene.prototype.comparePolygons = function(object1, object2) {
    if(object1 != object2) {
        if(object1.renderVerts.length == object2.renderVerts.length) {
            for(var v = 0; v < object1.renderVerts.length; v++) {
                if(object1.renderVerts[v].x != object2.renderVerts[v].x ||
                   object1.renderVerts[v].y != object2.renderVerts[v].y) {
                    // If the individual verts arent the same exit
                    return false;
                }
            }
        } else {
            // If the vert lengths aren't the same exit
            return false;
        }
        // Could be a flaw here
        // If the object doesnt have a colour no need to check it
        if(object2.colour != null) {
            if(object1.colour.r == object2.colour.r && object1.colour.g == object2.colour.g 
            && object1.colour.b == object2.colour.b && object1.colour.a == object2.colour.a) {
                return true;
            }
        } else {

            return true;
        }
    }
    return false;
};

/**
 * Initialise a polygon buffer
 *
 * @method initPolygonBuffer
 * @param {Array} array
 * @param {Number} i Index in the given array
 * @private
 */
LE.Scene.prototype.initPolygonBuffer = function(array, i) {
    for(var ii = i; ii >= 0; ii--) {
        if(this.comparePolygons(array[i], array[ii])) {
            array[i].bufferIndex = array[ii].bufferIndex;
            break;
        } else if(ii == 0) {
            array[i].bufferIndex = this.objectBuffers.length;

            this.objectBuffers[this.objectBuffers.length] = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.objectBuffers[array[i].bufferIndex]);

            var renderVerts = [];

            for(var v = 0; v < array[i].renderVerts.length; v++) {
                renderVerts.push(LE.Utilities.toMatrix(this.gl, array[i].renderVerts[v].x, true), 
                    LE.Utilities.toMatrix(this.gl, array[i].renderVerts[v].y, false),
                    0.0);
            }
            
            // This shouldnt be here
            renderVerts.push(LE.Utilities.toMatrix(this.gl, array[i].renderVerts[0].x, true));
            renderVerts.push(LE.Utilities.toMatrix(this.gl, array[i].renderVerts[0].y, false));
            renderVerts.push(0.0); 
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(renderVerts), this.gl.STATIC_DRAW);

            this.objectBuffers[array[i].bufferIndex].itemSize = 3;
            this.objectBuffers[array[i].bufferIndex].numItems = renderVerts.length / 3;  

            this.objectColourBuffers[array[i].bufferIndex] = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.objectColourBuffers[array[i].bufferIndex]);
            colors = [];
            for (var c = 0; c < renderVerts.length; c++) {
              colors = colors.concat([array[i].colour.r / 255, array[i].colour.g / 255, array[i].colour.b / 255, array[i].colour.a / 255]);
            }
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
            this.objectColourBuffers[array[i].bufferIndex].itemSize = 4;
            this.objectColourBuffers[array[i].bufferIndex].numItems = renderVerts.length / 3;
        }
    }
};

/**
 * Initialises all textures
 *
 * @method initTextures
 * @private
 */
LE.Scene.prototype.initTextures = function() {
    for(var so = 0; so < this.shadowObjects.length; so++) {
        if(this.shadowObjects[so] instanceof LE.Texture) {
            this.assignTextureIndices(this.shadowObjects, so);
        }
    }

    for(var o = 0; o < this.objects.length; o++) {
        if(this.shadowObjects[o] instanceof LE.Texture) {
            this.assignTextureIndices(this.objects, o);
        }
    }
};

/**
 * Assigns a texture index to an object
 *
 * @method assignTextureIndices
 * @param {Array} array
 * @param {Number} i Index in the given array
 * @private
 */
LE.Scene.prototype.assignTextureIndices = function(array, i) {
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
};

/**
 * Prepares the loaded texture for WebGL use
 *
 * @method handleLoadedTexture
 * @param {Object} texture
 * @private
 */
LE.Scene.prototype.handleLoadedTexture = function(texture) {
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, texture.image);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    texture.hasLoaded = true;
};

/**
 * Initialise a light buffer
 *
 * @method initLightBuffer
 * @param {Array} array
 * @param {Number} i Index in the given array
 * @private
 */
LE.Scene.prototype.initLightBuffer = function(array, i) {
    for(var ii = i; ii >= 0; ii--) {
        if(array[i] != array[ii] && array[i].type === array[ii].type) {
            array[i].bufferIndex = array[ii].bufferIndex;
            break;
        } else if(ii == 0) {
            array[i].bufferIndex = this.lightBuffers.length;
            this.lightBuffers[this.lightBuffers.length] = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.lightBuffers[array[i].bufferIndex]);

            if(array[i].type === LE.Lights.POINT_LIGHT || array[i].type === LE.Lights.RADIAL_POINT_LIGHT) {
                // Unsure if this size of these vertices affects performance. Doesnt seem to.
                vertices = [
                    LE.Utilities.toMatrix(this.gl, this.gl.viewportWidth * 5, true), LE.Utilities.toMatrix(this.gl, this.gl.viewportHeight * 5,false),  0.0,
                    LE.Utilities.toMatrix(this.gl, -this.gl.viewportWidth * 5, true), LE.Utilities.toMatrix(this.gl, this.gl.viewportHeight * 5, false),  0.0,
                    LE.Utilities.toMatrix(this.gl, this.gl.viewportWidth * 5 , true), LE.Utilities.toMatrix(this.gl, -this.gl.viewportHeight * 5, false),  0.0,
                    LE.Utilities.toMatrix(this.gl, -this.gl.viewportWidth * 5, true), LE.Utilities.toMatrix(this.gl, -this.gl.viewportHeight * 5, false),  0.0
                ];

                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.DYNAMIC_DRAW);

                this.lightBuffers[array[i].bufferIndex].itemSize = 3;
                this.lightBuffers[array[i].bufferIndex].numItems = 4;  
            } else if(array[i].type === LE.Lights.DIRECTIONAL_LIGHT) {
                var originalAngle = array[i].range;

                var angle = LE.Utilities.degToRad(originalAngle / 2);
                var distance = 200000;
                // Point 1
                var x = Math.round(0 + distance * Math.cos(angle));
                var y = Math.round(0 + distance * Math.sin(angle));
                angle = LE.Utilities.degToRad(-originalAngle / 2);
                // Point 2
                var xx = Math.round(0 + distance * Math.cos(angle));
                var yy = Math.round(0 + distance * Math.sin(angle));

                vertices = [
                    0, 0,  0.0,
                    LE.Utilities.toMatrix(this.gl, x, true), LE.Utilities.toMatrix(this.gl, y, false),  0.0,
                    LE.Utilities.toMatrix(this.gl, xx, true), LE.Utilities.toMatrix(this.gl, yy, false),  0.0,
                ];

                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.DYNAMIC_DRAW);

                this.lightBuffers[array[i].bufferIndex].itemSize = 3;
                this.lightBuffers[array[i].bufferIndex].numItems = 3;  
            }
        }
    }
};

/**
 * Adds a PointLight, DirectionalLight or RadialPointLight to the scene
 *
 * @method addLight
 * @param {Object} light
 */
// Merge into a single "add()" function in the future
LE.Scene.prototype.addLight = function(light) {
    if(light instanceof LE.PointLight || light instanceof LE.DirectionalLight || light instanceof LE.RadialPointLight) {
        this.lights.push(light);
        if(this.gl != null) {
            this.initLightBuffer(this.lights, this.lights.length - 1);
        }
    }
};

/**
 * Adds a Polygon or Texture to the scene. This object will cast shadows
 *
 * @method addShadowObject
 * @param {Object} object
 */
// Merge into a single "add()" function in the future
LE.Scene.prototype.addShadowObject = function(object) {
    if(object instanceof LE.Texture) {
        this.shadowObjects.push(object);
        if(this.gl != null) {
            this.initTextureBuffer(this.shadowObjects, this.shadowObjects.length - 1);
            this.assignTextureIndices(this.shadowObjects, this.shadowObjects.length - 1);
        }
    } else if(object instanceof LE.Polygon) {
        this.shadowObjects.push(object);
        if(this.gl != null) {
            this.initPolygonBuffer(this.shadowObjects, this.shadowObjects.length - 1);
        }
    }
};

/**
 * Adds a Polygon or Texture to the scene. This object will not cast shadows
 *
 * @method addObject
 * @param {Object} object
 */
// Merge into a single "add()" function in the future
LE.Scene.prototype.addObject = function(object) {
    if(object instanceof LE.Texture) {
        this.objects.push(object);
        if(this.gl != null) {
            this.initTextureBuffer(this.objects, this.objects.length - 1);
            this.assignTextureIndices(this.objects, this.objects.length - 1);
        }
    } else if(object instanceof LE.Polygon) {
        this.objects.push(object);
        if(this.gl != null) {
            this.initPolygonBuffer(this.objects, this.objects.length - 1);
        }
    }
};

/**
 * Removes a PointLight, DirectionalLight or RadialPointLight from the scene
 *
 * @method removeLight
 * @param {Object} light
 */
// Merge into a single "remove()" function in the future
LE.Scene.prototype.removeLight = function(light) {
    if(light instanceof LE.PointLight || light instanceof LE.DirectionalLight || light instanceof LE.RadialPointLight) {
        this.removeObjectAndBuffer(light, this.lights, [this.lightBuffers]);
    }
};

/**
 * Removes a Polygon or Texture from the scene. This object casts shadows
 *
 * @method removeShadowObject
 * @param {Object} object
 */
// Merge into a single "remove()" function in the future
LE.Scene.prototype.removeShadowObject = function(object) {
    if(object instanceof LE.Texture || object instanceof LE.Polygon) {
        this.removeObjectAndBuffer(object, this.shadowObjects, [this.objectBuffers, this.objectColourBuffers]);
    }
};

/**
 * Removes a Polygon or Texture from the scene. This object does not cast shadows
 *
 * @method removeObject
 * @param {Object} object
 */
// Merge into a single "remove()" function in the future
LE.Scene.prototype.removeObject = function(object) {
    if(object instanceof LE.Texture || object instanceof LE.Polygon) {
        this.removeObjectAndBuffer(object, this.objects, [this.objectBuffers, this.objectColourBuffers]);
    }
};


// Remove an object and any buffers associated with it - works with lights as well
LE.Scene.prototype.removeObjectAndBuffer = function(object, array, buffers) {
    var counter = 0;
    // Check if another object uses the same buffer
    for(var i = 0; i < array.length; i++) {
        if(object != array[i] && object.bufferIndex == array[i].bufferIndex) {
            counter++;
            break;
        }
    }
    // If counter is 0 there are no other objects that use the buffer
    // This means we should remove the buffer
    if(counter == 0) {
        // Because we are removing a buffer all the bufferIndices need to be updated
        for(var i = 0; i < array.length; i++) {        
            if(array[i].bufferIndex > object.bufferIndex) {
                array[i].bufferIndex--;
            }
        }
        // Remove the buffers
        for(var b = 0; b < buffers.length; b++) {
            buffers[b].splice(object.bufferIndex, 1);
        }
    }
    // Now finally remove the object
    for(var i = 0; i < array.length; i++) {
        if(array[i] == object) {
            array.splice(i,1);
            break;
        }
    }
};
