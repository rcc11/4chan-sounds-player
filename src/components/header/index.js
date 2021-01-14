module.exports = {
	template: () => Player.userTemplate.build({
		template: Player.config.headerTemplate,
		location: 'header',
		sound: Player.playing,
		defaultName: '4chan Sounds',
		outerClass: `${ns}-col-auto`
	}),
	
	initialize: function () {
		Player.userTemplate.maintain(Player.header, 'headerTemplate');
	},

	render: function () {
		Player.$(`.${ns}-header`).innerHTML = Player.header.template();
	}
};
