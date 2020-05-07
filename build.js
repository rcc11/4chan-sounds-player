#!/usr/bin/env node
const fs = require('fs');

const minify = require('babel-minify');

let outputPath = './4chan-sounds-player.user.js';

function processFile (path, file) {
	console.log(path);
	return file.toString().replace(/\/\*%(%?) ([^\n%]+) %\*\//g, function(match, stringify, path) {
		const contents = fs.readFileSync('./' + path).toString();
		return processFile(path, stringify ? JSON.stringify(contents) : contents);
	});
};

let output = processFile('main.js', fs.readFileSync('./main.js'));

if (!process.argv.includes('--development')) {
	console.log('Minify');
	output = minify(output).code;
	outputPath = './4chan-sounds-player.user.min.js';
}

// Add the header
output = fs.readFileSync('./header.js') + '\n' + output;

fs.writeFileSync(outputPath, output)
