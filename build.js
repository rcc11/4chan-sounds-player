#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const webpack = require('webpack');
const { userInfo } = require('os');
const config = require('./webpack.config')(undefined, {
	mode: 'production',
	ffmpeg: !!process.argv.includes('--ffmpeg'),
	'build-ffmpeg': !!process.argv.includes('--build-ffmpeg'),
	'require-ffmpeg': !!process.argv.includes('--require-ffmpeg')
});
const bannerPlugin = config.plugins.find(plugin => plugin instanceof webpack.BannerPlugin);
const header = bannerPlugin.options.banner;

webpack(config, (err, stats) => {
	console.log(stats.toString({
		colors: true
	}));

	if (err || stats.hasErrors()) {
		return;
	}

	fs.writeFileSync(path.join(__dirname, './dist/' + config.output.filename.replace('.user.js', '.meta.js')), header);
});
