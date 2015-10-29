LE.ShaderLib = {
	pointLightFragShader : 
		"precision mediump float;" +
		"uniform vec2 lightLocation;" +
		"uniform vec3 lightColor;" +
		"void main() {" +
			"float distance = length(lightLocation - gl_FragCoord.xy);" +
			"float attenuation = 1.0 / distance;" +
			"vec4 color = vec4(attenuation, attenuation, attenuation, pow(attenuation, 3.0)) * vec4(lightColor, 1);" +
			"gl_FragColor = color;" +
		"}",

	pointLightFragShader2 :
		"precision mediump float;" +
		"uniform vec2 lightLocation;" +
		"uniform vec3 lightColor;" +
		"void main() {" +
			"float distance = length(lightLocation - gl_FragCoord.xy);" +
			"float attenuation = 1.0 / (1.0 + 0.1*distance + 0.01*distance*distance);" +
			"vec4 color = vec4(attenuation, attenuation, attenuation, pow(attenuation, 3.0)) * vec4(lightColor, 1);" +
			"gl_FragColor = color;" +
		"}",

	mainVertShader :
		"attribute vec3 aVertexPosition;" +
		"attribute vec4 aVertexColor;" +
		"uniform mat4 uMVMatrix;" +
		"uniform mat4 uPMatrix;" +
		"varying vec4 vColor;" +
		"void main(void) {" +
			"gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);" +
			"vColor = aVertexColor;" +
		"}",

	radialPointLightFragShader : 
		"precision mediump float;" +
		"uniform vec2 lightLocation;" +
		"uniform vec3 lightColor;" +
		"uniform float radius;" +
		"void main() {" +
			"float distance  = length( lightLocation - gl_FragCoord.xy );" +
	    	"float intensity = 1.0 - min( distance, radius ) / radius;" +
	    	"gl_FragColor = vec4(intensity, intensity, intensity, 0.1) * vec4(lightColor.r / 10.0, lightColor.g / 10.0, lightColor.b / 10.0, 1);" +
		"}",
		
	colourFragShader : 
		"precision mediump float;" +
		"uniform vec4 ambientLight;" +
		"varying vec4 vColor;" +
		"void main(void) {" +
			"gl_FragColor = ambientLight * vColor;" +
		"}",

	textureFragShader :
		"precision mediump float;" +
		"varying vec2 vTextureCoord;" +
		"uniform vec4 ambientLight;" +
		"uniform sampler2D uSampler;" +
		"void main(void) {" +
			"gl_FragColor = ambientLight * texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));" +
		"}",

	textureVertShader : 
		"attribute vec3 aVertexPosition;" +
	  	"attribute vec2 aTextureCoord;" +
		"uniform mat4 uMVMatrix;" +
		"uniform mat4 uPMatrix;" +
		"varying vec2 vTextureCoord;" +
		"void main(void) {" +
			"gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);" +
			"vTextureCoord = aTextureCoord;" +
		"}"
};