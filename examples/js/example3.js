var keys = [];
var canvas;
var le;
var mousePos = {
	x: 0,
	y: 0
};
var intensity = 40;

var images = [
"img/brick.png",
"img/brick2.png",
"img/mossy-brick.png",
"img/ice-brick.png",
"img/dark-brick.png"];

var rot = 0;

var radius = 200;

function setupEventListeners() {
    canvas.addEventListener('mousemove', function(evt) {
        mousePos = getMousePos(canvas, evt);
    }, false);

    // Checks for mouse click
    canvas.addEventListener("mousedown", function(evt) {
        if(evt.button == 0) {
            le.createSpotLight(mousePos.x, mousePos.y, radius);
        }
    }, false);
    canvas.addEventListener("mousewheel", function(evt) {
        var delta = evt.wheelDelta;

        if(delta > 0) {
            le.incrementColourSpectrum(20);
        } else {
            le.decrementColourSpectrum(20);
        }
    }, false);
    document.body.addEventListener("keydown", function(e) {
        keys[e.keyCode] = true;
    });
     
    document.body.addEventListener("keyup", function(e) {
        keys[e.keyCode] = false;
    });    
}


function init() {
	canvas = document.getElementById("canvas");

    setupEventListeners();

	le = new LightingEngine(canvas);
    for(var i = 0; i < 50; i++) {
        le.createSquare(Math.floor(Math.random() * canvas.width), Math.floor(Math.random() * canvas.height), 50, images[Math.floor(Math.random() * 4)], true);
    }

    for(var x = 0; x < canvas.width / 50; x++) {
        for(var y = 0; y < canvas.height / 50; y++) {
            le.createSquare(x * 50, y * 50, 50, "img/stones.png", false);   
        }
    }

    for(var i = 0; i < 50; i++) {
        /*this.createPolygon(Math.floor(Math.random() * this.gl.viewportWidth), Math.floor(Math.random() * this.gl.viewportHeight), Math.floor(Math.random() * 10) + 3, Math.floor(Math.random() * 50) + 5);*/
        
    }
    le.setupColourSpectrum();
    le.setAmbientLight(25, 25, 25, 255);
    le.createSpotLight(mousePos.x, mousePos.y, radius);

	le.init();
	update();
}

function update() {
    if(keys[65] == true) {
        intensity+=1;
        le.setLightIntensity(intensity);
    } else if(keys[68] == true) {
        intensity-=1;
        le.setLightIntensity(intensity);
    } else if(keys[83] == true) {
        radius--;
        le.getLight(le.lights.length - 1).setRadius(radius);
    } else if(keys[87] == true) {
        radius++;
        var light = le.getLight(le.lights.length - 1).setRadius(radius);
    }

    if(rot < 360) {
        rot++;
    } else if(rot >= 360) {
        rot = 0;
    }

    for(var i = 0; i < le.foreground.length; i++) {
        var o = le.getForeground(i);
        o.setRotation(rot);
    }

    le.getLight(le.lights.length - 1).location.x = mousePos.x;
    le.getLight(le.lights.length - 1).location.y = Math.abs(mousePos.y - canvas.height);   
            
    le.getLight(le.lights.length - 1).red = le.lightColour.r;
    le.getLight(le.lights.length - 1).green = le.lightColour.g;
    le.getLight(le.lights.length - 1).blue = le.lightColour.b;
    le.getLight(le.lights.length - 1).intensity = le.lightIntensity;

	le.update();
	render();
	requestAnimationFrame(update);
}

function render() {
	le.render();
}


function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}