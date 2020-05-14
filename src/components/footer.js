module.exports = {
	initialize: function () {
		Player.on('playsound', Player.footer.render);
		Player.on('add', Player.footer.render);
		Player.on('config', property => property === 'footerTemplate' && Player.footer.render());
	},

	render: function () {
		Player.$(`.${ns}-footer`).innerHTML = Player.templates.footer();
	}
};
