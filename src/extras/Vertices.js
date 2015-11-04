/**
 * A static class with functions for calculating and returning Vector arrays of shapes
 *
 * @class Vertices
 * @static
 */
LE.Vertices = {
    /**
     * Creates and returns the vertices for a square
     *
     * @method square
     * @param {Number} faceSize
     * @return {Object} vertices
     * @static
     */
    square : function(faceSize) {
        var vertices = [
            {x: 0, y: 0},
            {x: 0, y: faceSize},
            {x: faceSize, y: faceSize},
            {x: faceSize, y: 0}
        ];
        return vertices;
    },
    /**
     * Creates and returns the vertices for a rectangle
     *
     * @method rectangle
     * @param {Number} width
     * @param {Number} height
     * @return {Object} vertices
     * @static
     */
    rectangle : function(width, height) {
        var vertices = [
            {x: 0, y: 0},
            {x: 0, y: height},
            {x: width, y: height},
            {x: width, y: 0}
        ];
        return vertices;
    },
    /**
     * Creates and returns the vertices for a rhombus
     *
     * @method rhombus
     * @param {Number} faceSize
     * @param {Number} angle
     * @return {Object} vertices
     * @static
     */
    rhombus : function(faceSize, angle) {
        var vertices = [ {x: 0, y: 0} ];
        vertices.push({x: Math.sin(LE.Utilities.degToRad(angle)) * faceSize, y: Math.cos(LE.Utilities.degToRad(angle)) * faceSize });
        vertices.push({x: vertices[1].x + faceSize, y: vertices[1].y});
        vertices.push({x: vertices[0].x + faceSize, y: vertices[0].y});
        return vertices;
    },
    /**
     * Creates and returns the vertices for a parallelogram
     *
     * @method parallelogram
     * @param {Number} width
     * @param {Number} height
     * @param {Number} angle
     * @return {Object} vertices
     * @static
     */
    parallelogram : function(width, height, angle) {
        var vertices = [ {x: 0, y: 0} ];
        vertices.push({x: Math.sin(LE.Utilities.degToRad(angle)) * width, y: Math.cos(LE.Utilities.degToRad(angle)) * height });
        vertices.push({x: vertices[1].x + width, y: vertices[1].y});
        vertices.push({x: vertices[0].x + width, y: vertices[0].y});
        return vertices;
    },
    /**
     * Creates and returns the vertices for a trapezium. A trapezium has a pair of parallel sides
     *
     * @method trapezium
     * @param {Number} bottomWidth The bottom width of the trapzium
     * @param {Number} topWidth The top width of the trapezium
     * @param {Number} height The height between the bottom width and the top width
     * @param {Number} topWidthX The X position of the top width
     * @return {Object} vertices
     * @static
     */
    trapezium : function(bottomWidth, topWidth, height, topWidthX) {
        var vertices = [ {x: 0, y: 0} ];
        vertices.push({x: topWidthX, y: height });
        vertices.push({x: vertices[1].x + topWidth, y: vertices[1].y});
        vertices.push({x: vertices[0].x + bottomWidth, y: vertices[0].y});
        return vertices;
    },
    /**
     * Creates and returns the vertices for a trapezoid. A trapezoid has no parallel sides - TO DO
     *
     * @method trapezoid
     * @return {Object} vertices
     * @static
     */
    trapezoid : function() {
        // To do
    },
    /**
     * Creates and returns the vertices for a kite - TO DO
     *
     * @method kite
     * @return {Object} vertices
     * @static
     */
    kite : function() {
        // To do
    },
    /**
     * Creates and returns the vertices for a regular polygon
     *
     * @method regularPolygon
     * @param {Number} faceSize
     * @param {Number} numberOfVertices
     * @return {Object} vertices
     * @static
     */
    regularPolygon : function(faceSize, numberOfVertices) {
        if(numberOfVertices < 3) {
            console.error("A regular polygon cannot have less than 3 vertices.")
        }
        var vertices = [];
        // Half faceSize because it starts of the center of the polygon. We want the faceSize to be
        // the entire width/height
        for(var i = 0; i < numberOfVertices; i++) {
            vertices.push( { x: (Math.sin(i/numberOfVertices*2*Math.PI) * faceSize / 2), 
                y: (Math.cos(i/numberOfVertices*2*Math.PI) * faceSize / 2)} );
        }

        var size = LE.Utilities.sizeFromVerts(vertices);
        for(var i = 0; i < vertices.length; i++) {
            vertices[i].x += size.width / 2;
            vertices[i].y += size.height / 2;
        }
        return vertices;
    }
}
