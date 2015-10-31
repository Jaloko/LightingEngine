var canvas, scene, renderer, cam;
var stats;

function initStats() {
	// Init stats
	stats = new Stats();
	stats.setMode(0);
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.right = '0px';
	stats.domElement.style.bottom = '0px';
	document.body.appendChild( stats.domElement );
}

function init() {
	initStats();

    canvas = document.getElementById("canvas");
    scene = new LE.Scene();
    cam = new LE.OrthographicCamera(0, 0);
    // Initialise and prepare renderer
    renderer = new LE.WebGLRenderer({canvas: canvas, scene: scene, camera: cam});

    // Make sure renderer is correct size
	resizeAndCenter();

    // Begin loop
    update();
}

function update() {
	stats.begin();

	render();

	stats.end();
    requestAnimationFrame(update);
}

function render() {
    renderer.clear();
    renderer.render();
}

// Keeps the content in the center of the window
function resizeAndCenter() {
	renderer.resize(window.innerWidth, window.innerHeight);
   	cam.x = -(window.innerWidth - 960) / 2;
   	cam.y = -(window.innerHeight - 560) / 2;
}

window.onresize = function(event) {
	resizeAndCenter();
};