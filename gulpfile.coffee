gulp = require 'gulp'
espower = require 'gulp-espower'
coffee = require 'gulp-coffee'

gulp.task 'build:test', ->
  gulp.src("test/**/*.coffee")
    .pipe coffee({bare: true}).on("error", console.error.bind(console))
    .pipe espower()
    .pipe gulp.dest 'demo/test'


gulp.task 'watch:test', ->
  gulp.watch 'test/**/*.coffee', ['build:test']

gulp.task('default', ['build']);
gulp.task('build', ["build:test"]);
gulp.task('watch', ['build:test', "watch:test"]);
