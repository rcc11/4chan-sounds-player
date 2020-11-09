const { execFileSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

const pkg = require('./package');

const tplLoader = path.resolve(__dirname, './src/loaders/tpl');
const tplStringLoader = path.resolve(__dirname, './src/loaders/tpl-string');
const replaceLoader = path.resolve(__dirname, './src/loaders/replace');

const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
const hash = execSync('git rev-parse --short HEAD').toString().trim();

module.exports = (env, argv) => {
	const version = pkg.version + (argv['append-hash'] ? '-' + hash : '');
	if (argv.ffmpeg ||  argv['build-ffmpeg']) {
		execFileSync(path.join(__dirname, './build-ffmpeg.sh'));
	}
	// Only require ffmpeg if it's not explicitly set
	const ffmpegVersion = argv.ffmpeg || argv['require-ffmpeg'];
	const ffmpegRequire = ffmpegVersion ? '// @require$1https://raw.githubusercontent.com/rcc11/4chan-sounds-player/' + branch + '/dist/ffmpeg-webm.js\n' : '';

	const filename = argv.filename || `4chan-sounds-player${argv.mode === 'production' ? '' : '-dev'}${ffmpegVersion ? '-ffmpeg' : ''}`;

	const header = fs.readFileSync(path.resolve(__dirname, './src/header.js'));
	const banner = header.toString()
		.replace('VERSION', version)
		.replace(/FILENAME/g, filename)
		.replace(/BRANCH/g, branch)
		.replace(/\/\/ @require(\s+)FFMPEG_REQUIRE\n/, ffmpegRequire);

	return {
		entry: './src/main.js',
		devtool: 'none',
		mode: argv.mode,
		output: {
			filename: (argv.filename || filename) + '.user.js',
			path: argv.path || path.resolve(__dirname, 'dist'),
		},
		optimization: {
			minimizer: [
				new TerserPlugin({
					terserOptions: {
						output: {
							preamble: banner,
							comments: false
						}
					}
				})
			]
		},
		resolve: {
			modules: [
				'./src',
				'./node_modules'
			]
		},
		module: {
			rules: [
				{
					test: /\.tpl$/i,
					use: [
						tplLoader
					]
				},
				{
					test: /\.s[ac]ss$/i,
					use: [
						tplLoader,
						tplStringLoader,
						replaceLoader + '?from=__ns__&to=${ns}',
						'sass-loader'
					]
				}
			]
		},
		plugins: [
			new webpack.IgnorePlugin({ resourceRegExp: /fs/ }),
			new webpack.BannerPlugin({ banner, raw: true }),
			new webpack.DefinePlugin({ VERSION: JSON.stringify(version), MODE: JSON.stringify(argv.mode) })
		]
	};
};
