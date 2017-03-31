const gulp = require('gulp');
const config = require('../config');
const sourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');

function buildScripts() {
  return gulp.src(config.scripts, { cwd: config.src })
  .pipe(sourcemaps.init())
  .pipe(ts({
    allowSyntheticDefaultImports: true,
    declaration: true,
    lib: [
      'dom',
      'es2015',
    ],
    module: 'commonjs',
    moduleResolution: 'node',
    target: 'es5',
  }))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest(config.dest));
}
gulp.task('build', buildScripts);

module.exports = buildScripts;
