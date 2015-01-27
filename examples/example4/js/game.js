var keys = [];
var canvas;
var le, fr;
var mousePos = {
	x: 0,
	y: 0
};
var intensity = 40;
var isActive = true;
var timePaused;

var crateTimer = new Date().getTime();
var crates = [];
var lights = [];

var player = {
    score: 0,
}

var ambientIntensity = 255;
var ambientSwitch = false;

function Crate(x, y, size, fallSpeed, index) {
    this.x = x,
    this.y = y,
    this.size = size,
    this.rot = 0,
    this.fallSpeed = fallSpeed,
    this.index = index
}

function LightObject(x, y, angle) {
    this.x = x,
    this.y = y,
    this.angle = angle
}

function Cannon(x, y, baseIndex, headIndex) {
    this.baseX = x,
    this.baseY = y,
    this.headX = x,
    this.headY = y + 50,
    this.rotation = 0,
    this.baseIndex = baseIndex,
    this.headIndex = headIndex
}

var cannon;

function setupEventListeners() {
    canvas.addEventListener('mousemove', function(evt) {
        mousePos = getMousePos(canvas, evt);
    }, false);

    // Checks for mouse click
    canvas.addEventListener("mousedown", function(evt) {
        if(evt.button == 0) {
            lights.push(new LightObject(canvas.width / 2, 100 - 15, cannon.rotation));
            le.createPointLight(canvas.width / 2, 0);
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
var width = 1280;

function init() {
	canvas = document.getElementById("canvas");
    setupEventListeners();

	le = new LightingEngine(canvas);
    le.setAmbientLight(125, 125, 125, 255);
    le.setupColourSpectrum();
    le.setLightIntensity(100);
	le.init();

    for(var i = 0; i < Math.floor(2560 / 50) + 1; i++) {
        le.createSquare(i * 50, 0, 50, "img/brick.png", false); 
    }

    cannon = new Cannon(canvas.width / 2 - 25, 50, le.foreground.length + 1, le.foreground.length);
    var polygonVertices = [
        {x: 20, y: 0},
        {x: 20, y: 50},
        {x: 30, y: 50},
        {x: 30, y: 0}
    ];
    le.createCustomPolygon(cannon.headX, cannon.headY -15, 50, polygonVertices, "img/cannon-head.png", true);
    le.getForeground(le.foreground.length - 1).setRotationPoint(cannon.headX + 25, cannon.headY - 15);
    le.createSquare(cannon.baseX, cannon.baseY, 50, "img/cannon-base.png", true); 

    fr = new FontRenderer(canvas);
    fr.init();
    fr.setFont("Verdana");
    fr.setFontSize(30);
    fr.setColour(255, 255, 255);
    
	update();
}

function update() {
    resize();
    if(ambientSwitch == false) {
        ambientIntensity+= 0.1;
        if(ambientIntensity >= 255) {
            ambientSwitch = true;
        }
    } else if(ambientSwitch == true) {
        ambientIntensity-= 0.1;
        if(ambientIntensity <= 0) {
            ambientSwitch = false;
        } 
    }
    le.setClearColour(0, ambientIntensity / 2, ambientIntensity, 255);
    le.setAmbientLight(ambientIntensity, ambientIntensity, ambientIntensity, 255);
    if(new Date().getTime() > crateTimer + 1000) {
        crateTimer += 1000;
        crates.push(new Crate(Math.random() * (canvas.width - 50), canvas.height, Math.floor(Math.random() * 50) + 25,Math.floor(Math.random() * 3) + 1, le.foreground.length));
        le.createSquare(crates[crates.length - 1].x, crates[crates.length - 1].y, crates[crates.length - 1].size, "img/crate.png", true);
    }
    var angleRadians = Math.atan2((canvas.height - mousePos.y) - 100, mousePos.x - canvas.width / 2);
    cannon.rotation = angleRadians;
    var angleDegrees = angleRadians * (180/Math.PI) - 90;
    le.getForeground(cannon.headIndex).setRotation(angleDegrees);

    for(var l = 0; l < lights.length; l++) {
        if(lights[l].x < 0 || lights[l].x > canvas.width || lights[l].y < 0 || lights[l].y > canvas.height) {
            le.removeLight(l);
            lights.splice(l, 1); 
            continue;  
        }
        var x = Math.round(10 * Math.cos(lights[l].angle));
        var y = Math.round(10 * Math.sin(lights[l].angle)); 
        lights[l].x += x;
        lights[l].y += y;
        le.getLight(l).setPosition(lights[l].x, lights[l].y);

        for(var c = 0; c < crates.length; c++) {
            if(lights[l].x > crates[c].x && lights[l].x < crates[c].x + crates[c].size) {
                if(lights[l].y > crates[c].y && lights[l].y < crates[c].y + crates[c].size) {
                    player.score += 100 - crates[c].size;
                    le.removeForeground(crates[c].index);
                    crates.splice(c, 1);
                    le.removeLight(l);
                    lights.splice(l, 1); 
                    break;
                }
            }

        }
    }

    for(var c = 0; c < crates.length; c++) {
        crates[c].y-= crates[c].fallSpeed;
        crates[c].rot+= crates[c].fallSpeed;
        var crate = le.getForeground(crates[c].index);
        crate.setRotationPoint(crates[c].x + (crates[c].size / 2), crates[c].y + (crates[c].size / 2));
        crate.setPosition(crates[c].x, crates[c].y);
        crate.setRotation(crates[c].rot);
        if(crates[c].y <= 50) {
            player.score -= crates[c].size;
            le.removeForeground(crates[c].index);
            crates.splice(c, 1);
        }
    }

	le.update();
	render();
	requestAnimationFrame(update);
}

function render() {
	le.render();
    var string = "Score: " + player.score;
    var length = string.length * 17;
    fr.setColour(255, 255, 255);
    fr.drawString("Score: " + player.score, (canvas.width / 2) - length / 2, 30, 256, 32);
}

function resize() {
    le.resize(window.innerWidth, window.innerHeight - 3);
    fr.updateViewport();
    updatePositions();
}

function updatePositions() {
    cannon.baseX = canvas.width / 2 - 25;
    le.getForeground(cannon.baseIndex).setPosition(cannon.baseX, cannon.baseY);
    cannon.headX = canvas.width / 2 - 25;
    le.getForeground(cannon.headIndex).setPosition(cannon.headX, cannon.headY - 15);
    le.getForeground(cannon.headIndex).setRotationPoint(cannon.headX + 25, cannon.headY - 15);
}


function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

window.onfocus = function () { 
    if(isActive == false) {
        var timeDifference = new Date().getTime();
        timeDifference -= timePaused;
        crateTimer += timeDifference; 
    }
    isActive = true;
}; 

window.onblur = function () { 
    if(isActive == true) {
        timePaused = new Date().getTime(); 
    }
    isActive = false;
}; 