const components = {
	// Settings must be first.
	settings: require('./components/settings'),
	controls: require('./components/controls'),
	display: require('./components/display'),
	events: require('./components/events'),
	footer: require('./components/footer'),
	header: require('./components/header'),
	hotkeys: require('./components/hotkeys'),
	minimised: require('./components/minimised'),
	playlist: require('./components/playlist'),
	position: require('./components/position'),
	threads: require('./components/threads'),
	tools: require('./components/tools'),
	userTemplate: require('./components/user-template')
};

// Create a global ref to the player.
const Player = window.Player = module.exports = {
	ns,

	audio: new Audio(),
	sounds: [],
	isHidden: true,
	container: null,
	ui: {},

	// Build the config from the default
	config: {},

	// Helper function to query elements in the player.
	$: (...args) => Player.container && Player.container.querySelector(...args),
	$all: (...args) => Player.container && Player.container.querySelectorAll(...args),

	// Store a ref to the components so they can be iterated.
	components,

	// Get all the templates.
	templates: {
		body: require('./templates/body.tpl'),
		controls: require('./templates/controls.tpl'),
		css: require('./scss/style.scss'),
		footer: require('./templates/footer.tpl'),
		header: require('./templates/header.tpl'),
		hostInput: require('./templates/host_input.tpl'),
		itemMenu: require('./templates/item_menu.tpl'),
		list: require('./templates/list.tpl'),
		player: require('./templates/player.tpl'),
		settings: require('./templates/settings.tpl'),
		threads: require('./templates/threads.tpl'),
		threadBoards: require('./templates/thread_boards.tpl'),
		threadList: require('./templates/thread_list.tpl'),
		tools: require('./templates/tools.tpl'),
		viewsMenu: require('./templates/views_menu.tpl')
	},

	/**
	 * Set up the player.
	 */
	initialize: async function initialize() {
		if (Player.initialized) {
			return;
		}
		Player.initialized = true;
		try {
			Player.sounds = [ ];
			// Run the initialisation for each component.
			for (let name in components) {
				components[name].initialize && await components[name].initialize();
			}

			if (!is4chan) {
				// Add a sounds link in the nav for archives
				const nav = document.querySelector('.navbar-inner .nav:nth-child(2)');
				const li = createElement('<li><a href="javascript:;">Sounds</a></li>', nav);
				li.children[0].addEventListener('click', Player.display.toggle);
			} else if (isChanX) {
				// If it's already known that 4chan X is running then setup the button for it.
				Player.display.initChanX();
			} else {
				// Add the [Sounds] link in the top and bottom nav.
				document.querySelectorAll('#settingsWindowLink, #settingsWindowLinkBot').forEach(function (link) {
					const showLink = createElement('<a href="javascript:;">Sounds</a>', null, { click: Player.display.toggle });
					link.parentNode.insertBefore(showLink, link);
					link.parentNode.insertBefore(document.createTextNode('] ['), link);
				});
			}

			// Render the player, but not neccessarily show it.
			Player.display.render();
		} catch (err) {
			Player.logError('There was an error initialzing the sound player. Please check the console for details.', err);
			// Can't recover so throw this error.
			throw err;
		}
	},

	/**
	 * Compare two ids for sorting.
	 */
	compareIds: function (a, b) {
		const [ aPID, aSID ] = a.split(':');
		const [ bPID, bSID ] = b.split(':');
		const postDiff = aPID - bPID;
		return postDiff !== 0 ? postDiff : aSID - bSID;
	},

	/**
	 * Check whether a sound src and image are allowed and not filtered.
	 */
	acceptedSound: function ({ src, imageMD5 }) {
		try {
			const link = new URL(src);
			const host = link.hostname.toLowerCase();
			return !Player.config.filters.find(v => v === imageMD5 || v === host + link.pathname)
				&& Player.config.allow.find(h => host === h || host.endsWith('.' + h));
		} catch (err) {
			return false;
		}
	},

	/**
	 * Listen for changes
	 */
	syncTab: (property, callback) => typeof GM_addValueChangeListener !== 'undefined' && GM_addValueChangeListener(property, (_prop, oldValue, newValue, remote) => {
		remote && callback(newValue, oldValue);
	}),

	/**
	 * Send an error notification event.
	 */
	logError: function (message, error, type) {
		console.error('[4chan sounds player]', message, error);
		if (error instanceof PlayerError) {
			message = error.reason;
			type = error.type || type;
		}
		document.dispatchEvent(new CustomEvent('CreateNotification', {
			bubbles: true,
			detail: {
				type: type || 'error',
				content: message,
				lifetime: 5
			}
		}));
	}
};

// Add each of the components to the player.
for (let name in components) {
	Player[name] = components[name];
	(Player[name].atRoot || []).forEach(k => Player[k] = Player[name][k]);
}
