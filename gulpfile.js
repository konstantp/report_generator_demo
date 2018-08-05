var 
	gulp 		 	= require('gulp'),
	plumber      	= require('gulp-plumber'),
	gutil        	= require('gulp-util'),
	browserify   	= require('browserify'),
	babelify     	= require('babelify'),
	uglify       	= require('gulp-uglify'),
	source       	= require('vinyl-source-stream'),
	eslint       	= require('gulp-eslint'),
	runSequence  	= require('run-sequence'),
	browserSync  	= require('browser-sync'),
	reload   	 	= browserSync.reload(),
	watch		 	= require('gulp-watch');
	sass       	 	= require('gulp-sass'),
	minifyCss   	= require('gulp-minify-css'),
	sassGlob 	 	= require('node-sass-glob'),
	postcss 	 	= require('gulp-postcss'),
	autoprefixer 	= require('autoprefixer'),
	commentsRemove  = require('postcss-discard-comments');


function errorHandler(error) {
	gutil.log([
		(error.name + ' in ' + error.plugin).bold.red,
		'',
		error.message,
		''
	].join('\n'));

	// Run with `--beep`
	if (gutil.env.beep) {
		gutil.beep();
	}

	// Keep gulp from hanging on this task
	this.emit('end');
}

const paths = {
	dist: './dist/',
	scripts: './dist/scripts/',
	styles: './dist/styles/',
};


const processors = [
    autoprefixer({ 
    	browsers: ['> 1%','last 4 versions'], 
        cascade: false
    }),
    commentsRemove,
];


gulp.task('styles', () => (
	gulp.src('app.scss', {
			cwd: 'src/styles',
			nonull: true
		})
		.pipe(plumber({errorHandler: errorHandler}))
		.pipe(sass({
			importer : sassGlob
		}))
		.pipe(postcss(processors))
		.pipe(gulp.dest(paths.styles))
		.pipe(browserSync.reload({stream:true}))
));


gulp.task('lint', () => (
	gulp.src('src/scripts/app.js')
		.pipe(plumber({errorHandler: errorHandler}))
		.pipe(eslint())
		.pipe(eslint.format())
));


gulp.task('scripts', () => (
	browserify({debug: gutil.env.debug})
		.require('src/scripts/app.js', {entry: true})
		.transform(babelify, {presets: ["es2015"]})
		.bundle()
		.on('error', errorHandler)
		.pipe(source('app.js'))
		.pipe(gulp.dest(paths.scripts))
));


gulp.task('server', () => (
	browserSync.init({
	 	proxy: 'localhost/aahatest',
	  	open: false
	})
));


gulp.task('browser-reload', () =>(
	browserSync.reload()
));


gulp.task('watch', () => {
	watch('src/styles/*.scss', () => (
		runSequence(
			'styles'
		)
	));

	watch('src/scripts/*.js', () => (
		runSequence(
			'scripts',
			'browser-reload'
		)
	));
});


gulp.task('production:styles', () => (
   gulp.src( paths.styles + 'app.css')
    .pipe(minifyCss())
    .pipe(gulp.dest(paths.styles))
));


gulp.task('production:scripts', () => (
   gulp.src( paths.scripts + 'app.js')     
    .pipe(uglify())
    .pipe(gulp.dest(paths.scripts))
));


gulp.task('production', () => (
    runSequence(
    	['styles', 'scripts'], 
    	['production:styles', 'production:scripts']
    )
));


gulp.task('default', () => (
	runSequence([
			'scripts',
			'lint'
		],
		'server',
		'watch'
	)
));
