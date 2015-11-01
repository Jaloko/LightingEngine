var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var header = require('gulp-header');
var addsrc = require('gulp-add-src');
var fs = require('fs');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

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
        default: ['clean-bundle', 'regular-build', 'dependencies', 'regular-combine', 'regular-clean', 'example-stats'],
        dev: ['clean-bundle', 'dev-build', 'dependencies', 'dev-combine', 'dev-clean', 'example-stats']
    }
}

// Delete the final bundled file
gulp.task('clean-bundle', function(){
    return del(['dist/le.min.js']);
});

// Combine the lighting engine source into a single file
gulp.task('regular-build', ['clean-bundle'], function(){
    return gulp.src(config.js)
        .pipe(uglify())
        .pipe(concat('le.js'))
        .pipe(header('/*' + fs.readFileSync('LICENSE', 'utf8') + '*/\n'))
        .pipe(gulp.dest('dist'));
});

// Combine the lighting engine source into a single file
gulp.task('dev-build', ['clean-bundle'], function(){
    return gulp.src(config.js)
        .pipe(concat('le.js'))
        .pipe(header('/*' + fs.readFileSync('LICENSE', 'utf8') + '*/\n'))
        .pipe(gulp.dest('dist'));
});

// Minify dependencies and put them in the dist folder
gulp.task('dependencies', function() {
    // Start with earcut
    return browserify({ entries: ['node_modules/earcut/src/earcut.js'], standalone: "earcut" })
        .bundle()
        .pipe(source('earcut.min.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(header('/*' + fs.readFileSync('node_modules/earcut/LICENSE', 'utf8') + '*/\n'))
        // Finish with gl-matrix
        .pipe(addsrc('node_modules/gl-matrix/dist/gl-matrix-min.js'))
        .pipe(gulp.dest('dist'));
});

// Combine lighting engine build with dependencies into a single file
gulp.task('regular-combine', ['regular-build', 'dependencies'], function() {
    return gulp.src(['dist/gl-matrix-min.js', 'dist/earcut.min.js', 'dist/le.js'])
        .pipe(concat('le.min.js'))
        .pipe(gulp.dest('dist'));
});

// Combine lighting engine build with dependencies into a single file
gulp.task('dev-combine', ['dev-build', 'dependencies'], function() {
    return gulp.src(['dist/gl-matrix-min.js', 'dist/earcut.min.js', 'dist/le.js'])
        .pipe(concat('le.min.js'))
        .pipe(gulp.dest('dist'));
});

// Clean the seperate files
gulp.task('regular-clean', ['regular-combine'], function(){
    return del(['dist/le.js', 'dist/gl-matrix-min.js', 'dist/earcut.min.js']);
});

gulp.task('dev-clean', ['dev-combine'], function(){
    return del(['dist/le.js', 'dist/gl-matrix-min.js', 'dist/earcut.min.js']);
});

// Add the examples stats dependency
gulp.task('example-stats', function(){
    return addsrc('node_modules/stats-js/build/stats.min.js')
        .pipe(gulp.dest('examples/js'));
});

gulp.task('default', config.tasks.default);
gulp.task('dev', config.tasks.dev);