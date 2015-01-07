'use strict';

var gulp = require('gulp'),
    uglify = require('gulp-uglify');

gulp.task('minify', function () {
  return gulp.src('/src/*')
  .pipe(uglify())
  .pipe(gulp.dest('/dist/jqcarousel.min.js'));
});

gulp.task('default', ['minify']);
