/**
 * Created by danfma on 05/03/15.
 */

var gulp = require("gulp"),
    concat = require("gulp-concat"),
    tsc = require("gulp-tsc"),
    rename = require("gulp-rename"),
    ignore = require("gulp-ignore"),
    minifyCSS = require("gulp-minify-css"),
    uglify = require("gulp-uglify"),
    less = require("gulp-less");


var environment = "development";

/**
 * Completa o caminho para um caminho no diretório de componentes do bower.
 */
function fromBower(path) {
    return "./bower_components/" + path;
}

gulp.task("copyResources", function() {
    return gulp
        .src([
            fromBower("bootstrap/dist/**/*.ttf"),
            fromBower("bootstrap/dist/**/*.woff"),
            fromBower("bootstrap/dist/**/*.woff2"),
            fromBower("bootstrap/dist/**/*.eot"),
            fromBower("bootstrap/dist/**/*.svg"),
            fromBower("leaflet/dist/**/*.jpg"),
            fromBower("leaflet/dist/**/*.png"),
            fromBower("leaflet/dist/**/*.svg"),
            fromBower("mapbox.js/**/*.jpg"),
            fromBower("mapbox.js/**/*.png"),
            fromBower("mapbox.js/**/*.svg"),
            fromBower("font-awesome/**/*.otf"),
            fromBower("font-awesome/**/*.eot"),
            fromBower("font-awesome/**/*.svg"),
            fromBower("font-awesome/**/*.ttf"),
            fromBower("font-awesome/**/*.woff"),
            fromBower("font-awesome/**/*.woff2"),
            fromBower("leaflet-draw/dist/**/*.png"),
            "./lib/**/*.png",
            "app/**/*.png",
            "app/**/*.html",
            "app/**/*.jpg"
        ])
        .pipe(gulp.dest("./dist"));
});

gulp.task("copySharedResources", function() {
    return gulp
        .src([
            "./app/shared/**/*.png",
            "./app/shared/**/*.html",
            "./app/shared/**/*.jpg"
        ])
        .pipe(gulp.dest("./dist/dashboard"));
});

gulp.task("bundleCSS", function() {
    gulp.src("./app/**/*.less")
        .pipe(less())
        .pipe(minifyCSS())
        .pipe(gulp.dest("./app"));

    var filesToBundle = [
        fromBower("bootstrap/dist/css/bootstrap.css"),
        fromBower("bootstrap/dist/css/bootstrap-theme.css"),
        fromBower("font-awesome/css/font-awesome.css"),
        fromBower("nvd3/nv.d3.css"),
        fromBower("mapbox.js/mapbox.css"),
        "./lib/css/MarkerCluster.css",
        "./lib/css/MarkerCluster.Default.css",
        "app/**/*.css"
    ];

    return gulp.src(filesToBundle)
        .pipe(concat("gogeo-tweet.css"))
        .pipe(minifyCSS({keepBreaks:true}))
        .pipe(gulp.dest("./dist"));
});

gulp.task("bundleCoreJS", function() {
    var filesToBundle = [
        fromBower("jquery/dist/jquery.js"),
        fromBower("bootstrap/dist/js/bootstrap.js"),
        fromBower("angular/angular.js"),
        fromBower("angular-route/angular-route.js"),
        fromBower("mapbox.js/mapbox.js"),
        fromBower("leaflet-plugins/layer/tile/Google.js"),
        fromBower("rxjs/dist/rx.lite.js"),
        fromBower("rxjs/dist/rx.lite.compat.js"),
        fromBower("linqjs/linq.js"),
        fromBower("numeral/min/numeral.min.js"),
        fromBower("numeral/min/languages.min.js"),
        fromBower("momentjs/min/moment-with-locales.min.js"),
        fromBower("d3/d3.min.js"),
        fromBower("nvd3/nv.d3.min.js"),
        fromBower("angular-nvd3/dist/angular-nvd3.min.js"),
        fromBower("angular-capitalize-filter/capitalize.min.js"),
        fromBower("angular-touch/angular-touch.min.js"),
        fromBower("venturocket-angular-slider/build/angular-slider.min.js"),
        fromBower("underscore/underscore-min.js"),
        "app/shared/support/rx-angular.js",
        "app/shared/support/utilities.js",
        "./lib/js/leaflet.tilecluster.js",
        "./config/" + environment + ".js"
    ];

    return gulp.src(filesToBundle)
        .pipe(concat("gogeo-core.js"))
        .pipe(uglify())
        .pipe(gulp.dest("./dist"));
});

/**
 * Agrupa todos os javascripts em um bundle único.
 */
gulp.task("bundleTS", function() {
    return gulp.src("./app/**/*.ts")
        .pipe(tsc({ out: "gogeo-tweet.js", target: "ES5" }))
        .pipe(rename("gogeo-tweet.js"))
        .pipe(gulp.dest("./dist"));
});

gulp.task("default", [
    "copyResources",
    "copySharedResources",
    "bundleCSS",
    "bundleTS",
    "bundleCoreJS"
]);

gulp.task("deploy", function() {
    environment = "deployment";
    gulp.start("default");
});

gulp.task("watch", ["default"], function() {
    gulp.watch(["./app/**/*.ts"], ["bundleTS"]);
    gulp.watch(["./app/**/*.less"], ["bundleCSS"]);
    gulp.watch(["./app/**/*.html"], ["copyResources"]);
    gulp.watch(["./app/shared/**/*.png"], ["copySharedResources"]);
});