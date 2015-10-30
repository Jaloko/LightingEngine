/**
 * The ColourSpectrum class is used to provide an array of HSV colours. The colours 
 * are generated in a way that all the dark and unsaturated colours are left out.
 *
 * @class ColourSpectrum
 * @constructor
 */
LE.ColourSpectrum = function() {
    /**
     * @property colours
     * @type Array
     */
    this.colours = [];

    // Constructor
    var rgbRange = 255;
    var r = rgbRange, g = 0, b = 0;
    // From red to yellow:
    for (var g=0;g<=rgbRange;g++) {
        this.colours.push(new LE.Colour(r, g, b, 255));
    }
    // From yellow to green:
    for (var r=rgbRange;r>=0;r--) {
        this.colours.push(new LE.Colour(r, g, b, 255));
    }
    // From green to blue:
    for (var b=0;b<=rgbRange;b++,g--) {
        this.colours.push(new LE.Colour(r, g, b, 255));
    }
    // From blue to red:
    for (var d=0;d<=rgbRange;d++,b--,r++) {
        this.colours.push(new LE.Colour(r, g, b, 255));
    }

    /**
     * Returns a random colour from the HSV colour spectrum
     *
     * @method random
     * @returns {LE.Colour} colour
     */
    this.random = function() {
        return this.colours[Math.floor(Math.random() * this.colours.length)];
    },
    /**
     * Returns a colour based on the index given
     *
     * @method get
     * @param {Number} index
     * @returns {LE.Colour} colour
     */
    this.get = function(index) {
        if(index > this.colours.length || index < 0) {
            console.error("Index exceeds colour range");
        } else {
            return this.colours[index];
        }
    }
};
