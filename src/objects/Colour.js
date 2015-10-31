/**
 * The Colour class is used to store the individual channels of colour
 *
 * @class Colour
 * @constructor
 * @param {Number} r Red
 * @param {Number} g Green
 * @param {Number} b Blue
 * @param {Number} a Alpha
 */
LE.Colour = function(r, g, b, a) {
	/**
     * @property r
     * @type Number
     */
    this.r = r,
   	/**
     * @property g
     * @type Number
     */
    this.g = g,
    /**
     * @property b
     * @type Number
     */
    this.b = b,
    /**
     * @property a
     * @type Number
     */
    this.a = a
};