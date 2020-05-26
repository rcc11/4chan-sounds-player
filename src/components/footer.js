module.exports = {
	delegatedEvents: {
		click: {
			[`.${ns}-playing-jump-link`]: () => Player.playlist.scrollToPlaying('center')
		}
	},

	initialize: function () {
		Player.on('playsound', Player.footer.render);
		Player.on('add', Player.footer.render);
		Player.on('config', property => property === 'footerTemplate' && Player.footer.render());
		Player.on('order', () => setTimeout(Player.footer.render, 0));
	},

	render: function () {
		Player.$(`.${ns}-footer`).innerHTML = Player.templates.footer();
	}
};
