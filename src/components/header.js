module.exports = {
	initialize: function () {
		Player.userTemplate.maintain(Player.header, 'headerTemplate');
	},

	render: function () {
		if (Player.container) {
			Player.$(`.${ns}-header`).innerHTML = Player.templates.header();
		}
	}
};
