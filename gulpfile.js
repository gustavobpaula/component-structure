
const gulp = require('gulp'),
	fs = require('fs'),
	concat = require('gulp-concat'),
	plugins = require('gulp-load-plugins')(),
	cheerio = require('gulp-cheerio'),
	bs = require('browser-sync').create();

//Style
const cssnano = require('cssnano'),
	cssMqpacker = require('css-mqpacker'),
	autoprefixer = require('autoprefixer'),
	flexibility = require('postcss-flexibility');

//Script
const webpack = require('webpack-stream'),
	named = require('vinyl-named');


const componentsPath = {
	scripts: [],
	styles: [],
	images: []
};


const html = () => {

	return gulp.src(['src/index.html'])
		.pipe(cheerio( $ => {
			$('[data-type=component]').each((i, el) => {
				componentsPath.scripts.push(`src/Components/${el.attribs['data-name']}/*.js`);
				componentsPath.styles.push(`src/Components/${el.attribs['data-name']}/*.scss`);
				componentsPath.images.push(`src/Components/${el.attribs['data-name']}/*.{png,jpeg,jpg,gif,svg}`);

				const file = fs.readFileSync(`src/Components/${el.attribs['data-name']}/index.html`, 'utf8');

				$(el).replaceWith(file);

			})

		}))
		.pipe(gulp.dest('dist/'));

};

const scripts = () => {
	return gulp.src(componentsPath.scripts, {allowEmpty: true})
		.pipe(plugins.plumber())
		.pipe(named())
		.pipe(webpack({
			output: {
				filename: 'app.min.js'
			},
			resolve: {
				modules: ['node_modules']
			},
			module: {
				rules: [
					{
						test: /\.js$/,
						exclude: /node_modules\/(?!bootstrap\/).*/,
						use: {
							loader: 'babel-loader?cacheDirectory',
							options: {
								presets: ['@babel/preset-env'],
								plugins: ['@babel/plugin-proposal-object-rest-spread']
							}
						}
					}
				]
			},
			mode: plugins.util.env.production ? 'production' : 'development',
			optimization: {
				minimize: plugins.util.env.production ? true : false,
			},
			devtool: plugins.util.env.production ? '' : 'eval-source-map'
		}))
		.pipe(gulp.dest('dist/'));
}

const style = () => {
	return gulp.src(componentsPath.styles, { allowEmpty: true })
		.pipe(concat('app.css'))
		.pipe(plugins.plumber())
		.pipe(plugins.util.env.production ? plugins.util.noop() : plugins.sourcemaps.init())
		.pipe(plugins.sass({
			errLogToConsole: true,
			outputStyle: plugins.util.env.production ? 'compressed' : 'nested',
			includePaths: [
				'node_modules/'
			]
		}).on('error', plugins.sass.logError))
		.pipe(plugins.util.env.production ? plugins.postcss([
			autoprefixer(),
			flexibility(),
			cssMqpacker(),
			cssnano({
				zindex: false,
				reduceIdents: false
			}),
		]) : plugins.postcss([
			cssMqpacker()
		]))
		.pipe(gulp.dest('dist/'))
		.pipe(bs.stream());
}

const watch = (done) => {
	gulp.watch('src/**/*.scss', gulp.parallel(style));
	gulp.watch('src/**/*.js', gulp.parallel(scripts)).on('change', bs.reload);
	gulp.watch('src/**/*.html', gulp.series(html, gulp.parallel([scripts, style]))).on('change', bs.reload);

	done();
};

const server = () => {
	bs.init({
		server: {
			baseDir: './dist/'
		}
	});
}

gulp.task('watch', gulp.series(html, gulp.parallel([scripts, style, watch])));

gulp.task('default', gulp.series('watch', server));