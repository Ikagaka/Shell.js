const gulp = require('gulp');
const coffee = require('gulp-coffee');
const espower = require('gulp-espower');


gulp.task('build:test', ()=>{
    //return gulp.src("es5/test_*.js")
    return gulp.src("test/**/*.coffee")
        .pipe(coffee({bare: true}).on("error", console.error.bind(console)))    
        .pipe(espower())
        //.pipe(gulp.dest('dist'));
        .pipe(gulp.dest('demo/test'));
});

gulp.task('watch:test', ()=>{
    return gulp.watch('es5/test_*.js', ['build:test']);
});

gulp.task('default', ['build']);
gulp.task('build', ["build:test"]);
gulp.task('watch', ['build', "watch:test"]);

