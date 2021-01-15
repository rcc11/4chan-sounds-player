module.exports = {
	template: () => Player.userTemplate.build({
		template: Player.config.footerTemplate
			+ `<div class="${ns}-expander" data-direction="sw"></div><div class="${ns}-expander" data-direction="se"></div>`,
		location: 'footer',
		sound: Player.playing,
		defaultName: '4chan Sounds',
		outerClass: `${ns}-col-auto`
	}),

	initialize: function () {
		Player.userTemplate.maintain(Player.footer, 'footerTemplate');
	},

	render: function () {
		if (Player.container) {
			Player.$(`.${ns}-footer`).innerHTML = Player.footer.template();
		}
	}
};
