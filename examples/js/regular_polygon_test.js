var canvas, scene, renderer, cam, objects = [], rotation = 0;
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
    var cs = new LE.ColourSpectrum();
    // Create Lights
    for(var y = 1; y <= 3; y++) {
	    for(var x = 1; x < 5; x++) {
			var light = new LE.PointLight({x: 190 * x, y: (y >= 2) ? (140 * y) : (120 * y), colour: cs.random(), intensity: 0.05});
			scene.addLight(light);
	    }
    }
	// Create Polygons
	var counter = 0;
	for(var y = 0; y <= 3; y++) {
		for(var x = 0; x < 9; x++) {
			objects.push(new LE.Polygon(107 * x, 150 * y, 0, LE.Vertices.regularPolygon(50, counter+ 3), new LE.Colour(0, 0, 0, 0)));
			scene.addObject(objects[objects.length - 1]);
			counter++;
		}
	}

    cam = new LE.OrthographicCamera(0, 0);

    // Initialise and prepare renderer
    renderer = new LE.WebGLRenderer({canvas: canvas });
    renderer.scene = scene;
    renderer.camera = cam;

	resizeAndCenter();

    // Begin loop
    update();
}

function update() {
	stats.begin();

	rotation = rotation >= 360 ? 0 : ++rotation;
	for(var i = 0; i < objects.length; i++) {
		objects[i].rotation = rotation;
	}
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
