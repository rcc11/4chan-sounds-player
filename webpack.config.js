const fs = require('fs');
const path = require('path');

const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

const pkg = require('./package');

const tplLoader = path.resolve(__dirname, './src/loaders/tpl');
const tplStringLoader = path.resolve(__dirname, './src/loaders/tpl-string');
const replaceLoader = path.resolve(__dirname, './src/loaders/replace');

const header = fs.readFileSync(path.resolve(__dirname, './src/header.js'));
const banner = header.toString().replace('VERSION', pkg.version);

module.exports = (env, argv) => ({
	entry: './src/main.js',
	devtool: 'none',
	mode: argv.mode,
	output: {
		filename: argv.filename
			|| (argv.mode === 'production'
				? '4chan-sounds-player.user.js'
				: '4chan-sounds-player.user.dev.js'),
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
		new webpack.DefinePlugin({ VERSION: JSON.stringify(pkg.version) })
	]
});
