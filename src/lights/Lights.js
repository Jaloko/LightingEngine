LE.AmbientLight = function(colour) {
    this.colour = colour
};

LE.PointLight = function(parameters) {
    // Stop error if no parameters given
    if(parameters == null) {
        parameters = { };
    }
    this.type = LE.Lights.POINT_LIGHT,
    this.x = parameters.x || 0,
    this.y = parameters.y || 0,
    this.colour = parameters.colour || new LE.Colour(255, 255, 255, 255),
    this.intensity = parameters.intensity || 0.1,
    this.shader = parameters.shader || LE.LightShaders.POINT_LIGHT;
    if(this.intensity > 1.0 || this.intensity < 0.0) {
        console.error("Light intensity cannot be higher than 1.0 or less than 0.0.");
    }
};

LE.DirectionalLight = function(parameters) {
    // Stop error if no parameters given
    if(parameters == null) {
        parameters = { };
    }
    this.type = LE.Lights.DIRECTIONAL_LIGHT,
    this.x = parameters.x || 0,
    this.y = parameters.y || 0,
    this.rotation = parameters.rotation || 0,
    this.range = parameters.range || 90,
    this.colour = parameters.colour || new LE.Colour(255, 255, 255, 255),
    this.intensity = parameters.intensity || 0.1,
    this.shader = parameters.shader || LE.LightShaders.POINT_LIGHT
    if(this.intensity > 1.0 || this.intensity < 0.0) {
        console.error("Light intensity cannot be higher than 1.0 or less than 0.0.");
    }
};

LE.RadialPointLight = function(parameters) {
    // Stop error if no parameters given
    if(parameters == null) {
        parameters = { };
    }
    this.type = LE.Lights.RADIAL_POINT_LIGHT,
    this.x = parameters.x || 0,
    this.y = parameters.y || 0,
    this.radius = parameters.radius || 200,
    this.colour = parameters.colour || new LE.Colour(255, 255, 255, 255),
    this.intensity = parameters.intensity || 0.1,
    this.shader = parameters.shader || LE.LightShaders.RADIAL_POINT_LIGHT;
    if(this.intensity > 1.0 || this.intensity < 0.0) {
        console.error("Light intensity cannot be higher than 1.0 or less than 0.0.");
    }
};

LE.Lights = {
    POINT_LIGHT : 'PointLight',
    DIRECTIONAL_LIGHT : 'DirectionalLight',
    RADIAL_POINT_LIGHT : 'RadialPointLight'
};

// The values here represent the index in the shaders array - WebGLRenderer.js initShaders() function
LE.LightShaders = {
    POINT_LIGHT : 0,
    POINT_LIGHT2 : 1,
    RADIAL_POINT_LIGHT : 2
}
