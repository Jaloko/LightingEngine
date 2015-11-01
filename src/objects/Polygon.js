/**
 * The Polygon class is used to render polygonss to the scene. Shadows can be cast off a Polygon, they are cast based on the vertices
 *
 * @class Polygon
 * @constructor
 * @param {Object} [parameters] Parameters is an object that contains the PointLights properties
 * @param {Number} [parameters.x=0] X position
 * @param {Number} [parameters.y=0] Y position
 * @param {Number} [parameters.rotation=0] Rotation
 * @param {Object} [parameters.vertices=LE.Vertices.regularPolygon(50, 3)] Vertices
 * @param {Colour} [parameters.colour=new LE.Colour(255, 255, 255, 255)] Colour, default is white
 */
LE.Polygon = function(parameters) {
    // Stop error if no parameters given
    if(parameters == null) {
        parameters = { };
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
     * @default LE.Vertices.regularPolygon(50, 3)
     */
    this.vertices = parameters.vertices || LE.Vertices.regularPolygon(50, 3),
    /**
     * @private
     * @property centerPoint
     * @type Object
     * @default LE.Utilities.centerOfVerts(this.vertices)
     */
    this.centerPoint = LE.Utilities.centerOfVerts(this.vertices),
    /**
     * @property colour
     * @type LE.Colour
     * @default new LE.Colour(255, 255, 255, 255)
     */
    this.colour = parameters.colour || new LE.Colour(255, 255, 255, 255)
};

LE.Polygon.prototype = {
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
