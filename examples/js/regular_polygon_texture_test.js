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

    // Add lights
    for(var i = 0; i < 5; i++) {
	    var light =  new LE.PointLight( { x: i * 240, y: 530, colour: new LE.Colour(255, 0, 0, 255), intensity: 0.05 } );
	    scene.addLight(light);
	}

	// Add texture objects
    for(var i = 0; i < 13; i++) {
    	var texture = new LE.Texture( {x: 50 + (i * 10 * (i / 2)), y: 250, vertices: LE.Vertices.regularPolygon(10 * i, 20), textureURL: "images/regular_polygon_texture_test.png" } );
    	scene.addShadowObject(texture);
    }

    // Add more lights
    for(var i = 0; i < 5; i++) {
	    var light =  new LE.PointLight( { x: i * 240, y: 30, colour: new LE.Colour(0, 0, 255, 255), intensity: 0.05 } );
	    scene.addLight(light);
	}


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