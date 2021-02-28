const createTool = require('./create');
const downloadTool = require('./download');

module.exports = {
	template: require('./templates/tools.tpl'),

	...createTool,
	...downloadTool,

	initialize() {
		createTool.initialize();
	},

	render() {
		_.elementHTML(Player.$(`.${ns}-tools`).innerHTML, Player.tools.template());
		createTool.afterRender();
	},

	toggle() {
		if (Player.config.viewStyle === 'tools') {
			Player.playlist.restore();
		} else {
			Player.display.setViewStyle('tools');
		}
	},

	/**
	 * Encode the decoded input.
	 */
	handleDecoded(e) {
		Player.$(`.${ns}-encoded-input`).value = encodeURIComponent(e.currentTarget.value);
	},

	/**
	 * Decode the encoded input.
	 */
	handleEncoded(e) {
		Player.$(`.${ns}-decoded-input`).value = decodeURIComponent(e.currentTarget.value);
	}
};
