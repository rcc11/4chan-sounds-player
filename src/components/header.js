module.exports = {
	initialize: function () {
		Player.userTemplate.maintain(Player.header, 'headerTemplate');
	},

	render: function () {
		Player.$(`.${ns}-header`).innerHTML = Player.templates.header();
	}
};
