var mainFragShader = 
	"precision mediump float;" +
	"uniform vec2 lightLocation;" +
	"uniform vec3 lightColor;" +
	"uniform float screenHeight;" +
	"void main() {" +
		"float distance = length(lightLocation - gl_FragCoord.xy);" +
		"float attenuation = 1.0 / distance;" +
		"vec4 color = vec4(attenuation, attenuation, attenuation, pow(attenuation, 3.0)) * vec4(lightColor, 1);" +
		"gl_FragColor = color;" +
	"}";

var mainVertShader = 
	"attribute vec3 aVertexPosition;" +
	"attribute vec4 aVertexColor;" +
	"uniform mat4 uMVMatrix;" +
	"uniform mat4 uPMatrix;" +
	"varying vec4 vColor;" +
	"void main(void) {" +
		"gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);" +
		"vColor = aVertexColor;" +
	"}";
	
var colourFragShader = 
	"precision mediump float;" +
	"uniform vec4 ambientLight;" +
	"varying vec4 vColor;" +
	"void main(void) {" +
		"gl_FragColor = ambientLight * vColor;" +
	"}";

var textureFragShader = 
	"precision mediump float;" +
	"varying vec2 vTextureCoord;" +
	"uniform vec4 ambientLight;" +
	"uniform sampler2D uSampler;" +
	"void main(void) {" +
		"gl_FragColor = ambientLight * texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));" +
	"}";

var textureVertShader = 
	"attribute vec3 aVertexPosition;" +
  	"attribute vec2 aTextureCoord;" +
	"uniform mat4 uMVMatrix;" +
	"uniform mat4 uPMatrix;" +
	"varying vec2 vTextureCoord;" +
	"void main(void) {" +
		"gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);" +
		"vTextureCoord = aTextureCoord;" +
	"}";
