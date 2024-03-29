const settingsConfig = require('config');
const migrations = require('../../migrations');

const hosts = require('./hosts');

module.exports = {
	asdf: 'asdf',
	atRoot: [ 'set' ],
	public: [ 'set', 'export', 'import', 'reset', 'load' ],
	hosts,

	template: require('./templates/settings.tpl'),
	settingTemplate: require('./templates/setting.tpl'),
	inputTemplates: {
		checkbox: require('./templates/inputs/checkbox.tpl'),
		input: require('./templates/inputs/input.tpl'),
		select: require('./templates/inputs/select.tpl'),
		textarea: require('./templates/inputs/textarea.tpl')
	},

	changelog: 'https://github.com/rcc11/4chan-sounds-player/releases',
	groups: settingsConfig.reduce((groups, setting) => {
		if (setting.displayGroup) {
			groups[setting.displayGroup] || (groups[setting.displayGroup] = []);
			groups[setting.displayGroup].push(setting);
		}
		return groups;
	}, {}),

	async initialize() {
		Player.settings.view = 'Display';

		// Apply the board theme as default.
		Player.theme.applyBoardTheme({ bypassRender: true });

		// Load the config.
		await Player.settings.load(await GM.getValue('settings') || {}, {
			applyDefault: true,
			bypassAll: true
		});

		// Show update notifications.
		if (Player.config.showUpdatedNotification && Player.config.VERSION && Player.config.VERSION !== VERSION) {
			Player.alert(`4chan Sounds Player has been updated to <a href="${Player.settings.changelog}" target="_blank">version ${VERSION}</a>.`);
		}

		// Listen for the player closing to apply the pause on hide setting.
		Player.on('hide', function () {
			if (Player.config.pauseOnHide) {
				Player.pause();
			}
		});

		// Listen for changes from other tabs
		Player.syncTab('settings', value => Player.settings.load(value, {
			bypassSave: true,
			applyDefault: true,
			ignore: [ 'viewStyle' ]
		}));

		Player.on('rendered', Player.settings.setChangeListeners);
	},

	render() {
		const settingsContainer = Player.$(`.${ns}-settings`);
		_.elementHTML(settingsContainer, Player.settings.template());
		Player.settings.setChangeListeners();
	},

	renderSetting(settingConfig) {
		const settingEl = Player.$(`.${ns}-setting[data-property="${settingConfig.property}"]`);
		const newEl = _.element(Player.settings.settingTemplate(settingConfig), settingEl, 'beforebegin');
		settingEl.parentNode.removeChild(settingEl);
		Player.settings.setChangeListeners(newEl);
	},

	/**
	 * Update a setting.
	 */
	set(property, value, { bypassAll, bypassValidation, bypassSave, bypassRender, silent, bypassStylesheet, settingConfig } = {}) {
		settingConfig = settingConfig || Player.settings.findDefault(property);
		const previous = _.get(Player.config, property);

		// Check if the value has actually changed.
		if (!bypassValidation && _.isEqual(previous, value)) {
			return;
		}

		// Set the new value.
		_.set(Player.config, property, value);

		// Trigger events, unless they are disabled in opts.
		if (!bypassAll) {
			!bypassStylesheet && settingConfig && settingConfig.updateCSSVars && Player.display.updateCSSVars();
			!silent && Player.trigger('config', property, value, previous);
			!silent && Player.trigger('config:' + property, value, previous);
			!bypassSave && Player.settings.save();
			!bypassRender && settingConfig.displayGroup && Player.settings.renderSetting(settingConfig);
			(!bypassRender || bypassRender === 'self') && settingConfig.dependentRender
				&& settingConfig.dependentRender.forEach(prop => Player.settings.renderSetting(Player.settings.findDefault(prop)));
		}
		return [ previous, value ];
	},

	/**
	 * Reset a setting to the default value
	 */
	reset(property, opts) {
		let settingConfig = Player.settings.findDefault(property);
		Player.set(property, settingConfig.default, { ...opts, settingConfig });
	},

	/**
	 * Load a configuration object.
	 *
	 * @param {Object} settings Config to load
	 * @param {Object} opts Same as Player.set, and applyDefault to reset defaults instead mixing current values.
	 */
	async load(settings, opts = {}) {
		if (typeof settings === 'string') {
			settings = JSON.parse(settings);
		}
		const changes = {};
		settingsConfig.forEach(function _handleSetting(setting) {
			if (setting.settings) {
				return setting.settings.forEach(subSetting => _handleSetting({
					property: setting.property,
					default: setting.default,
					...subSetting
				}));
			}
			if (opts.ignore && opts.ignore.includes(setting.property)) {
				return;
			}
			let value = _.get(settings, setting.property, opts.applyDefault ? setting.default : undefined);
			if (value !== undefined) {
				// Mix in default.
				setting.mix && (value = { ...setting.default, ...(value || {}) });
				const data = Player.set(setting.property, value, { bypassAll: true, settingConfig: setting });
				data && (changes[setting.property] = data);
			}
		});
		// Run any migrations to get up to date, and update the stored changes for event triggering.
		Object.entries(await Player.settings.migrate(settings.VERSION)).forEach(([ prop, [ previous, current ] ]) => {
			changes[prop] = [ changes[prop] ? changes[prop][1] : previous, current ];
		});
		// Finally, trigger events.
		if (!opts.bypassAll) {
			!opts.bypassStylesheet && Player.display.updateCSSVars();
			!opts.silent && Object.entries(changes).forEach(([ prop, [ previous, current ] ]) => {
				Player.trigger('config', prop, current, previous);
				Player.trigger('config:' + prop, current, previous);
			});
			!opts.bypassSave && Player.settings.save();
			!opts.bypassRender && Player.settings.render();
		}
	},

	/**
	 * Persist the player settings.
	 */
	save() {
		try {
			// Filter settings that haven't been modified from the default.
			const settings = settingsConfig.reduce(function _handleSetting(settings, setting) {
				if (setting.settings) {
					setting.settings.forEach(subSetting => _handleSetting(settings, {
						property: setting.property,
						default: setting.default,
						...subSetting
					}));
				} else {
					let userVal = _.get(Player.config, setting.property);
					if (userVal !== undefined && !_.isEqual(userVal, setting.default)) {
						// If the setting is a mixed in object only store items that differ from the default.
						if (setting.mix) {
							userVal = Object.keys(userVal).reduce((changed, key) => {
								if (!_.isEqual(setting.default[key], userVal[key])) {
									changed[key] = userVal[key];
								}
								return changed;
							}, {});
						}
						_.set(settings, setting.property, userVal);
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
			Player.logError('There was an error saving the sound player settings.', err);
		}
	},

	/**
	 * Run migrations when the player is updated.
	 */
	async migrate(fromVersion) {
		// Fall out if the player hasn't updated.
		if (!fromVersion || fromVersion === VERSION) {
			return {};
		}
		const changes = {};
		for (let i = 0; i < migrations.length; i++) {
			let mig = migrations[i];
			if (Player.settings.compareVersions(fromVersion, mig.version) < 0) {
				try {
					console.log('[4chan sound player] Migrate:', mig.name);
					Object.entries(await mig.run()).forEach(([ prop, [ current, previous ] ]) => {
						changes[prop] = [ current, changes[prop] ? changes[prop][1] : previous ];
					});
				} catch (err) {
					console.error(err);
				}
			}
		}
		return changes;
	},

	/**
	 * Compare two semver strings.
	 */
	compareVersions(a, b) {
		const [ aVer, aHash ] = a.split('-');
		const [ bVer, bHash ] = b.split('-');
		const aParts = aVer.split('.');
		const bParts = bVer.split('.');
		for (let i = 0; i < 3; i++) {
			if (+aParts[i] > +bParts[i]) {
				return 1;
			}
			if (+aParts[i] < +bParts[i]) {
				return -1;
			}
		}
		return aHash !== bHash;
	},

	/**
	 * Find a setting in the default configuration.
	 */
	findDefault(property) {
		let settingConfig;
		settingsConfig.find(function (setting) {
			if (setting.property === property) {
				return settingConfig = setting;
			}
			if (setting.settings) {
				let subSetting = setting.settings.find(_setting => _setting.property === property);
				return subSetting && (settingConfig = {
					...setting,
					actions: null,
					settings: null,
					description: null,
					...subSetting,
					isSubSetting: true
				});
			}
			return false;
		});
		return settingConfig || { property };
	},

	/**
	 * Toggle whether the player or settings are displayed.
	 */
	toggle(group) {
		// Blur anything focused so the change is applied.
		let focused = Player.$(`.${ns}-settings :focus`);
		focused && focused.blur();

		// Restore the playlist if there's no group given and the settings are already open.
		if (!group && Player.config.viewStyle === 'settings') {
			return Player.playlist.restore();
		}
		// Switch to the settings view if it's not already showing.
		if (Player.config.viewStyle !== 'settings') {
			Player.display.setViewStyle('settings');
		}
		// Switch to a given group.
		if (group && group !== Player.settings.view) {
			Player.settings.showGroup(group);
		}
	},

	showGroup(group) {
		Player.settings.view = group;
		const currentGroup = Player.$(`.${ns}-settings-group.active`);
		const currentTab = Player.$(`.${ns}-settings-tab.active`);
		currentGroup && currentGroup.classList.remove('active');
		currentTab && currentTab.classList.remove('active');
		Player.$(`.${ns}-settings-group[data-group="${group}"]`).classList.add('active');
		Player.$(`.${ns}-settings-tab[data-group="${group}"]`).classList.add('active');
	},

	async import() {
		const fileInput = _.element('<input type="file">');
		const _import = async () => {
			let config;
			try {
				config = await (await fetch(URL.createObjectURL(fileInput.files[0]))).json();
			} catch (err) {
				Player.logError(`Expected a JSON config file and got ${fileInput.files[0].type}.`, err, 'warning');
			}
			fileInput.removeEventListener('change', _import);
			Player.settings.load(config);
		};
		fileInput.addEventListener('change', _import);
		fileInput.click();
	},

	async export(e) {
		// Use the saved settings to only export non-default user settings. Shift click exports everything for testing.
		const settings = e && e.shiftKey ? JSON.stringify(Player.config, null, 4) : await GM.getValue('settings') || '{}';
		const blob = new Blob([ settings ], { type: 'application/json' });
		const a = _.element(`<a href="${URL.createObjectURL(blob)}" download="4chan-sp-config.json" rel="noopener" target="_blank"></a>`);
		a.click();
		URL.revokeObjectURL(a.href);
	},

	setChangeListeners(target) {
		const settingsContainer = target || Player.$(`.${ns}-settings`);
		settingsContainer.querySelectorAll(`.${ns}-settings input, .${ns}-settings textarea`).forEach(el => {
			el.addEventListener('focusout', Player.settings.handleChange);
		});
		settingsContainer.querySelectorAll(`.${ns}-settings input[type=checkbox], .${ns}-settings select`).forEach(el => {
			el.addEventListener('change', Player.settings.handleChange);
		});
	},

	/**
	 * Handle the user making a change in the settings view.
	 */
	handleChange(e) {
		try {
			const input = e.currentTarget;
			const property = input.getAttribute('data-property');
			if (!property) {
				return;
			}
			let settingConfig = Player.settings.findDefault(property);

			// Get the new value of the setting.
			const currentValue = _.get(Player.config, property);
			let newValue = input[input.getAttribute('type') === 'checkbox' ? 'checked' : 'value'];

			if (settingConfig.parse) {
				newValue = Player.getHandler(settingConfig.parse)(newValue, currentValue, e);
			}

			// Not the most stringent check but enough to avoid some spamming.
			if (!_.isEqual(currentValue, newValue, !settingConfig.looseCompare)) {
				// Update the setting.
				Player.set(property, newValue, { bypassValidation: true, bypassRender: 'self', settingConfig });
			}
		} catch (err) {
			Player.logError('There was an error updating the setting.', err);
		}
	},

	/**
	 * Converts a key event in an input to a string representation set as the input value.
	 */
	handleKeyChange(e) {
		e.preventDefault();
		if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Meta') {
			return;
		}
		e.currentTarget.value = e.which === 8 || e.key.toLowerCase() === 'backspace'
			? ''
			: Player.hotkeys.stringifyKey(e);
	}
};
