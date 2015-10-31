/**
 * A static class with functions for calculating new Vectors
 *
 * @class Vector2
 * @static
 */
LE.Vector2 = {
    /**
     * Subtracts two Vectors together and returns the resulting Vector
     *
     * @method sub
     * @param {Object} vector1
     * @param {Object} vector2
     * @return {Object} newVector
     */
    sub : function(vector1, vector2) {
        var newVector = {
            x: vector1.x - vector2.x,
            y: vector1.y - vector2.y
        }
        return newVector;
    },
    /**
     * Adds two Vectors together and returns the resulting Vector
     *
     * @method add
     * @param {Object} vector1
     * @param {Object} vector2
     * @return {Object} newVector
     */
    add : function(vector1, vector2) {
        var newVector = {
            x: vector1.x + vector2.x,
            y: vector1.y + vector2.y
        };

        return newVector;
    },
    /**
     * Multiplies two Vectors together and returns the resulting Vector
     *
     * @method dot
     * @param {Object} vector1
     * @param {Object} vector2
     * @return {Object} newVector
     */
    dot : function(vector1, vector2) {
        return vector1.x * vector2.x + vector1.y * vector2.y;
    },
    /**
     * Checks if two Vectors are equal
     *
     * @method equal
     * @param {Object} vector1
     * @param {Object} vector2
     * @return {Boolean} isEqual
     */
    equal : function(vector1, vector2) {
        if(vector1.x == vector2.x && vector1.y == vector2.y) {
            return true;
        } else {
            return false;
        }
    },
    /**
     * Multiplies a scale with a Vector and returns the resulting Vector
     *
     * @method scale
     * @param {Object} scale
     * @param {Object} vector
     * @return {Boolean} newVector
     */
    scale : function(scale, vector) {
        var newVector = {
            x : vector.x * scale,
            y : vector.y * scale
        }
        return newVector; 
    }
};
