/**
 * A static class with functions for performing calculations
 *
 * @class Utilities
 * @static
 */
LE.Utilities = {
    /**
     * Used to convert pixel positions to WebGL matrix positions
     *
     * @private
     * @method toMatrix
     * @param {Object} gl
     * @param {Number} value
     * @param {Boolean} isWidth
     * @return {Number} newValue
     */
    toMatrix : function(gl, value, isWidth) {
        if(isWidth == true) {
            return (value / gl.viewportWidth * gl.viewportRatio * 2);
        } else {
            return (value / gl.viewportHeight * 2);
        }
    },
    /**
     * Used to convert pixel positions to WebGL matrix positions
     *
     * @private
     * @method vertToMatrix
     * @param {Object} gl
     * @param {Number} x
     * @param {Number} y
     * @return {Object} newVector
     */
    vertToMatrix : function(gl, x, y) {
        return verts = { x: x / gl.viewportWidth * gl.viewportRatio * 2, y: y / gl.viewportHeight * 2 };
    },
    /**
     * Checks if an x and y position is within the bounds provided as parameters
     *
     * @method checkScreenBounds
     * @param {Number} boundX Camera x position
     * @param {Number} boundY Camera y position
     * @param {Number} boundWidth Viewport width
     * @param {Number} boundHeight Viewport height
     * @param {Number} boundXAdditive Extra amount to allow for on x boundaries
     * @param {Number} boundYAdditive Extra amount to allow for on y boundaries
     * @param {Number} testX The x position to test
     * @param {Number} testY The y position to test
     * @return {Boolean}
     */
    checkScreenBounds : function(boundX, boundY, boundWidth, boundHeight, boundXAdditive, boundYAdditive, testX, testY) {
        if(testX >= boundX - boundXAdditive && testX <= boundX + boundWidth + boundXAdditive &&
            testY >= boundY - boundYAdditive && testY <= boundY + boundHeight + boundYAdditive) {
            return true;
        } else {
            return false;
        }
    },
    /**
     * Converts from degrees (angle) to radians
     *
     * @method degToRad
     * @param {Number} degrees
     * @return {Number} radian
     */
    degToRad : function(degrees) {
        return degrees * Math.PI / 180;
    },
    /**
     * Returns the minimum width and height and maximum width and height from a set of vertices
     *
     * @private
     * @method minMaxFromVerts
     * @param {Object} vertcies
     * @return {Object} minAndMax
     */
    minMaxFromVerts : function(vertices) {
        var minWidth = 0, maxWidth = 0, minHeight = 0, maxHeight = 0;
        for(var i = 0; i < vertices.length; i++) {
            if(i == 0) {
                minWidth = vertices[i].x, maxWidth = vertices[i].x;
                minHeight = vertices[i].y, maxHeight = vertices[i].y;
            } else {
                minWidth = vertices[i].x < minWidth ? vertices[i].x : minWidth;
                maxWidth = vertices[i].x > maxWidth ? vertices[i].x : maxWidth;
                minHeight = vertices[i].y < minHeight ? vertices[i].y : minHeight;
                maxHeight = vertices[i].y > maxHeight ? vertices[i].y : maxHeight;
            }
        }  
        return { minWidth: minWidth, maxWidth: maxWidth, minHeight: minHeight, maxHeight: maxHeight };
    },
    /**
     * Returns the total width and height from a set of vertices
     *
     * @private
     * @method sizeFromVerts
     * @param {Object} vertcies
     * @return {Object} widthAndHeight
     */
    sizeFromVerts : function(vertices) {
        var v = this.minMaxFromVerts(vertices);
        return { width: Math.abs(v.maxWidth - v.minWidth), height: Math.abs(v.maxHeight - v.minHeight) };
    },
    /**
     * Returns a Vector container the center point from a set of vertices
     *
     * @private
     * @method centerOfVerts
     * @param {Object} vertcies
     * @return {Object} xAndY
     */
    centerOfVerts : function(vertices) {
        var x = 0;
        var y = 0;
        for(var i = 0; i < vertices.length; i++) {
            x += vertices[i].x;
            y += vertices[i].y;
        }
        x = (x / vertices.length);
        y = (y / vertices.length);
        return { x: x, y: y };
    },
    /**
     * Returns a Vector container the center point from a set of vertices
     *
     * @method checkPointCollision
     * @param {Number} testX X position to be checked
     * @param {Number} testY Y position to be checked
     * @param {LE.Polygon, LE.Texture} object Object to be checked
     * @return {Boolean} isColliding
     */
    checkPointCollision : function(testX, testY, object) {
        // Inner function
        function polygonCollision(nVert, vertX, vertY, testX, testY) {
            var i, j, c = 0;
            for (var i = 0, j = nVert-1; i < nVert; j = i++) {
            if ( ((vertY[i]>testY) != (vertY[j]>testY)) &&
             (testX < (vertX[j]-vertX[i]) * (testY-vertY[i]) / (vertY[j]-vertY[i]) + vertX[i]) )
               c = !c;
            }
            return c;
        }
        // checkPointCollision Function begin
        var nVert = object.vertices.length;
        var vertX = [];
        var vertY = [];
        for(var i = 0; i < nVert; i++) {
            vertX.push(object.x + object.vertices[i].x);
            vertY.push(object.y + object.vertices[i].y);
        }
        var num = polygonCollision(nVert, vertX, vertY, testX, testY);
        if(num == true) {
            return true;
        } else {
            return false;
        } 
    },
};
