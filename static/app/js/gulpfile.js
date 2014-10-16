var gulp = require('gulp'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    ngAnnotate = require('gulp-ng-annotate'),
    plumber = require('gulp-plumber'),
    watch = require('gulp-watch');

gulp.task('compile_app', function () {
  gulp.src(['src/**/module.js', 'src/**/*.js'])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('app.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.'))
});

gulp.task('default', function () {
  watch('src/**/*.js', function (files, cb) {
    gulp.start('compile_app', cb);
  })
  .pipe(plumber());
});