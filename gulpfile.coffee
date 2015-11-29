gulp = require 'gulp'
ts = require 'gulp-typescript'
rename = require 'gulp-rename'
babel = require 'gulp-babel'
espower = require 'gulp-espower'
coffee = require 'gulp-coffee'
tslint = require 'gulp-tslint'

tsProject = ts.createProject 'src/tsconfig.json',
  typescript: require 'typescript'
  sortOutput: true
  declaration: true


gulp.task 'build:ts', ->
  tsProject.src()
    .pipe ts(tsProject)
    .pipe rename (p) -> p.dirname = p.dirname.replace('src', ''); p
    .pipe babel()
    .pipe gulp.dest 'lib'

gulp.task 'build:test', ->
  gulp.src("test/**/*.coffee")
    .pipe coffee({bare: true}).on("error", console.error.bind(console))
    .pipe espower()
    .pipe gulp.dest 'demo/test'

gulp.task 'tslint', ->
  tsProject.src()
    .pipe(tslint())
    .pipe(tslint.report('verbose'))

gulp.task 'watch:ts', ->
  gulp.watch 'src/**/*.ts', ['build:ts']

gulp.task 'watch:test', ->
  gulp.watch 'test/**/*.coffee', ['build:test']

gulp.task 'watch:tslint', ->
  gulp.watch 'src/**/*.ts', ['tslint']


gulp.task('default', ['build']);
gulp.task('build', ['build:ts', "build:test"]);
gulp.task('watch', ['build', 'watch:ts', "watch:test"]);
