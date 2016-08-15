const gulp = require('gulp');
const typescript = require('typescript');
const ts = require('gulp-typescript');
const babel = require('gulp-babel');
const espower = require('gulp-espower');
const browserify = require('gulp-browserify');
const runseq = require('run-sequence');

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

gulp.task('watch:src', ()=>{
    return gulp.watch('src/*.ts', ['build']);
});

gulp.task('default', ['build']);
gulp.task('build', (cb)=> runseq("build:lib", ["build:dist"], cb));
gulp.task('watch', ['build', "watch:src"]);

