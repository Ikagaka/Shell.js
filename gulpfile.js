var path = require('path');
var gulp = require('gulp');
var loadPlugins = require('gulp-load-plugins');
var $ = loadPlugins();
var webpackStream = require('webpack-stream');

var webpack_config = require('./webpack.config.js');
var tsconfig = require('./tsconfig.json');

const build_targets = ['es5', 'web'];

const dirs = {
  src: 'src',
  es5: 'es5',
  web: 'web',
  doc: 'doc',
  bower_components: 'web/lib',
};

const files = {
  src: {
    ts: path.join(dirs.src, '**/*.ts'),
  },
  test: {
    js: 'test/**/*.js',
  },
  mock: {
    js: 'mock/**/*.js',
  },
  conf: {
    js: '*.js',
  },
  doc: 'doc/**/*',
};

var src = {
    jade: 'src/**/*.jade',
    stylus: 'src/**/*.styl',
    ts: 'src/**/*.ts',
};

function notify_success(title, message = '<%= file.relative %>', onLast = false, sound = false) {
  return $.notify({ title: title, message: message, onLast: onLast, sound: false })
}

function notify_end(title, sound = false) {
  return notify_success(title, 'complete', true, sound);
}

function notify_error(title, sound = true) {
  return $.notify.onError({ title: title, message: 'Error: <%= error.message %>', sound: sound });
}

gulp.task('default', ['build']);

gulp.task('build', build_targets);

gulp.task('es5', ['ts-es5', 'test-node', 'lint', 'doc']);
gulp.task('web', ['ts-web', 'test-browser', 'lint', 'doc']);
gulp.task('clean', ['clean-es5', 'clean-web', 'clean-doc', 'clean-coverage']);

gulp.task('jade', function () {
  gulp.src(src.jade)
    .pipe($.plumber({ errorHandler: notify_error('jade') }))
    .pipe($.jade())
    .pipe(gulp.dest('dst'))
    .pipe(notify({ title: 'jade', message: 'built' }));
});

gulp.task('stylus', function () {
  gulp.src(src.stylus)
    .pipe($.plumber({ errorHandler: notify_error('stylus') }))
    .pipe($.stylus())
    .pipe(gulp.dest('dst'))
    .pipe(notify({ title: 'stylus', message: 'built' }));
});

gulp.task('ts-es5', function () {
  return gulp.src(src.ts)
    .pipe($.plumber({ errorHandler: notify_error('ts-es5') }))
    .pipe($.typescript($.typescript.createProject(tsconfig)))
    .pipe(gulp.dest(tsconfig.outDir));
});

gulp.task('ts-web', function () {
  return gulp.src(Object.keys(webpack_config.entry).map((name) => webpack_config.entry[name]))
    .pipe($.plumber({ errorHandler: notify_error('ts-web') }))
    .pipe(webpackStream(webpack_config))
    .pipe(gulp.dest(webpack_config.output.path))
});

gulp.task('test-node', function() {});
gulp.task('test-browser', function() {});

gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: "web",
      index: "index.html",
    }
  });
});

gulp.task('watch', ['browser-sync', 'watch-jade', 'watch-stylus', 'watch-ts']);

gulp.task('watch-jade', function (cb) {
    gulp.start(['jade']);
    return $.watch(src.jade, function () { gulp.start('jade') });
});

gulp.task('watch-stylus', function (cb) {
    gulp.start(['stylus']);
    return $.watch(src.stylus, function () { gulp.start('stylus') });
});

gulp.task('watch-ts', function (cb) {
    gulp.start(['ts']);
    return $.watch('src/**/*.ts', function () { gulp.start('ts') });
});
