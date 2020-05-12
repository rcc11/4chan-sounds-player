module.exports = function (content) {
	this.query.replacements.forEach(([ from, to ]) => {
		content = content.replace(from, to)
	});
	return this.value = '`' + content + '`';
};
