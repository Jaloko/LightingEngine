LE.ColourSpectrum = function() {
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

    this.random = function() {
        return this.colours[Math.floor(Math.random() * this.colours.length)];
    },
    this.get = function(index) {
        if(index > this.colours.length) {
            console.error("Index exceeds colour range");
        } else {
            return this.colours[index];
        }
    }
};
