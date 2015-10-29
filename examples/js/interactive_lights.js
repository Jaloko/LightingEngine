// Lighting Engine Variables
var canvas, scene, renderer, cam, cs;
// Stats
var stats;
// Interactive Lights Example Variables
var light, selectedObject, objectXoffset, objectYoffset;
var mousePos = {x: 0, y: 0};
var lightIndex = 0;
var keys = [65565];
var selectedLight = LE.Lights.POINT_LIGHT;
var dontPlaceLight = false;
var mouseDown = false;

/*-------------------------------------------
	Primary Functions
--------------------------------------------*/
// Called on page load
function init() {
	initStats();
    attachEvents();

    canvas = document.getElementById("canvas");

    scene = new LE.Scene();
    cam = new LE.OrthographicCamera(0, 0);
    // Initialise and prepare renderer
    renderer = new LE.WebGLRenderer({ canvas: canvas, scene: scene, camera: cam } );

    cs = new LE.ColourSpectrum();

    light = new LE.PointLight();
    scene.addLight(light);

    generatePolygons();

    resizeAndCenter();

    // Begin loop
    update();
}

// Application loop
function update() {
	stats.begin();
    // Update logic
	checkKeys();
	updatePrimaryLight();
    selectObject();

	// Render
	render();

	stats.end();
    requestAnimationFrame(update);
}

function render() {
    renderer.clear();
	renderer.render()
}

/*-------------------------------------------
	Helper Functions
--------------------------------------------*/
function initStats() {
	// Init stats
	stats = new Stats();
	stats.setMode(0);
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.right = '0px';
	stats.domElement.style.bottom = '0px';
	document.body.appendChild( stats.domElement );
}

function generatePolygons() {
	for(var i = 0; i < 40; i++) {
    	var rand = Math.floor(Math.random() * 5);
    	if(rand == 0) {
    		generatePolygon(LE.Vertices.rhombus((Math.random() * 60) + 15, (Math.random() * 70) + 10));
    	} else if(rand == 1) {
    		generatePolygon(LE.Vertices.parallelogram((Math.random() * 60) + 15, (Math.random() * 60) + 15, (Math.random() * 70) + 10));
    	} else if(rand == 2 || rand == 3 || rand == 4) {
    		generatePolygon(LE.Vertices.regularPolygon((Math.random() * 35) + 15, Math.floor(Math.random() * 17) + 3));
    	}
    }
}

function generatePolygon(vertices) {
	scene.addShadowObject(new LE.Polygon(
		Math.random() * canvas.width, 
		Math.random() * canvas.height, 
		0, 
		vertices,
		new LE.Colour(0, 0, 0, 0)
	));
}

function updatePrimaryLight() {
	light.x = mousePos.x + cam.x;
	light.y = canvas.height - mousePos.y + cam.y;
	light.colour = cs.get(lightIndex);	
}

function selectObject() {
    if(selectedLight === "None" && mouseDown) {
        for(var i = 0; i < scene.shadowObjects.length; i++) {
            if(LE.Utilities.checkPointCollision(mousePos.x + cam.x, Math.abs(mousePos.y - canvas.height) + cam.y, scene.shadowObjects[i])) {
                selectedObject = scene.shadowObjects[i];
                objectXoffset = mousePos.x - scene.shadowObjects[i].x;
                objectYoffset = Math.abs(mousePos.y - canvas.height) - scene.shadowObjects[i].y;
                break;
            }
        } 
    }  else {
       selectedObject = null; 
    }  
}

function checkKeys() {
	// A
	if(keys[65] == true) {
        light.intensity -= 0.01;
        if(light.intensity < 0.01) {
        	light.intensity = 0.01;
        }
    } 
    // D
    else if(keys[68] == true) {
		light.intensity += 0.01;
		if(light.intensity > 1.0) {
        	light.intensity = 1.0;
        }
    } 
	// W
    else if(keys[83] == true) {
        if(selectedLight == LE.Lights.DIRECTIONAL_LIGHT) {
            light.rotation--;
            if(light.rotation <= 0) {
                light.rotation = 360;
            }
        } else if(selectedLight == LE.Lights.RADIAL_POINT_LIGHT) {
            light.radius--;
        }

    }
    // S 
    else if(keys[87] == true) {
        if(selectedLight == LE.Lights.DIRECTIONAL_LIGHT) {
            light.rotation++;
            if(light.rotation >= 360) {
                light.rotation = 0;
            }
        } else if(selectedLight == LE.Lights.RADIAL_POINT_LIGHT) {
            light.radius++;
        }

    }

    // 1 - Point Light
    if(keys[49] == true) {
    	scene.removeLight(light);
        light = new LE.PointLight( {x: light.x, y: light.y, colour: light.colour, intensity: light.intensity } );
        scene.addLight(light);
        selectedLight = LE.Lights.POINT_LIGHT;
    } 
    // 2 - Directional Light
    else if(keys[50] == true) {
    	scene.removeLight(light);
    	light = new LE.DirectionalLight( {x: light.x, y: light.y, colour: light.colour, intensity: light.intensity } );
	    scene.addLight(light);
        selectedLight = LE.Lights.DIRECTIONAL_LIGHT;
    }
    // 3 - Radial Point Light
    else if(keys[51] == true) {
    	scene.removeLight(light);
        light = new LE.RadialPointLight( {x: light.x, y: light.y, colour: light.colour, intensity: light.intensity } );
       	scene.addLight(light);
        selectedLight = LE.Lights.RADIAL_POINT_LIGHT;
    }
    // 4 - Move Polygons
    else if(keys[52] == true) {
    	scene.removeLight(light);
        selectedLight = "None";
    }  
}

/*-------------------------------------------
	Event Functions
--------------------------------------------*/
// Keeps the content in the center of the window
function resizeAndCenter() {
	renderer.resize(window.innerWidth, window.innerHeight);
   	cam.x = -(window.innerWidth - 960) / 2;
   	cam.y = -(window.innerHeight - 560) / 2;
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function onMouseScroll(e) {
     // Multi browser support
    var evt = window.event || e; // old IE support
    var delta = Math.max(-1, Math.min(1, (evt.wheelDelta || -evt.detail)));
    if(delta > 0) {
        lightIndex += 20;
        if(lightIndex > cs.colours.length) {
        	lightIndex = 0;
        }
    } else {
        lightIndex -= 20;
        if(lightIndex < 0) {
        	lightIndex = cs.colours.length - 1;
        }
    } 
}

function attachEvents() {
    document.getElementById("stats").onmouseover = function() {
        dontPlaceLight = true;
    };

    document.getElementById("stats").onmouseout = function() {
        dontPlaceLight = false;
    };

    document.getElementById("help-box").onmouseover = function() {
        dontPlaceLight = true;
    };

    document.getElementById("help-box").onmouseout = function() {
        dontPlaceLight = false;
    };

    document.getElementById("help-box").addEventListener("mousedown", function() {
        alert("--Interactive Lights Demo Help--\n" +
            "Press: \n" +
            "1 for point light\n" +
            "2 for directional light\n" +
            "3 for radial point light\n" +
            "4 to drag shapes around\n" +
            "A and D to change light intensity\n" +
            "W and S to adjust light rotation or radius\n");
    });

    document.onmousemove = function(e){
        mousePos = getMousePos(canvas, e);
        if(selectedLight === "None") {
            if(selectedObject != null) {
                selectedObject.x = mousePos.x - objectXoffset;
                selectedObject.y = canvas.height - mousePos.y - objectYoffset;
            }
        }
    };
}

/*-------------------------------------------
	Events
--------------------------------------------*/
window.onresize = function(e) {
	resizeAndCenter();
};



// IE9, Chrome, Safari, Opera
document.addEventListener("mousewheel", onMouseScroll, false);
// Firefox
document.addEventListener("DOMMouseScroll", onMouseScroll, false);

document.addEventListener("mousedown", function(e) {
    if(e.button == 0) {
        mouseDown = true;
        if(!dontPlaceLight) {
            if(selectedLight === LE.Lights.POINT_LIGHT) {
                scene.addLight(new LE.PointLight( {x: light.x, y: light.y, colour: light.colour, intensity: light.intensity }));
            }
            else if(selectedLight === LE.Lights.DIRECTIONAL_LIGHT) {
                scene.addLight(new LE.DirectionalLight( {x: light.x, y: light.y, colour: light.colour, intensity: light.intensity, range: light.range, rotation: light.rotation }));
            }
            else if(selectedLight === LE.Lights.RADIAL_POINT_LIGHT) {
                scene.addLight(new LE.RadialPointLight( {x: light.x, y: light.y, colour: light.colour, intensity: light.intensity, radius: light.radius }));
            }
        }
    }
}, false);

document.addEventListener("mouseup", function(e) {
	if(e.button == 0) {
        mouseDown = false;
	}
});

document.addEventListener("keydown", function(e) {
    keys[e.keyCode] = true;
});
 
document.addEventListener("keyup", function(e) {
    keys[e.keyCode] = false;
}); 
