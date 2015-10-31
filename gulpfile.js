var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var header = require('gulp-header');
var addsrc = require('gulp-add-src');
var fs = require('fs');

var config = {
    js: [
        "src/Le.js",
        "src/objects/Polygon.js",
        "src/objects/Texture.js",
        "src/objects/Colour.js",
        "src/extras/Vertices.js",
        "src/extras/ColourSpectrum.js",
        "src/math/Utilities.js",
        "src/math/Vector2.js",
        "src/lights/AmbientLight.js",
        "src/lights/DirectionalLight.js",
        "src/lights/PointLight.js",
        "src/lights/RadialPointLight.js",
        "src/shaders/Shaders.js",
        "src/shaders/ShaderLib.js",
        "src/cameras/OrthographicCamera.js",
        "src/renderers/WebGLRenderer.js",
        "src/scenes/Scene.js"
    ],
    tasks: {
        default: ['clean', 'regular-build', 'example-stats'],
        dev: ['clean', 'dev-build', 'example-stats']
    }
}

gulp.task('clean', function(){
    return del(['dist/le.min.js']);
    return del(['dist/gl-matrix-min.js']);
});

gulp.task('regular-build', ['clean'], function(){
    return gulp.src(config.js)
    .pipe(uglify())
    .pipe(concat('le.min.js'))
    .pipe(header('/*' + fs.readFileSync('LICENSE', 'utf8') + '*/\n'))
    .pipe(addsrc('node_modules/gl-matrix/dist/gl-matrix-min.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('dev-build', ['clean'], function(){
    return gulp.src(config.js)
    .pipe(concat('le.min.js'))
    .pipe(header('/*' + fs.readFileSync('LICENSE', 'utf8') + '*/\n'))
    .pipe(addsrc('node_modules/gl-matrix/dist/gl-matrix-min.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('example-stats', function(){
    return addsrc('node_modules/stats-js/build/stats.min.js')
    .pipe(gulp.dest('examples/js'));
});

gulp.task('default', config.tasks.default);
gulp.task('dev', config.tasks.dev);