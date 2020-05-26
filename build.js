#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const webpack = require('webpack');
const config = require('./webpack.config')(undefined, { mode: 'production' });

const package = require('./package');

const header = fs.readFileSync(path.resolve(__dirname, './src/header.js')).toString().replace('VERSION', package.version);

webpack(config, (err, stats) => {
	console.log(stats.toString({
		colors: true
	}));

	if (err || stats.hasErrors()) {
		return;
	}

	fs.writeFileSync(path.join(__dirname, './dist/4chan-sounds-player.meta.js'), header);
});
