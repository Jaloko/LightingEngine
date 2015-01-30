var keys = [];
var canvas;
var le;
var mousePos = {
	x: 0,
	y: 0
};
var intensity = 40;
var lightSelection = "point";
var radius = 200, angle = 90;
var leftMouseDown = false;
var currentObjectSelected = null;
var objectXoffset, objectYoffset;
var dirAngleRange = 70;

function setupEventListeners() {
    canvas.addEventListener('mousemove', function(evt) {
        mousePos = getMousePos(canvas, evt);
    }, false);

    // Checks for mouse click
    if (canvas.addEventListener) {
        // IE9, Chrome, Safari, Opera
        canvas.addEventListener("mousewheel", onMouseMove, false);
        // Firefox
        canvas.addEventListener("DOMMouseScroll", onMouseMove, false);
    }
    // IE 6/7/8
    else {
        canvas.attachEvent("onmousewheel", onMouseMove);
    }

    canvas.addEventListener("mousedown", function(evt) {
        if(evt.button == 0) {
            if(lightSelection == "point") {
                le.createPointLight(mousePos.x, mousePos.y);
            } else if(lightSelection == "directional") {
                le.createDirectionalLight(mousePos.x, mousePos.y, angle, dirAngleRange);
            } else if(lightSelection == "spot") {
                le.createSpotLight(mousePos.x, mousePos.y, radius);
            }
            leftMouseDown = true;
        }
    }, false);

    canvas.addEventListener("mouseup", function(evt) {
        if(evt.button == 0) {
            leftMouseDown = false;
            currentObjectSelected = null;
        }
    }, false);

    document.body.addEventListener("keydown", function(e) {
        keys[e.keyCode] = true;
    });
     
    document.body.addEventListener("keyup", function(e) {
        keys[e.keyCode] = false;
    });    
}

function onMouseMove(evt) {
     // Multi browser support
    var evt = window.event || evt; // old IE support
    var delta = Math.max(-1, Math.min(1, (evt.wheelDelta || -evt.detail)));

    if(delta > 0) {
        le.incrementColourSpectrum(20);
    } else {
        le.decrementColourSpectrum(20);
    } 
}

function init() {
	canvas = document.getElementById("canvas");

    setupEventListeners();

	le = new LightingEngine(canvas);

    var colour = { r: 25, g: 25, b: 25, a: 255 };

    for(var i = 0; i < 50; i++) {
        le.createPolygon(Math.floor(Math.random() * 1920), Math.floor(Math.random() * canvas.height), Math.floor(Math.random() * 20) + 3, Math.floor(Math.random() * 50) + 5, colour, true); 
    }

    le.setupColourSpectrum();
    le.createPointLight(mousePos.x, mousePos.y);

	le.init();

	update();
}

function update() {
    if(window.innerWidth - 10 != le.gl.viewportWidth || window.innerHeight * 0.7 != le.gl.viewportHeight) {
        le.resize(window.innerWidth - 10, window.innerHeight * 0.7);
    }
    // 1
    if(keys[49] == true) {
        if(lightSelection != "none") {
            le.removeLight(le.lights.length - 1); 
        }
        le.createPointLight(mousePos.x, mousePos.y);
        lightSelection = "point";
    } 
    // 2
    else if(keys[50] == true) {
        if(lightSelection != "none") {
            le.removeLight(le.lights.length - 1); 
        }
        le.createDirectionalLight(mousePos.x, mousePos.y, angle, dirAngleRange);
        lightSelection = "directional";
    }
    // 3
    else if(keys[51] == true) {
        if(lightSelection != "none") {
            le.removeLight(le.lights.length - 1); 
        }
        le.createSpotLight(mousePos.x, mousePos.y, radius);
        lightSelection = "spot";
    }
    else if(keys[52] == true) {
        if(lightSelection != "none") {
            le.removeLight(le.lights.length - 1);
        }
        lightSelection = "none";
    }  
    // A
    else if(keys[65] == true) {
        intensity+=1;
        le.setLightIntensity(intensity);
    } 
    // D
    else if(keys[68] == true) {
        if(intensity <= 0) {
            intensity = 0;
        } else {
            intensity-=1;
        }
        le.setLightIntensity(intensity);
    } 
    // W
    else if(keys[83] == true) {
        if(lightSelection == "directional") {
            angle--;
            if(angle <= 0) {
                angle = 360;
            }
            le.getLight(le.lights.length - 1).setRotation(angle); 
        } else if(lightSelection == "spot") {
            radius--;
            le.getLight(le.lights.length - 1).setRadius(radius);
        }

    }
    // S 
    else if(keys[87] == true) {
        if(lightSelection == "directional") {
            angle++;
            if(angle >= 360) {
                angle = 0;
            }
            le.getLight(le.lights.length - 1).setRotation(angle);
        } else if(lightSelection == "spot") {
            radius++;
            le.getLight(le.lights.length - 1).setRadius(radius);
        }

    }

    if(lightSelection != "none") {
        le.getLight(le.lights.length - 1).setPosition(mousePos.x, Math.abs(mousePos.y - canvas.height));

        le.getLight(le.lights.length - 1).red = le.lightColour.r;
        le.getLight(le.lights.length - 1).green = le.lightColour.g;
        le.getLight(le.lights.length - 1).blue = le.lightColour.b;
        le.getLight(le.lights.length - 1).intensity = le.lightIntensity;
    } else {
        if(currentObjectSelected == null) {
            for(var i = 0; i < le.foreground.length; i++) {
                if(le.checkPointCollision(mousePos.x, Math.abs(mousePos.y - canvas.height), le.getForeground(i))) {
                    if(leftMouseDown == true) {
                        currentObjectSelected = le.getForeground(i);
                        objectXoffset = mousePos.x - currentObjectSelected.x;
                        objectYoffset = Math.abs(mousePos.y - canvas.height) - currentObjectSelected.y;
                    }
                }
            } 
        } else {
            currentObjectSelected.setPosition(mousePos.x - objectXoffset, Math.abs(mousePos.y - canvas.height) - objectYoffset);
        }     
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