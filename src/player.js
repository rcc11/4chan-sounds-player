const components = {
	// Settings must be first.
	settings: require('./components/settings'),
	events: require('./components/events'),
	actions: require('./components/actions'),
	colorpicker: require('./components/settings/colorpicker'),
	controls: require('./components/controls'),
	display: require('./components/display'),
	footer: require('./components/footer'),
	header: require('./components/header'),
	hotkeys: require('./components/hotkeys'),
	minimised: require('./components/minimised'),
	playlist: require('./components/playlist'),
	position: require('./components/position'),
	theme: require('./components/theme'),
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
	_public: [],

	// Build the config from the default
	config: {},

	// Helper function to query elements in the player.
	$: (...args) => Player.container && Player.container.querySelector(...args),
	$all: (...args) => Player.container && Player.container.querySelectorAll(...args),

	// Store a ref to the components so they can be iterated.
	components,

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

			// Show a button to open the player.
			Player.display.createPlayerButton();

			// Render the player, but not neccessarily show it.
			Player.display.render();

			// Expose some functionality via PlayerEvent custom events.
			document.addEventListener('PlayerEvent', e => {
				if (e.detail.action && (MODE === 'development' || Player._public.includes(e.detail.action))) {
					return _.get(Player, e.detail.action).apply(window, e.detail.arguments);
				}
			});
		} catch (err) {
			Player.logError('There was an error initialzing the sound player. Please check the console for details.', err);
			// Can't recover so throw this error.
			throw err;
		}
	},

	/**
	 * Returns the function of Player referenced by name or a given handler function.
	 * @param {String|Function} handler Name to function on Player or a handler function.
	 */
	getHandler: function (handler) {
		return typeof handler === 'string' ? _.get(Player, handler) : handler;
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
	syncTab: (property, callback) => 0 && typeof GM_addValueChangeListener !== 'undefined' && GM_addValueChangeListener(property, (_prop, oldValue, newValue, remote) => {
		remote && callback(newValue, oldValue);
	}),

	/**
	 * Log errors and show an error notification.
	 */
	logError: function (message, error, type) {
		console.error('[4chan sounds player]', message, error);
		if (error instanceof PlayerError) {
			error.error && console.error('[4chan sound player]', error.error);
			message = error.reason;
			type = error.type || type;
		}
		Player.alert(message, type || 'error', 5);
	},

	/**
	 * Show a notification using 4chan X or the native extention.
	 */
	alert: function (content, type = 'info', lifetime = 5) {
		if (isChanX) {
			content = _.element(`<span>${content}</span`);
			document.dispatchEvent(new CustomEvent('CreateNotification', {
				bubbles: true,
				detail: { content, type, lifetime }
			}));
		} else if (typeof Feedback !== 'undefined') {
			Feedback.showMessage(content, type === 'info' ? 'notify' : 'error', lifetime * 1000);
		}
	}
};

// Add each of the components to the player.
for (let name in components) {
	Player[name] = components[name];
	(Player[name].atRoot || []).forEach(k => Player[k] = Player[name][k]);
	(Player[name].public || []).forEach(k => {
		Player._public.push((Player[name].atRoot || []).includes(k) ? k : `${name}.${k}`);
	});
}
