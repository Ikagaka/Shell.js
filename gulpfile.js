const gulp = require('gulp');
const espower = require('gulp-espower');
const browserify = require('gulp-browserify');
const debug = require('gulp-debug');

// test.ts -> dist
gulp.task('build:sandbox', ()=>{
    return gulp.src("es5/Sandbox/**/*.sandbox.js")
        .pipe(debug({title: "begin"}))
        .pipe(browserify())
        .pipe(debug({title: "end"}))
        .pipe(gulp.dest('dist'));
});
gulp.task('build:test', ()=>{
    return gulp.src("es5/Test/**/*.test.js")
        .pipe(debug({title: "begin"}))
        .pipe(espower())
        .pipe(browserify())
        .pipe(debug({title: "end"}))
        .pipe(gulp.dest('dist'));
});


gulp.task('watch:sandbox', ()=>{
    return gulp.watch('es5/Sandbox/**/*.sandbox.js')
    .on("change", (file)=>{
        gulp.src(file.path)
            .pipe(debug({title: "begin"}))
            .pipe(browserify())
            .pipe(debug({title: "end"}))
            .pipe(gulp.dest('dist'));
    });
});
gulp.task('watch:test', ()=>{
    return gulp.watch('es5/Test/**/*.test.js')
    .on("change", (file)=>{
        gulp.src(file.path)
            .pipe(debug({title: "begin"}))
            .pipe(espower())
            .pipe(browserify())
            .pipe(debug({title: "end"}))
            .pipe(gulp.dest('dist'));
    });
});

gulp.task('default', ['build']);
gulp.task('build', ["build:test", "build:sandbox"]);
gulp.task('watch', ["watch:test", "watch:sandbox"]);

