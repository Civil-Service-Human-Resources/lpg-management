var gulp = require('gulp');

function locale() {
	return gulp.src("./src/locale/**/*.*")
		.pipe(gulp.dest("./dist/locale"))
}

exports.locale = locale

const setupDist = gulp.parallel(locale)

exports.setupDist = setupDist
