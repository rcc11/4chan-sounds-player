const fs = require('fs');
const path = require('path');

const webpack = require('webpack');

const tplLoader = path.resolve(__dirname, './src/loaders/tpl');
const tplStringLoader = path.resolve(__dirname, './src/loaders/tpl-string');
const replaceLoader = path.resolve(__dirname, './src/loaders/replace');

const header = fs.readFileSync(path.resolve(__dirname, './src/header.js'));

module.exports = (env, argv) => ({
	entry: './src/main.js',
	devtool: 'none',
	output: {
		filename: argv.mode === 'production'
			? '4chan-sounds-player.user.min.js'
			: '4chan-sounds-player.user.js',
		path: path.resolve(__dirname, 'dist'),
	},
	resolve: {
		modules: [
			'./src'
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
		new webpack.BannerPlugin({ banner: header.toString(), raw: true })
	]
});
