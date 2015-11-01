/**
 * The Texture class is used to render images to the scene. Shadows can be cast off a Texture, they are cast based on the vertices
 *
 * @class Texture
 * @constructor
 * @param {Object} [parameters] Parameters is an object that contains the PointLights properties
 * @param {Number} [parameters.x=0] X position
 * @param {Number} [parameters.y=0] Y position
 * @param {Number} [parameters.rotation=0] Rotation
 * @param {Object} [parameters.vertices=LE.Vertices.square(50, 50).vertices] Vertices
 * @param {String} parameters.textureURL Texture URL
 */
LE.Texture = function(parameters) {
    // Stop error if no parameters given
    if(parameters == null) {
        console.error("The Texture class requires the textureURL parameter.");
    }
    if(parameters.vertices == null) {
        parameters.vertices = { vertices: null, renderVerts: null };
    }
    /**
     * @property x
     * @type Number 
     * @default 0
     */
    this.x = parameters.x || 0,
    /**
     * @property y
     * @type Number 
     * @default 0
     */
    this.y = parameters.y || 0,
    /**
     * @property rotation
     * @type Number
     * @default 0
     */
    this._rotation = parameters.rotation || 0,
    /**
     * @private
     * @property vertices
     * @type Object
     * @default LE.Vertices.square(50, 50).vertices
     */
    this.vertices = parameters.vertices.vertices || LE.Vertices.square(50, 50).vertices
    /**
     * @private
     * @property renderVerts
     * @type Object
     * @default LE.Vertices.square(50, 50).renderVerts
     */
    this.renderVerts = parameters.vertices.renderVerts || LE.Vertices.square(50, 50).renderVerts
    /**
     * @private
     * @property centerPoint
     * @type Object
     */
    this.centerPoint = LE.Utilities.centerOfVerts(this.vertices),
    /**
     * @private
     * @property textureURL
     * @type String
     */
    this.textureURL = parameters.textureURL;
};

LE.Texture.prototype = {
    get rotation() {
        return this._rotation;
    },

    set rotation(rot) {
        var rotDifference = Math.abs(this._rotation - rot);
        this._rotation = rot;
        var a = LE.Utilities.degToRad(rotDifference);
        for(var i = 0; i < this.vertices.length; i++) {
            var px = this.vertices[i].x;
            var py = this.vertices[i].y;
            var ox = this.centerPoint.x;
            var oy = this.centerPoint.y;
            var x = Math.cos(a) * (px-ox) - Math.sin(a) * (py - oy) + ox;
            var y = Math.sin(a) * (px-ox) + Math.cos(a) * (py - oy) + oy;
            this.vertices[i].x = x;
            this.vertices[i].y = y;
        }
    }
};
