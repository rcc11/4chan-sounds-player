const fs = require('fs');
const path = require('path');

const webpack = require("webpack");

const templateLoader = path.resolve(__dirname, './src/loaders/template');
const sassTemplateLoader = path.resolve(__dirname, './src/loaders/sass-template');

const header = fs.readFileSync(path.resolve(__dirname, './src/header.js'));

const ns = 'fc-sounds';

module.exports = {
	entry: './src/main.js',
	devtool: 'none',
	output: {
		filename: '4chan-sounds-player.user.js',
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
					templateLoader
				]
			},
			{
				test: /\.s[ac]ss$/i,
				use: [
					templateLoader,
					{
						loader: sassTemplateLoader,
						options: {
							replacements: [
								[ /__ns__/g, '${ns}' ]
							]
						}
					},
					'sass-loader'
				]
			}
		]
	},
	plugins: [
		new webpack.BannerPlugin({ banner: header.toString(), raw: true })
	]
};