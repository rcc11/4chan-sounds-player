#!/usr/bin/env node
const fs = require('fs');

const minify = require('babel-minify');
const sass = require('node-sass');

const isDev = process.argv.includes('--development') || process.argv.includes('-d');
let outputPath = './4chan-sounds-player.user.js';

// Build the stylesheet
if (!process.argv.includes('--skip-css')) {
	const result = sass.renderSync({
		file: './src/scss/style.scss',
		outputStyle: isDev ? 'expanded' : 'compressed'
	});
	const css = result.css.toString().replace(/__ns__/g, '${ns}');
	fs.writeFileSync('./src/templates/css.tpl', '`' + css + '`');
}

function processFile (path, file) {
	console.log(path);
	return file.toString().replace(/\/\*%(%?) ([^\n%]+) %\*\//g, function(match, stringify, path) {
		const contents = fs.readFileSync('./src/' + path).toString();
		return processFile(path, stringify ? JSON.stringify(contents) : contents);
	});
};

let output = processFile('main.js', fs.readFileSync('./src/main.js'));

if (!isDev) {
	console.log('Minify');
	output = minify(output).code;
	outputPath = './4chan-sounds-player.user.min.js';
}

// Add the header
output = fs.readFileSync('./src/header.js') + '\n' + output;

fs.writeFileSync(outputPath, output)
