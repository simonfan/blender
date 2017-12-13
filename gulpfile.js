const gulp = require('gulp')
const mocha = require('gulp-mocha')
 
gulp.task('test', () =>
  gulp.src('test/tests/**.js', {read: false})
    // `gulp-mocha` needs filepaths so you can't have any plugins before it 
    .pipe(mocha())
)