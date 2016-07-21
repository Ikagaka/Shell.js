const gulp = require('gulp');
const tslint = require("tslint");
const typescript = require('typescript')
const ts = require('gulp-typescript');
const babel = require('gulp-babel');
const espower = require('gulp-espower');
const browserify = require('gulp-browserify');
const gtslint = require("gulp-tslint");
const gtsfmt = require('gulp-tsfmt');
const runSequence = require('run-sequence');

const tsProject = ts.createProject('tsconfig.json', {typescript});

gulp.task('build:lib', ()=>{
    return tsProject.src()
        .pipe(ts(tsProject))
        .pipe(babel({presets: ['es2015']}))
        .pipe(gulp.dest('lib'));
});

gulp.task('build:dist', ()=>{
    return gulp.src("lib/*.js")
        .pipe(espower())
        .pipe(browserify())
        .pipe(gulp.dest('dist'));
});

gulp.task("fmt", ()=>{
    return tsProject.src()
        .pipe(gtsfmt())
        .pipe(gulp.dest('fmt'));
});

gulp.task("lint", ()=>{
    tsProject.src()
        .pipe(gtslint({tslint}))
        .pipe(gtslint.report());
});

gulp.task('watch:src', ()=>{
    return gulp.watch('src/*.ts', ['build']);
});

gulp.task('default', ['build']);
gulp.task('build', (cb)=> runSequence("build:lib", ["build:dist"], cb));
gulp.task('watch', ['build', "watch:src"]);