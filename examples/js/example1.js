var keys = [];
var canvas;
var le;
var mousePos = {
	x: 0,
	y: 0
};
var intensity = 40;

function setupEventListeners() {
    canvas.addEventListener('mousemove', function(evt) {
        mousePos = getMousePos(canvas, evt);
        le.mousePos = mousePos;
    }, false);

    // Checks for mouse click
    canvas.addEventListener("mousedown", function(evt) {
        if(evt.button == 0) {
            le.createLight(mousePos.x, mousePos.y);
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
        le.createPolygon(Math.floor(Math.random() * canvas.width), Math.floor(Math.random() * canvas.height), Math.floor(Math.random() * 20) + 3, Math.floor(Math.random() * 50) + 5); 
    }

    for(var i = 0; i < 50; i++) {
        /*this.createPolygon(Math.floor(Math.random() * this.gl.viewportWidth), Math.floor(Math.random() * this.gl.viewportHeight), Math.floor(Math.random() * 10) + 3, Math.floor(Math.random() * 50) + 5);*/
        
    }
    le.setupColourSpectrum();
    le.createLight(mousePos.x, mousePos.y);

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
    }
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