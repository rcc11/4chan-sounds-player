module.exports = {
	initialize: function () {
		Player.on('playsound', Player.header.render);
		Player.userTemplate.maintain(Player.header, 'headerTemplate');
	},

	/**
	 * Render the player header.
	 */
	render: function () {
		if (Player.container) {
			Player.$(`.${ns}-header`).innerHTML = Player.templates.header();
		}
	}
};
