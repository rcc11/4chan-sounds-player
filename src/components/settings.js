{
	delegatedEvents: {
		click: {
			[`.${ns}-config-button`]: 'settings.toggle'
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

	/**
	 * Persist the player settings.
	 */
	save: function () {
		try {
			return GM.setValue(ns + '.settings', JSON.stringify(Player.settings));
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
			} catch(e) {
				return;
			}
			_mix(Player.settings, settings);
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
			if (Player.settings.viewStyle === 'settings') {
				Player.display.setViewStyle(Player._preSettingsView || 'playlist');
			} else {
				Player._preSettingsView = Player.settings.viewStyle;
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
			const currentValue = _get(Player.settings, property);
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
				_set(Player.settings, property, newValue);

				// Update the stylesheet reflect any changes.
				Player.stylesheet.innerHTML = Player.templates.css(Player.display._tplOptions());

				// Save the new settings.
				Player.settings.save();
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
	}
}
