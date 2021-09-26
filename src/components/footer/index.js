module.exports = {
	template: () => Player.userTemplate.build({
		template: Player.config.footerTemplate
			+ `<div class="${ns}-expander" data-direction="sw"></div><div class="${ns}-expander" data-direction="se"></div>`,
		location: 'footer',
		sound: Player.playing,
		defaultName: '4chan Sounds',
		outerClass: `${ns}-col-auto`
	}),

	initialize() {
		Player.userTemplate.maintain(Player.footer, 'footerTemplate');
	},

	render() {
		_.elementHTML(Player.$(`.${ns}-footer`), Player.footer.template());
	}
};
