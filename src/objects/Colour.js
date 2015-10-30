/**
 * The Colour class is used to store the individual channels of colour
 *
 * @class Colour
 * @constructor
 * @param {Number} r Red of the colour
 * @param {Number} g Green of the colour
 * @param {Number} b Blue of the colour
 * @param {Number} a Alpha of the colour
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