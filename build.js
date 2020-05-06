#!/usr/bin/env node
const fs = require('fs');

const lodash = require('lodash-cli');
const minify = require('babel-minify');

const lodashArgs = [ 'include=template,get,set', '--production' ];

let outputPath = './4chan-sounds-player.user.js';

if (!process.argv.includes('--skip-lodash')) {
	console.log('lodash', lodashArgs.join(' '));

	lodash(lodashArgs, data => {
		console.log('Built lodash');
		fs.writeFileSync('./lodash.custom.min.js', data.source);
		buildScript();
	});
} else {
	buildScript();
}

function buildScript () {
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

	// Add the header and lodash
	output = fs.readFileSync('./header.js') + '\n' + fs.readFileSync('./lodash.custom.min.js') + '\n' + output;
	
	fs.writeFileSync(outputPath, output)
}
