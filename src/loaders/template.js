module.exports = function (content) {
	this.cacheable && this.cacheable();
	this.value = content;
	return 'const settingsConfig = require(\'settings\');\n'
		+ 'module.exports = ({ data }) => ' + content + '';
};
