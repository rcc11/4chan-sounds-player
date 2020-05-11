const defaultConfig = require('./settings');

const components = {
	controls: require('./components/controls'),
	display: require('./components/display'),
	events: require('./components/events'),
	header: require('./components/header'),
	hotkeys: require('./components/hotkeys'),
	playlist: require('./components/playlist'),
	position: require('./components/position'),
	settings: require('./components/settings')
};

// Create a global ref to the player.
const Player = window.Player = module.exports = {
	ns,

	audio: new Audio(),
	sounds: [],
	isHidden: true,
	container: null,
	ui: {},
	_progressBarStyleSheets: {},

	// Build the config from the default
	config: defaultConfig.reduce(function reduceSettings(config, settingConfig) {
		if (settingConfig.settings) {
			return settingConfig.settings.reduce(reduceSettings, config);
		}
		return _set(config, settingConfig.property, settingConfig.default);
	}, {}),

	// Helper function to query elements in the player.
	$: (...args) => Player.container && Player.container.querySelector(...args),

	// Store a ref to the components so they can be iterated.
	components,

	// Get all the templates.
	templates: {
		css: require('./scss/style.scss'),
		body: require('./templates/body.tpl'),
		header: require('./templates/header.tpl'),
		player: require('./templates/player.tpl'),
		controls: require('./templates/controls.tpl'),
		list: require('./templates/list.tpl'),
		itemMenu: require('./templates/item_menu.tpl'),
		settings: require('./templates/settings.tpl')
	},

	/**
	 * Set up the player.
	 */
	initialize: async function initialize() {
		try {
			Player.sounds = [ ];
			Player.playOrder = [ ];

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
			_logError('There was an error initialzing the sound player. Please check the console for details.');
			console.error('[4chan sounds player]', err);
			// Can't recover so throw this error.
			throw err;
		}
	}
};

// Add each of the components to the player.
for (let name in components) {
	Player[name] = components[name];
	(Player[name].atRoot || []).forEach(k => Player[k] = Player[name][k]);
}
