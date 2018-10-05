const gulp = require('gulp')
const mocha = require('gulp-mocha')

const path = require('path')
const { exec } = require('child_process')

gulp.task('test', () =>
  gulp.src('test/tests/**.js', {read: false})
    // `gulp-mocha` needs filepaths so you can't have any plugins before it 
    .pipe(mocha())
)

gulp.task('test-run', (done) => {
	const run = exec(`node ${path.join(__dirname, 'cli/index.js')}`)

	run.stdout.pipe(process.stdout)
	run.stderr.pipe(process.stderr)

	run.on('close', (code) => {
		console.log(`child process exited with code ${code}`);
		done()
	})
})
