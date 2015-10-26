var gulp    = require('gulp');
var server  = require('./server');

gulp.task('default', [ 'server' ]);

gulp.task('server', function () {
  server.start();
});
