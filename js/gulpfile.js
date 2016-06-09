var fs = require('fs');
var gulp = require('gulp');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');

function compile(watch) {
	var bundler = watchify(browserify('./src/index.js', {debug: true}).transform(babel));

	function rebundle() {
		bundler.bundle()
			.on('error', function(e) {
				console.error(e instanceof Error ? e.stack : 'Error: ' + e);
				this.emit('end');
			})
			.pipe(fs.createWriteStream("../src/main/webapp/resources/scripts/app.js"));
	}

	if(watch) {
		bundler.on('update', function() {
			console.log('-> bundling...');
			rebundle();
		});
	}

	rebundle();
}

gulp.task('build', function() {
	return compile();
});
gulp.task('watch', function() {
	return compile(true);
});

gulp.task('default', ['watch']);
