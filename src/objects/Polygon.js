LE.Polygon = function(x, y, rotation, vertices, colour) {
    this.x = x,
    this.y = y,
    this._rotation = rotation,
    this.vertices = vertices.vertices,
    this.renderVerts = vertices.renderVerts,
    this.centerPoint = LE.Utilities.centerOfVerts(this.vertices),
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
