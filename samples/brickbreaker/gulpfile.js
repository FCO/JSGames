var gulp	= require('gulp');
var concat	= require('gulp-concat');
var insert	= require('gulp-insert');
var replace	= require('gulp-replace');
var browserify	= require("gulp-browserify2");
var inject	= require('gulp-inject');
var webserver	= require('gulp-webserver');

gulp.task('default', function() {});

gulp.task('brickbreaker:levels', function() {
	var levelsPath = 'samples/brickbreaker/levels/';
	gulp.src(levelsPath + '*.lvl')
	.pipe(replace("\n", "\\n"))
	.pipe(insert.wrap('"', '"'))
	.pipe(concat('levels.js', { newLine: ',' }))
	.pipe(insert.wrap('module.exports = [', '];'))
	.pipe(gulp.dest(levelsPath));
});

gulp.task('brickbreaker:build', ["brickbreaker:levels"], function() {
	var js = gulp
		.src("samples/brickbreaker/index.js")
		.pipe(browserify({
			fileName: "brickbreaker.js",
			transform: [require("brfs"), require("require-globify")],
			options: {
				debug: true
			}
		}))
		.pipe(gulp.dest("build"))
	;

	gulp
		.src("samples/brickbreaker/*.html")
		.pipe(gulp.dest("build"))
		.pipe(inject(js, {relative: true}))
		.pipe(gulp.dest("build"))
	;
});

gulp.task("brickbreaker:watch", ["brickbreaker:build"], function() {
	gulp.watch(["index.js", "screen.js", "elements/**.js", "samples/brickbreaker/**.js", "samples/brickbreaker/**.lvl", "**.json"], ['brickbreaker:build']);
});

gulp.task("brickbreaker", ["brickbreaker:watch"], function() {
	gulp
		.src("build/")
		.pipe(webserver({
			livereload: true,
			directoryListing: false,
			open: true
		}))
	;
});
