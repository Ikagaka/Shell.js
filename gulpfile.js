const gulp = require('gulp');
const espower = require('gulp-espower');
const browserify = require('gulp-browserify');
const debug = require('gulp-debug');

// test.ts -> dist
gulp.task('build:es5', ()=>{
    return gulp.src("es5/**/*.test.js")
        .pipe(debug())
        .pipe(espower())
        .pipe(browserify())
        .pipe(gulp.dest('dist'));
});


gulp.task('watch:es5', ()=>{
    return gulp.watch('es5/**/*.test.js')
    .on("change", (file)=>{
        console.log("espower", file.path)
        return gulp.src(file.path)
        .pipe(debug())
        .pipe(espower())
        .pipe(browserify())
        .pipe(gulp.dest('dist'));
    });
});

gulp.task('default', ['build']);
gulp.task('build', ["build:es5"]);
gulp.task('watch', ['build', "watch:es5"]);

