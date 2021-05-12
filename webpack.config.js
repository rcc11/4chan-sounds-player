// eslint-disable-next-line security/detect-child-process
const { execSync } = require('child_process');
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
	const version = pkg.version + (env['append-hash'] ? '-' + hash : '');
	const githubRequire = '// @require$1' + (env.gitcdn ? 'https://gitcdn.link/repo' : 'https://raw.githubusercontent.com');

	const filename = env.filename || `4chan-sounds-player${argv.mode === 'production' ? '' : '-dev'}`;

	const header = fs.readFileSync(path.resolve(__dirname, './src/header.js'));
	const banner = header.toString()
		.replace('VERSION', version)
		.replace(/FILENAME/g, filename)
		.replace(/BRANCH/g, branch)
		.replace(/\/\/ @require(\s+)GITHUB/g, githubRequire);

	return {
		entry: './src/main.js',
		devtool: false,
		mode: argv.mode,
		output: {
			filename: (env.filename || filename) + '.user.js',
			path: env.path || path.resolve(__dirname, 'dist'),
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
					test: /\.svg$/i,
					use: 'raw-loader'
				},
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
			new webpack.DefinePlugin({ VERSION: JSON.stringify(version), MODE: JSON.stringify(argv.mode) }),
			new webpack.ProvidePlugin({
				_: path.resolve(path.join(__dirname, 'src/_')),
				Icons: path.resolve(path.join(__dirname, 'src/icons'))
			})
		]
	};
};
