module.exports = {
	template: () => Player.userTemplate.build({
		template: Player.config.headerTemplate
			+ `<div class="${ns}-expander" data-direction="nw"></div><div class="${ns}-expander" data-direction="ne"></div>`,
		location: 'header',
		sound: Player.playing,
		defaultName: '4chan Sounds',
		outerClass: `${ns}-col-auto`
	}),

	initialize() {
		Player.userTemplate.maintain(Player.header, 'headerTemplate');
	},

	render() {
		_.elementHTML(Player.$(`.${ns}-header`), Player.header.template());
	}
};
