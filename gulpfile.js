var gulp	= require('gulp');
var chug	= require('gulp-chug');
var flatten 	= require('gulp-flatten');
var glob	= require('glob');
var path	= require('path');
var webserver	= require('gulp-webserver');

gulp.task('default', ['watch'], function() {
	gulp
		.src("build/")
		.pipe(webserver({
			livereload:		true,
			open:			true,
			directoryListing:	{
				enable:	true,
				path:	"build"
			}
		}))
	;
});

gulp.task("build", function() {
	gulp
		.src( './samples/**/gulpfile.js', { read: false } )
		.pipe( chug({tasks: ["build"]}) )
	;

	gulp
		.src( './samples/**/build/*' )
		.pipe( flatten({ includeParents: 1}) )
		.pipe( gulp.dest('build') )
	;
});

gulp.task("watch", ["build"], function() {
	gulp.watch(["**.js", "**.json"], ['build']);
});

glob.sync("samples/*").forEach(function(filepath) {
	var sample = path.basename(filepath);
	gulp.task(sample, function() {
		gulp
			.src( filepath + '/gulpfile.js', { read: false } )
			.pipe( chug() )
		;
	});
	["build", "watch"].forEach(function(task) {
		gulp.task(sample + ":" + task, function() {
			gulp
				.src( filepath + '/gulpfile.js', { read: false } )
				.pipe( chug({tasks: [task]}) )
			;
		});
	});
});
