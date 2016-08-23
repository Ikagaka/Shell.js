const gulp = require('gulp');
const espower = require('gulp-espower');
const browserify = require('gulp-browserify');
const debug = require('gulp-debug');

// test.ts -> dist
gulp.task('build:sandbox', ()=>{
    gulp.src("es5/**/*.sandbox.js")
        .pipe(debug({title: "begin"}))
        .pipe(browserify())
        .pipe(debug({title: "end"}))
        .pipe(gulp.dest('dist'));
});
gulp.task('build:test', ()=>{
    gulp.src("es5/**/*.test.js")
        .pipe(debug({title: "begin"}))
        .pipe(espower())
        .pipe(browserify())
        .pipe(debug({title: "end"}))
        .pipe(gulp.dest('dist'));
});


gulp.task('watch:sandbox', ()=>{
    gulp.watch('es5/**/*.sandbox.js')
    .on("change", (file)=>{
        gulp.src(file.path)
            .pipe(debug({title: "begin"}))
            .pipe(browserify())
            .pipe(debug({title: "end"}))
            .pipe(gulp.dest('dist'));
    });
});
gulp.task('watch:test', ()=>{
    gulp.watch('es5/**/*.test.js')
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

