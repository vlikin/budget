var gulp = require('gulp'),
    concat = require('gulp-concat'), // It concats files to a single file.
    sourcemaps = require('gulp-sourcemaps'), // Inline maps are embedded in the source file.
    uglify = require('gulp-uglify'), // Minify JavaScript with UglifyJS2.
    ngAnnotate = require('gulp-ng-annotate'), // Add angularjs dependency injection annotations with ng-annotate.
    plumber = require('gulp-plumber'), // Prevent pipe breaking caused by errors from gulp plugins.
    watch = require('gulp-watch'); // Watch, that actually is an endless stream.

gulp.task('compile_app', function () {
  gulp.src(['src/**/*.js'])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('app.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.'));
});

gulp.task('watch', function () {
  watch('src/**/*.js', function (files, cb) {
    gulp.start('compile_app', cb);
  })
  .pipe(plumber());
});