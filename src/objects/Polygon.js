/**
 * The Polygon class is used to render polygonss to the scene. Shadows can be cast off a Polygon, they are cast based on the vertices
 *
 * @class Polygon
 * @constructor
 * @param {Number} x X position
 * @param {Number} y Y position
 * @param {Number} rotation Rotation from its center point
 * @param {Object} vertices Vertices are used in defining the Polygons shape and also to cast shadows
 * @param {LE.Colour} colour The colour of the Polygon
 */
LE.Polygon = function(x, y, rotation, vertices, colour) {
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
     * @property rotation
     * @type Number
     */
    this._rotation = rotation,
    /**
     * @private
     * @property vertices
     * @type Object
     */
    this.vertices = vertices.vertices,
    /**
     * @private
     * @property renderVerts
     * @type Object
     */
    this.renderVerts = vertices.renderVerts,
    /**
     * @private
     * @property centerPoint
     * @type Object
     */
    this.centerPoint = LE.Utilities.centerOfVerts(this.vertices),
    /**
     * @property colour
     * @type LE.Colour
     */
    this.colour = colour
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
