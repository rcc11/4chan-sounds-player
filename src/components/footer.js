module.exports = {
	initialize: function () {
		Player.userTemplate.maintain(Player.footer, 'footerTemplate');
	},

	render: function () {
		if (Player.container) {
			Player.$(`.${ns}-footer`).innerHTML = Player.templates.footer();
		}
	}
};
