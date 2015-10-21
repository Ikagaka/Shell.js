gulp = require 'gulp'
ts = require 'gulp-typescript'
rename = require 'gulp-rename'
babel = require 'gulp-babel'
espower = require 'gulp-espower'

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
  gulp.src(["demo/original/testShell.js"])
    .pipe espower()
    .pipe gulp.dest 'demo'

gulp.task 'watch:ts', ->
  gulp.watch 'src/**/*.ts', ['build:ts']
  
gulp.task 'watch:test', ->
  gulp.watch 'demo/original/*.js', ['build:test']

gulp.task('default', ['build']);
gulp.task('build', ['build:ts', "build:test"]);
gulp.task('watch', ["build", 'watch:ts', "watch:test"]);
