const components = {
	controls: /*% components/controls.js %*/,
	display: /*% components/display.js %*/,
	events: /*% components/events.js %*/,
	header: /*% components/header.js %*/,
	hotkeys: /*% components/hotkeys.js %*/,
	playlist: /*% components/playlist.js %*/,
	position: /*% components/position.js %*/,
	settings: /*% components/settings.js %*/,
};

const Player = {
	ns,

	audio: new Audio(),
	sounds: [],
	isHidden: true,
	container: null,
	ui: {},
	_progressBarStyleSheets: {},

	settings: settingsConfig.reduce(function reduceSettings(settings, settingConfig) {
		if (settingConfig.settings) {
			return settingConfig.settings.reduce(reduceSettings, settings);
		}
		return _set(settings, settingConfig.property, settingConfig.default);
	}, {}),

	$: (...args) => Player.container && Player.container.querySelector(...args),

	templates: {
		css: ({ data }) => /*% templates/css.tpl %*/,
		body: ({ data }) => /*% templates/body.tpl %*/,
		header: ({ data }) => /*% templates/header.tpl %*/,
		player: ({ data }) => /*% templates/player.tpl %*/,
		controls: ({ data }) => /*% templates/controls.tpl %*/,
		list: ({ data }) => /*% templates/list.tpl %*/,
		settings: ({ data }) => /*% templates/settings.tpl %*/
	},

	/**
	 * Set up the player.
	 */
	initialize: async function () {
		try {
			Player.sounds = [ ];
			Player.playOrder = [ ];

			// Add each of the components to the player.
			for (let name in components) {
				Player[name] = components[name];
				(Player[name].atRoot || []).forEach(k => Player[k] = Player[name][k]);
			}

			// Load the user settings.
			await Player.settings.load();

			// Run the initialisation for each component.
			for (let name in components) {
				components[name].initialize && components[name].initialize();
			}

			// If it's already known that 4chan X is running then setup the button for it.
			// If not add the the [Sounds] link in the top and bottom nav.
			if (isChanX) {
				Player.display.initChanX()
			} else {
				document.querySelectorAll('#settingsWindowLink, #settingsWindowLinkBot').forEach(function (link) {
					const bracket = document.createTextNode('] [');
					const showLink = document.createElement('a');
					showLink.innerHTML = 'Sounds';
					showLink.href = 'javascript;';
					link.parentNode.insertBefore(showLink, link);
					link.parentNode.insertBefore(bracket, link);
					showLink.addEventListener('click', Player.display.toggle);
				});
			}

			// Render the player, but not neccessarily show it.
			Player.display.render();
		} catch (err) {
			_logError('There was an error intiaizing the sound player. Please check the console for details.');
			console.error('[4chan sounds player]', err);
			// Can't recover so throw this error.
			throw err;
		}
	}
};
