var gulp	= require('gulp');
var requireDir	= require("require-dir-all");

requireDir("./samples", {recursive: true, includeFiles: /^gulpfile.js$/});

gulp.task('default', function() {});
