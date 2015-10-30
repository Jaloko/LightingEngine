/**
 * The DirectionalLight class is used to render a light with a limited range of 1-179 degrees. When calculating shadows from this
 * type of light they are calculated from a single point
 *
 * @class DirectionalLight
 * @constructor
 * @param {Object} [parameters] Parameters is an object that contains the DirectionalLights properties
 * @param {Number} [parameters.x=0] X position
 * @param {Number} [parameters.y=0] Y position
 * @param {Number} [parameters.rotation=0] Rotation of the light
 * @param {Number} [parameters.range=0] The range of the light in degrees (angle)
 * @param {LE.Colour} [parameters.colour=new LE.Colour(255, 255, 255, 255)] Colour, default is white
 * @param {Number} [parameters.intensity=0.1] Light intensity/brightness
 * @param {Number} [parameters.shader=LE.LightShaders.POINT_LIGHT] Index of the shader used during rendering
 */
LE.DirectionalLight = function(parameters) {
    // Stop error if no parameters given
    if(parameters == null) {
        parameters = { };
    }
    /**
     * Automatically generated on creation
     *
     * @property type
     * @type String 
     */
    this.type = LE.Lights.DIRECTIONAL_LIGHT,
    /**
     * @property x
     * @type Number 
     */
    this.x = parameters.x || 0,
    /**
     * @property y
     * @type Number 
     */
    this.y = parameters.y || 0,
    /**
     * @property rotation
     * @type Number 
     */
    this.rotation = parameters.rotation || 0,
    /**
     * @property range
     * @type Number 
     */
    this.range = parameters.range || 90,
    /**
     * @property colour
     * @type LE.Colour 
     */
    this.colour = parameters.colour || new LE.Colour(255, 255, 255, 255),
    /**
     * @property intensity
     * @type Number 
     */
    this.intensity = parameters.intensity || 0.1,
    /**
     * @property shader
     * @type Number 
     */
    this.shader = parameters.shader || LE.LightShaders.POINT_LIGHT
    if(this.intensity > 1.0 || this.intensity < 0.0) {
        console.error("Light intensity cannot be higher than 1.0 or less than 0.0.");
    }
};
