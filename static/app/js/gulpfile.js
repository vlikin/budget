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
    //.pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.'));
});

gulp.task('compile_3pjs', function () {
  gulp.src([
      '../bower_components/angular/angular.js',
      '../bower_components/angular-animate/angular-animate.js',
      '../bower_components/angular-loading-bar/build/loading-bar.js',
      '../bower_components/angular-local-storage/angular-local-storage.js',
      '../bower_components/angular-message-center/dist/message-center.js',
      '../bower_components/angular-mocks/angular-mocks.js',
      '../bower_components/angular-route/angular-route.js',
      '../bower_components/jquery/jquery.js',
      '../bower_components/bootstrap/dist/js/bootstrap.js'
    ])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('3p.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.'));
});

gulp.task('compile_3pcss', function () {
  gulp.src([
      '../bower_components/bootstrap/dist/css/bootstrap.css',
      '../bower_components/bootstrap/dist/css/bootstrap-theme.css',
      '../bower_components/angular-message-center/dist/message-center.css',
      '../bower_components/angular-loading-bar/build/loading-bar.css'
    ])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('3p.css'))
    //.pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.'));
});

gulp.task('watch', function () {
  watch('src/**/*.js', function (files, cb) {
    gulp.start('compile_app', cb);
  })
  .pipe(plumber());
});