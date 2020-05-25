const settingsConfig = require('settings');

module.exports = {
	delegatedEvents: {
		click: {
			[`.${ns}-config-button`]: 'settings.toggle',
			[`.${ns}-setting-action`]: 'settings.handleAction',
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
	},

	render: function () {
		Player.$(`.${ns}-settings`).innerHTML = Player.templates.settings();
	},

	forceBoardTheme: function () {
		Player.settings.applyBoardTheme(true);
		Player.settings.save();
	},

	applyBoardTheme: function (force) {
		// Create a reply element to gather the style from
		const div = document.createElement('div');
		div.setAttribute('class', is4chan ? 'post reply' : 'post_wrapper');
		document.body.appendChild(div);
		const style = document.defaultView.getComputedStyle(div);

		// Apply the computed style to the color config.
		const colorSettingMap = {
			'colors.text': 'color',
			'colors.background': 'backgroundColor',
			'colors.odd_row': 'backgroundColor',
			'colors.border': 'borderBottomColor',
			// If the border is the same color as the text don't use it as a background color.
			'colors.even_row': style.borderBottomColor === style.color ? 'backgroundColor' : 'borderBottomColor'
		}
		settingsConfig.find(s => s.property === 'colors').settings.forEach(setting => {
			const updateConfig = force || (setting.default === _get(Player.config, setting.property));
			colorSettingMap[setting.property] && (setting.default = style[colorSettingMap[setting.property]]);
			updateConfig && _set(Player.config, setting.property, setting.default);
		});

		// Clean up the element.
		document.body.removeChild(div);
		delete div;

		// Updated the stylesheet if it exists.
		Player.stylesheet && Player.display.updateStylesheet();

		// Re-render the settings if needed.
		Player.container && Player.settings.render();
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
			// Save the settings.
			return GM.setValue(ns + '.settings', JSON.stringify(settings));
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
			let settings = await GM.getValue(ns + '.settings');
			if (!settings) {
				return;
			}
			try {
				settings = JSON.parse(settings);
				settingsConfig.forEach(function _handleSetting(setting) {
					if (setting.settings) {
						return setting.settings.forEach(subSetting => _handleSetting({
							property: setting.property,
							default: setting.default,
							...subSetting
						}));
					}
					const userVal = _get(settings, setting.property);
					if (userVal !== undefined) {
						_set(Player.config, setting.property, userVal);
					}
				});
			} catch(e) {
				console.error(e);
				return;
			}
		} catch (err) {
			_logError('There was an error loading the sound player settings. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},

	/**
	 * Toggle whether the player or settings are displayed.
	 */
	toggle: function (e) {
		try {
			e.preventDefault();
			if (Player.config.viewStyle === 'settings') {
				Player.display.setViewStyle(Player._preSettingsView || 'playlist');
			} else {
				Player._preSettingsView = Player.config.viewStyle;
				Player.display.setViewStyle('settings');
			}
		} catch (err) {
			_logError('There was an error rendering the sound player settings. Please check the console for details.');
			console.error('[4chan sounds player]', err);
			// Can't recover, throw.
			throw err;
		}
	},

	/**
	 * Handle the user making a change in the settings view.
	 */
	handleChange: function (e) {
		try {
			const input = e.eventTarget;
			const property = input.getAttribute('data-property');
			let settingConfig;
			settingsConfig.find(function searchConfig(setting) {
				if (setting.property === property) {
					return settingConfig = setting;
				}
				if (setting.settings) {
					let subSetting = setting.settings.find(_setting => _setting.property === property);
					return subSetting && (settingConfig = { ...setting, settings: null, ...subSetting });
				}
				return false;
			});

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
				_set(Player.config, property, newValue);

				// Update the stylesheet reflect any changes.
				Player.stylesheet.innerHTML = Player.templates.css();

				// Save the new settings.
				Player.settings.save();

				Player.trigger('config', property, newValue, currentValue);
			}

			// Run any handler required by the value changing
			settingConfig && settingConfig.handler && _get(Player, settingConfig.handler, () => null)(newValue);
		} catch (err) {
			_logError('There was an error updating the setting. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},

	handleKeyChange: function (e) {
		e.preventDefault();
		if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Meta') {
			return;
		}
		e.eventTarget.value = Player.hotkeys.stringifyKey(e);
	},

	handleAction: function (e) {
		e.preventDefault();
		const handlerName = e.eventTarget.getAttribute('data-handler');
		const handler = _get(Player, handlerName);
		handler && handler();
	}
}
