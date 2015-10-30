/**
 * The primary Lighting Engine module
 *
 * @module LE
 */
var LE = { };

/**
 * A static class containing all the light types
 *
 * @class Lights
 * @static
 */
LE.Lights = {
    /**
     * @property POINT_LIGHT
     * @type String
     * @static
     * @final
     */
    POINT_LIGHT: 'PointLight',
    /**
     * @property DIRECTIONAL_LIGHT
     * @type String
     * @static
     * @final
     */
    DIRECTIONAL_LIGHT: 'DirectionalLight',
    /**
     * @property RADIAL_POINT_LIGHT
     * @type String
     * @static
     * @final
     */
    RADIAL_POINT_LIGHT: 'RadialPointLight'
};

/**
 * A static class containing all the light shader indices
 *
 * @class LightShaders
 * @static
 */
LE.LightShaders = {
    /**
     * @property POINT_LIGHT
     * @type Number
     * @static
     * @final
     */
    POINT_LIGHT: 0,
    /**
     * @property POINT_LIGHT2
     * @type Number
     * @static
     * @final
     */
    POINT_LIGHT2: 1,
    /**
     * @property RADIAL_POINT_LIGHT
     * @type Number
     * @static
     * @final
     */
    RADIAL_POINT_LIGHT: 2
}
