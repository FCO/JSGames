var gulp	= require('gulp');
var concat	= require('gulp-concat');
var insert	= require('gulp-insert');
var replace	= require('gulp-replace');
var browserify	= require("gulp-browserify2");
var inject	= require('gulp-inject');
var webserver	= require('gulp-webserver');

gulp.task('levels', function() {
	var levelsPath = 'levels/';
	gulp.src(levelsPath + '*.lvl')
	.pipe(replace("\n", "\\n"))
	.pipe(insert.wrap('"', '"'))
	.pipe(concat('levels.js', { newLine: ',' }))
	.pipe(insert.wrap('module.exports = [', '];'))
	.pipe(gulp.dest(levelsPath));
});

gulp.task('build', ["levels"], function() {
	var js = gulp
		.src("index.js")
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
		.src("*.html")
		.pipe(gulp.dest("build"))
		.pipe(inject(js, {relative: true}))
		.pipe(gulp.dest("build"))
	;
});

gulp.task("watch", ["build"], function() {
	gulp.watch(["**.js", "**.lvl", "**.json"], ['build']);
});

gulp.task("default", ["watch"], function() {
	gulp
		.src("build/")
		.pipe(webserver({
			livereload: true,
			directoryListing: false,
			open: true
		}))
	;
});
