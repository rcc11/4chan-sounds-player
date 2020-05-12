const QS = require('querystring');

module.exports = function (content) {
	const { from, to } = QS.parse(this.query.slice(1));
	return this.value = content.replace(new RegExp(from, 'g'), to);
};
