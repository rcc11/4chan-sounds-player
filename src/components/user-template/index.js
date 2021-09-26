const buttons = require('./buttons');

// Regex for replacements
const playingRE = /p: ?{([^}]*)}/g;
const hoverRE = /h: ?{([^}]*)}/g;
// Create a regex to find buttons/links, ignore matches if the button/link name is itself a regex.
const tplNames = buttons.map(conf => `${conf.tplName.source && conf.tplName.source.replace(/\(/g, '(?:') || conf.tplName}`);
const buttonRE = new RegExp(`(${tplNames.join('|')})-(?:button|link)(?:\\:"([^"]+?)")?`, 'g');
const soundTitleRE = /sound-title/g;
const soundTitleMarqueeRE = /sound-title-marquee/g;
const soundIndexRE = /sound-index/g;
const soundCountRE = /sound-count/g;
const soundPropRE = /sound-(src|id|name|post|imageOrThumb|image|thumb|filename|imageMD5)/g;
const soundFilterCountRE = /filtered-count/g;
const configRE = /\$config\[([^\]]+)\]/g;

// Hold information on which config values components templates depend on.
const componentDeps = [ ];

module.exports = {
	buttons,

	initialize() {
		Player.on('config', Player.userTemplate._handleConfig);
		Player.on('playsound', () => Player.userTemplate._handleEvent('playsound'));
		[ 'add', 'remove', 'order', 'show', 'hide', 'stop' ].forEach(evt => {
			Player.on(evt, Player.userTemplate._handleEvent.bind(null, evt));
		});
	},

	/**
	 * Build a user template.
	 */
	build(data) {
		const outerClass = data.outerClass || '';
		const name = data.sound && data.sound.title || data.defaultName;
		let _data = { ...data };

		const _confFuncOrText = v => (typeof v === 'function' ? v(_data) : v);

		// Apply common template replacements, unless they are opted out.
		let html = data.template.replace(configRE, (...args) => _.get(Player.config, args[1]));
		!data.ignoreDisplayBlocks && (html = html
			.replace(playingRE, Player.playing && Player.playing === data.sound ? '$1' : '')
			.replace(hoverRE, `<span class="${ns}-hover-display ${outerClass}">$1</span>`));
		!data.ignoreButtons && (html = html.replace(buttonRE, function (full, type, text) {
			let buttonConf = Player.userTemplate._findButtonConf(type);
			_data.tplNameMatch = buttonConf.tplNameMatch;
			if (buttonConf.requireSound && !data.sound || buttonConf.showIf && !buttonConf.showIf(_data)) {
				return '';
			}
			// If the button config has sub values then extend the base config with the selected sub value.
			// Which value to use is taken from the `property` in the base config of the player config.
			// This gives us different state displays.
			if (buttonConf.values) {
				let topConf = buttonConf;
				const valConf = buttonConf.values[_.get(Player.config, buttonConf.property)] || buttonConf.values[Object.keys(buttonConf.values)[0]];
				buttonConf = { ...topConf, ...valConf };
			}
			const attrs = [ ...(_confFuncOrText(buttonConf.attrs) || []) ];
			attrs.some(attr => attr.startsWith('href')) || attrs.push('href="javascript:;"');
			(buttonConf.class || outerClass) && attrs.push(`class="${buttonConf.class || ''} ${outerClass || ''}"`);
			buttonConf.action && attrs.push(`@click='${_confFuncOrText(buttonConf.action)}'`);

			// Replace spaces with non breaking spaces in user text to prevent collapsing.
			return `<a ${attrs.join(' ')}>${text && text.replace(/ /g, ' ') || _confFuncOrText(buttonConf.icon) || _confFuncOrText(buttonConf.text)}</a>`;
		}));
		!data.ignoreSoundName && (html = html
			.replace(soundTitleMarqueeRE, name ? `<div class="${ns}-col ${ns}-truncate-text" style="margin: 0 .5rem; text-overflow: clip;"><span title="${name}" class="${ns}-title-marquee" data-location="${data.location || ''}">${name}</span></div>` : '')
			.replace(soundTitleRE, name ? `<div class="${ns}-col ${ns}-truncate-text" style="margin: 0 .5rem"><span title="${name}">${name}</span></div>` : ''));
		!data.ignoreSoundProperties && (html = html
			.replace(soundPropRE, (...args) => data.sound ? data.sound[args[1]] : '')
			.replace(soundIndexRE, data.sound ? Player.sounds.indexOf(data.sound) + 1 : 0)
			.replace(soundCountRE, Player.sounds.length)
			.replace(soundFilterCountRE, Player.filteredSounds.length));
		!data.ignoreVersion && (html = html.replace(/%v/g, VERSION));

		// Apply any specific replacements
		if (data.replacements) {
			for (let k of Object.keys(data.replacements)) {
				html = html.replace(new RegExp(k, 'g'), data.replacements[k]);
			}
		}

		return html;
	},

	/**
	 * Sets up a components to render when the template or values within it are changed.
	 */
	maintain(component, property, alwaysRenderConfigs = [], alwaysRenderEvents = []) {
		componentDeps.push({
			component,
			property,
			...Player.userTemplate.findDependencies(property, null),
			alwaysRenderConfigs,
			alwaysRenderEvents
		});
	},

	/**
	 * Find all the config dependent values in a template.
	 */
	findDependencies(property, template) {
		template || (template = _.get(Player.config, property));
		// Figure out what events should trigger a render.
		const events = [];

		// add/remove should render templates showing the count.
		// playsound/stop should render templates either showing properties of the playing sound or dependent on something playing.
		// order should render templates showing a sounds index.
		const hasCount = soundCountRE.test(template);
		const hasSoundProp = soundTitleRE.test(template) || soundPropRE.test(template);
		const hasIndex = soundIndexRE.test(template);
		const hasPlaying = playingRE.test(template);
		const hasFilterCount = soundFilterCountRE.test(template);
		hasCount && events.push('add', 'remove');
		// The row template handles this itself to avoid a full playlist render.
		property !== 'rowTemplate' && (hasSoundProp || hasIndex || hasPlaying) && events.push('playsound', 'stop');
		hasIndex && events.push('order');
		hasFilterCount && events.push('filters-applied');

		// Find which buttons the template includes that are dependent on config values.
		const config = [];
		let match;
		while ((match = buttonRE.exec(template)) !== null) {
			// If user text is given then the display doesn't change.
			if (!match[2]) {
				let buttonConf = Player.userTemplate._findButtonConf(match[1]);
				if (buttonConf.property) {
					config.push(buttonConf.property);
				}
			}
		}
		// Find config references.
		while ((match = configRE.exec(template)) !== null) {
			config.push(match[1]);
		}

		return { events, config };
	},

	/**
	 * When a config value is changed check if any component dependencies are affected.
	 */
	_handleConfig(property, value) {
		// Check if a template for a components was updated.
		componentDeps.forEach(depInfo => {
			if (depInfo.property === property) {
				Object.assign(depInfo, Player.userTemplate.findDependencies(property, value));
				depInfo.component.render();
			}
		});
		// Check if any components are dependent on the updated property.
		componentDeps.forEach(depInfo => {
			if (depInfo.alwaysRenderConfigs.includes(property) || depInfo.config.includes(property)) {
				depInfo.component.render();
			}
		});
	},

	/**
	 * When a player event is triggered check if any component dependencies are affected.
	 */
	_handleEvent(type) {
		// Check if any components are dependent on the updated property.
		componentDeps.forEach(depInfo => {
			if (depInfo.alwaysRenderEvents.includes(type) || depInfo.events.includes(type)) {
				depInfo.component.render();
			}
		});
	},

	_findButtonConf: type => {
		let tplNameMatch;
		let buttonConf = buttons.find(conf => {
			if (conf.tplName === type) {
				return tplNameMatch = [ type ];
			}
			return tplNameMatch = conf.tplName.test && type.match(conf.tplName);
		});
		return buttonConf && { ...buttonConf, tplNameMatch };
	}
};
