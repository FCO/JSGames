var gulp = require('gulp');
var concat = require('gulp-concat');
var insert = require('gulp-insert');
var replace = require('gulp-replace');

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
