'use strict';

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var crx = require('gulp-crx-pack');
var clean = require('gulp-clean');
var manifest = require('./src/manifest.json');
var fs = require('fs');

var filePath = ['src/*.js'];
var buildPath = './build';

gulp.task('clean', function () {
  return gulp.src(buildPath)
    .pipe(clean());
});

gulp.task('copy', ['clean'], function () {
  return gulp.src(['./src/icon/*', './src/manifest.json'])
    .pipe(gulp.dest(buildPath));
});

gulp.task('compress', ['clean'], function() {
  return gulp.src(filePath)
    .pipe(uglify({
      preserveComments: 'license'
    }))
    .pipe(gulp.dest(buildPath));
});

gulp.task('crx', ['compress', 'copy'], function() {
  return gulp.src(buildPath)
    .pipe(crx({
      privateKey: fs.readFileSync('./Open-Image.pem', 'utf8'),
      filename: manifest.name + '.crx'
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('watch', function() {
  gulp.watch(filePath, ['compress']);
});

gulp.task('default', ['compress', 'watch']);

gulp.task('build', ['crx']);
