var gulp = require('gulp');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');

gulp.task('js', function(){
  return gulp.src('dist/*.umd.js', { sourcemaps: true })
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify({
      output: {
        comments: function(node, comment) {
          if (comment.type === "comment2") {
            // multiline comment
            return /@preserve|@license|@cc_on/i.test(comment.value);
          }
          return false;
        }
      }
    }))
    .pipe(rename(function (path) {
      path.basename = path.basename.replace(/\.umd$/, '');
      path.extname = ".min.js";
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'))
});

gulp.task('default', [ 'js']);