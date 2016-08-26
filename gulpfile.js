const gulp = require('gulp');
const espower = require('gulp-espower');
const browserify = require('gulp-browserify');
const rename = require('gulp-rename');
const debug = require('gulp-debug');

// test.ts -> dist
gulp.task('build:sandbox', ()=>{
    return gulp.src("es5/Sandbox/**/*.js")
        .pipe(debug({title: "begin"}))
        .pipe(rename((o)=>{ o.basename+=".sandbox"; }))
        .pipe(browserify())
        .pipe(debug({title: "end"}))
        .pipe(gulp.dest('dist'));
});
gulp.task('build:test', ()=>{
    return gulp.src("es5/Test/**/*.js")
        .pipe(debug({title: "begin"}))
        .pipe(rename((o)=>{ o.basename+=".test"; }))
        .pipe(espower())
        .pipe(browserify())
        .pipe(debug({title: "end"}))
        .pipe(gulp.dest('dist'));
});


gulp.task('watch:sandbox', ()=>{
    return gulp.watch('es5/Sandbox/**/*.js')
    .on("change", (file)=>{
        gulp.src(file.path)
            .pipe(debug({title: "begin"}))
            .pipe(rename((o)=>{ o.basename+=".sandbox"; }))
            .pipe(browserify())
            .pipe(debug({title: "end"}))
            .pipe(gulp.dest('dist'));
    });
});
gulp.task('watch:test', ()=>{
    return gulp.watch('es5/Test/**/*.js')
    .on("change", (file)=>{
        gulp.src(file.path)
            .pipe(debug({title: "begin"}))
            .pipe(rename((o)=>{ o.basename+=".test"; }))
            .pipe(espower())
            .pipe(browserify())
            .pipe(debug({title: "end"}))
            .pipe(gulp.dest('dist'));
    });
});

gulp.task('default', ['build']);

gulp.task('build', ["build:test", "build:sandbox"]);
gulp.task('watch', ["watch:test", "watch:sandbox"]);
