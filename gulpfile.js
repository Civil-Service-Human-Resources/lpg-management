var gulp = require('gulp');
var ts = require('gulp-typescript');

var tsProject = ts.createProject('tsconfig.json');

function typescript() {
	return tsProject.src()
		.pipe(tsProject()).js.pipe(gulp.dest("./dist"))
}

function locale() {
	return gulp.src("./src/locale/**/*.*")
		.pipe(gulp.dest("./dist/locale"))
}

exports.typescript = typescript
exports.locale = locale

const setupDist = gulp.parallel(locale)
const compile = gulp.series(setupDist, gulp.parallel(typescript))

exports.setupDist = setupDist
exports.compile = compile
