const settingsConfig = require('settings');

module.exports = {
	atRoot: [ 'set' ],

	delegatedEvents: {
		click: {
			[`.${ns}-settings .${ns}-heading-action`]: 'settings.handleAction',
		},
		focusout: {
			[`.${ns}-settings input, .${ns}-settings textarea`]: 'settings.handleChange'
		},
		change: {
			[`.${ns}-settings input[type=checkbox], .${ns}-settings select`]: 'settings.handleChange'
		},
		keydown: {
			[`.${ns}-key-input`]: 'settings.handleKeyChange'
		}
	},

	initialize: async function () {
		// Apply the default board theme as default.
		Player.settings.applyBoardTheme();

		// Apply the default config.
		Player.config = settingsConfig.reduce(function reduceSettings(config, setting) {
			if (setting.settings) {
				setting.settings.forEach(subSetting => {
					let _setting = { ...setting, ...subSetting };
					_set(config, _setting.property, _setting.default);
				});
				return config;
			}
			return _set(config, setting.property, setting.default);
		}, {});

		// Load the user config.
		await Player.settings.load();

		// Listen for the player closing to apply the pause on hide setting.
		Player.on('hide', function () {
			if (Player.config.pauseOnHide) {
				Player.pause();
			}
		});

		// Listen for changes from other tabs
		Player.syncTab('settings', value => Player.settings.apply(value, {
			bypassSave: true,
			applyDefault: true,
			ignore: [ 'viewStyle' ]
		}));
	},

	render: function () {
		if (Player.container) {
			Player.$(`.${ns}-settings`).innerHTML = Player.templates.settings();
		}
	},

	forceBoardTheme: function () {
		Player.settings.applyBoardTheme(true);
		Player.settings.save();
	},

	applyBoardTheme: function (force) {
		// Create a reply element to gather the style from
		const div = createElement(`<div class="${is4chan ? 'post reply style-fetcher' : 'post_wrapper'}"></div>`, document.body);
		const style = document.defaultView.getComputedStyle(div);

		// Apply the computed style to the color config.
		const colorSettingMap = {
			'colors.text': 'color',
			'colors.background': 'backgroundColor',
			'colors.odd_row': 'backgroundColor',
			'colors.border': 'borderBottomColor',
			// If the border is the same color as the text don't use it as a background color.
			'colors.even_row': style.borderBottomColor === style.color ? 'backgroundColor' : 'borderBottomColor'
		};
		settingsConfig.find(s => s.property === 'colors').settings.forEach(setting => {
			const updateConfig = force || (setting.default === _get(Player.config, setting.property));
			colorSettingMap[setting.property] && (setting.default = style[colorSettingMap[setting.property]]);
			updateConfig && Player.set(setting.property, setting.default, { bypassSave: true, bypassRender: true });
		});

		// Clean up the element.
		document.body.removeChild(div);

		// Updated the stylesheet if it exists.
		Player.stylesheet && Player.display.updateStylesheet();

		// Re-render the settings if needed.
		Player.settings.render();
	},

	/**
	 * Update a setting.
	 */
	set: function (property, value, { bypassSave, bypassRender, silent } = {}) {
		const previousValue = _get(Player.config, property);
		if (previousValue === value) {
			return;
		}
		_set(Player.config, property, value);
		!silent && Player.trigger('config', property, value, previousValue);
		!silent && Player.trigger('config:' + property, value, previousValue);
		!bypassSave && Player.settings.save();
		!bypassRender && Player.settings.findDefault(property).showInSettings && Player.settings.render();
	},

	/**
	 * Reset a setting to the default value
	 */
	reset: function (property) {
		let settingConfig = Player.settings.findDefault(property);
		Player.set(property, settingConfig.default);
	},

	/**
	 * Persist the player settings.
	 */
	save: function () {
		try {
			// Filter settings that have been modified from the default.
			const settings = settingsConfig.reduce(function _handleSetting(settings, setting) {
				if (setting.settings) {
					setting.settings.forEach(subSetting => _handleSetting(settings, {
						property: setting.property,
						default: setting.default,
						...subSetting
					}));
				} else {
					const userVal = _get(Player.config, setting.property);
					if (userVal !== undefined && userVal !== setting.default) {
						_set(settings, setting.property, userVal);
					}
				}
				return settings;
			}, {});
			// Show the playlist or image view on load, whichever was last shown.
			settings.viewStyle = Player.playlist._lastView;
			// Store the player version with the settings.
			settings.VERSION = VERSION;
			// Save the settings.
			return GM.setValue('settings', JSON.stringify(settings));
		} catch (err) {
			_logError('There was an error saving the sound player settings. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},

	/**
	 * Restore the saved player settings.
	 */
	load: async function () {
		try {
			let settings = await GM.getValue('settings') || await GM.getValue(ns + '.settings');
			if (settings) {
				Player.settings.apply(settings, { bypassSave: true, silent: true });
			}
		} catch (err) {
			_logError('There was an error loading the sound player settings. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},

	apply: function (settings, opts = {}) {
		if (typeof settings === 'string') {
			settings = JSON.parse(settings);
		}
		settingsConfig.forEach(function _handleSetting(setting) {
			if (setting.settings) {
				return setting.settings.forEach(subSetting => _handleSetting({
					property: setting.property,
					default: setting.default,
					...subSetting
				}));
			}
			if (opts.ignore && opts.ignore.includes(opts.property)) {
				return;
			}
			const value = _get(settings, setting.property, opts.applyDefault ? setting.default : undefined);
			if (value !== undefined) {
				Player.set(setting.property, value, opts);
			}
		});
	},

	/**
	 * Find a setting in the default configuration.
	 */
	findDefault: function (property) {
		let settingConfig;
		settingsConfig.find(function (setting) {
			if (setting.property === property) {
				return settingConfig = setting;
			}
			if (setting.settings) {
				let subSetting = setting.settings.find(_setting => _setting.property === property);
				return subSetting && (settingConfig = { ...setting, settings: null, ...subSetting });
			}
			return false;
		});
		return settingConfig || { property };
	},

	/**
	 * Toggle whether the player or settings are displayed.
	 */
	toggle: function (e) {
		e && e.preventDefault();
		// Blur anything focused so the change is applied.
		let focused = Player.$(`.${ns}-settings :focus`);
		focused && focused.blur();
		if (Player.config.viewStyle === 'settings') {
			Player.playlist.restore();
		} else {
			Player.display.setViewStyle('settings');
		}
	},

	/**
	 * Handle the user making a change in the settings view.
	 */
	handleChange: function (e) {
		try {
			const input = e.eventTarget;
			const property = input.getAttribute('data-property');
			if (!property) {
				return;
			}
			let settingConfig = Player.settings.findDefault(property);

			// Get the new value of the setting.
			const currentValue = _get(Player.config, property);
			let newValue = input[input.getAttribute('type') === 'checkbox' ? 'checked' : 'value'];

			if (settingConfig.parse) {
				newValue = _get(Player, settingConfig.parse)(newValue);
			}
			if (settingConfig && settingConfig.split) {
				newValue = newValue.split(decodeURIComponent(settingConfig.split));
			}

			// Not the most stringent check but enough to avoid some spamming.
			if (currentValue !== newValue) {
				// Update the setting.
				Player.set(property, newValue, { bypassRender: true });

				// Update the stylesheet reflect any changes.
				if (settingConfig.updateStylesheet) {
					Player.display.updateStylesheet();
				}
			}

			// Run any handler required by the value changing
			settingConfig && settingConfig.handler && _get(Player, settingConfig.handler, () => null)(newValue);
		} catch (err) {
			_logError('There was an error updating the setting. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},

	/**
	 * Converts a key event in an input to a string representation set as the input value.
	 */
	handleKeyChange: function (e) {
		e.preventDefault();
		if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Meta') {
			return;
		}
		e.eventTarget.value = Player.hotkeys.stringifyKey(e);
	},

	/**
	 * Handle an action link next to a heading being clicked.
	 */
	handleAction: function (e) {
		e.preventDefault();
		const property = e.eventTarget.getAttribute('data-property');
		const handlerName = e.eventTarget.getAttribute('data-handler');
		const handler = _get(Player, handlerName);
		handler && handler(property);
	}
};
