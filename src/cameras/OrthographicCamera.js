/**
 * The OrthographicCamera class allows the WebGLRenderer to render objects in 
 * different coordinates of the scene.
 *
 * @class OrthographicCamera
 * @constructor
 * @param {Number} x X position
 * @param {Number} y Y position
 */
LE.OrthographicCamera = function(x, y) {
    /**
     * @property x
     * @type Number
     */
    this.x = x,
    /**
     * @property y
     * @type Number
     */
    this.y = y,
    /**
     * Model view matrix
     *
     * @private
     * @property mvMatrix 
     * @type Object
     */
    this.mvMatrix = mat4.create(),
    /**
     * Projection view matrix
     *
     * @private
     * @property pMatrix
     * @type Object
     */
    this.pMatrix = mat4.create(),
    /**
     * Model view matrix stack
     *
     * @private
     * @property mvMatrixStack
     * @type Array
     */
    this.mvMatrixStack = [];
};

// All functions bellow are used by the WebGL Renderer
/**
 * Sets the projection matrix orthographic bounds
 *
 * @method ortho
 * @param {Number} left
 * @param {Number} right
 * @param {Number} bottom
 * @param {Number} top
 * @param {Number} near
 * @param {Number} far
 * @private
 */
LE.OrthographicCamera.prototype.ortho = function(left, right, bottom, top, near, far) {
    mat4.ortho(this.pMatrix, left, right, bottom, top, near, far);
};

/**
 * Sets a mat4 to the identity matrix
 *
 * @method identity
 * @param {Object} matrix
 * @private
 */
LE.OrthographicCamera.prototype.identity = function(matrix) {
    mat4.identity(matrix);  
}

/**
 * Translate the model view matrix by given positions
 *
 * @method translate
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @private
 */
LE.OrthographicCamera.prototype.translate = function(x, y, z) {
    mat4.translate(this.mvMatrix, this.mvMatrix, [x , y , z]);
};

/**
 * Rotate the model view matrix by given positions
 *
 * @method rotate
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @private
 */
LE.OrthographicCamera.prototype.rotate = function(rotation, x, y, z) {
    mat4.rotate(this.mvMatrix, this.mvMatrix, rotation, [x, y, z]);
};

/**
 * Add a copy of the model view matrix to the stack
 *
 * @method mvPushMatrix
 * @private
 */
LE.OrthographicCamera.prototype.mvPushMatrix = function() {
    var copy = mat4.create();
    mat4.copy(copy, this.mvMatrix);
    this.mvMatrixStack.push(copy);  
};

/**
 * Remove a copy of the model view matrix from the stack
 *
 * @method mvPopMatrix
 * @private
 */
LE.OrthographicCamera.prototype.mvPopMatrix = function() {
    if (this.mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    this.mvMatrix = this.mvMatrixStack.pop();
};
