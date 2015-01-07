'use strict';

var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

gulp.task('minify', function () {
  return gulp.src('src/*.js')
  .pipe(uglify())
  .pipe(rename('jqcarousel.min.js'))
  .pipe(gulp.dest('dist/'));
});

gulp.task('default', ['minify']);
