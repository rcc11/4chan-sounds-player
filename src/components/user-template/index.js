const buttons = require('./buttons');
const viewsMenuTemplate = require('./templates/views_menu.tpl');

// Regex for replacements
const playingRE = /p: ?{([^}]*)}/g;
const hoverRE = /h: ?{([^}]*)}/g;
const buttonRE = new RegExp(`(${buttons.map(option => option.tplName).join('|')})-(?:button|link)(?:\\:"([^"]+?)")?`, 'g');
const soundTitleRE = /sound-title/g;
const soundTitleMarqueeRE = /sound-title-marquee/g;
const soundIndexRE = /sound-index/g;
const soundCountRE = /sound-count/g;
const soundPropRE = /sound-(src|id|name|post|imageOrThumb|image|thumb|filename|imageMD5)/g;
const configRE = /\$config\[([^\]]+)\]/g;

// Hold information on which config values components templates depend on.
const componentDeps = [ ];

module.exports = {
	buttons,

	delegatedEvents: {
		click: {
			[`.${ns}-playing-jump-link`]: () => Player.playlist.scrollToPlaying('center'),
			[`.${ns}-viewStyle-button`]: 'playlist.toggleView',
			[`.${ns}-hoverImages-button`]: 'playlist.toggleHoverImages',
			[`.${ns}-remove-link`]: 'userTemplate._handleRemove',
			[`.${ns}-filter-link`]: 'userTemplate._handleFilter',
			[`.${ns}-download-link`]: 'userTemplate._handleDownload',
			[`.${ns}-shuffle-button`]: 'userTemplate._handleShuffle',
			[`.${ns}-repeat-button`]: 'userTemplate._handleRepeat',
			[`.${ns}-reload-button`]: _.noDefault('playlist.refresh'),
			[`.${ns}-add-button`]: _.noDefault(() => Player.$(`.${ns}-add-local-file-input`).click()),
			[`.${ns}-item-menu-button`]: 'playlist._handleItemMenu',
			[`.${ns}-view-menu-button`]: 'userTemplate._handleViewsMenu',
			[`.${ns}-threads-button`]: 'threads.toggle',
			[`.${ns}-tools-button`]: 'tools.toggle',
			[`.${ns}-config-button`]: _.noDefault(() => Player.settings.toggle()),
			[`.${ns}-favorites-button`]: 'favorites.toggle',
			[`.${ns}-player-button`]: 'playlist.restore'
		},
		change: {
			[`.${ns}-add-local-file-input`]: 'userTemplate._handleFileSelect'
		}
	},

	initialize: function () {
		Player.on('config', Player.userTemplate._handleConfig);
		Player.on('playsound', () => Player.userTemplate._handleEvent('playsound'));
		[ 'add', 'remove', 'order', 'show', 'hide', 'stop' ].forEach(evt => {
			Player.on(evt, Player.userTemplate._handleEvent.bind(null, evt));
		});
	},

	/**
	 * Build a user template.
	 */
	build: function (data) {
		const outerClass = data.outerClass || '';
		const name = data.sound && data.sound.title || data.defaultName;

		const _confFuncOrText = v => (typeof v === 'function' ? v(data) : v);

		// Apply common template replacements, unless they are opted out.
		let html = data.template.replace(configRE, (...args) => _.get(Player.config, args[1]));
		!data.ignoreDisplayBlocks && (html = html
			.replace(playingRE, Player.playing && Player.playing === data.sound ? '$1' : '')
			.replace(hoverRE, `<span class="${ns}-hover-display ${outerClass}">$1</span>`));
		!data.ignoreButtons && (html = html.replace(buttonRE, function (full, type, text) {
			let buttonConf = buttons.find(conf => conf.tplName === type);
			if (buttonConf.requireSound && !data.sound || buttonConf.showIf && !buttonConf.showIf(data)) {
				return '';
			}
			// If the button config has sub values then extend the base config with the selected sub value.
			// Which value is to use is taken from the `property` in the base config of the player config.
			// This gives us different state displays.
			if (buttonConf.values) {
				let topConf = buttonConf;
				const valConf = buttonConf.values[_.get(Player.config, buttonConf.property)] || buttonConf.values[Object.keys(buttonConf.values)[0]];
				buttonConf = { ...topConf, ...valConf, class: ((topConf.class || '') + ' ' + (valConf.class || '')).trim() };
			}
			const attrs = [ ...(_confFuncOrText(buttonConf.attrs) || []) ];
			attrs.some(attr => attr.startsWith('href')) || attrs.push('href="javascript:;"');
			(buttonConf.class || outerClass) && attrs.push(`class="${buttonConf.class || ''} ${outerClass || ''}"`);

			return `<a ${attrs.join(' ')}>${text || _confFuncOrText(buttonConf.icon) || _confFuncOrText(buttonConf.text)}</a>`;
		}));
		!data.ignoreSoundName && (html = html
			.replace(soundTitleMarqueeRE, name ? `<div class="${ns}-col ${ns}-truncate-text" style="margin: 0 .5rem; text-overflow: clip;"><span title="${name}" class="${ns}-title-marquee" data-location="${data.location || ''}">${name}</span></div>` : '')
			.replace(soundTitleRE, name ? `<div class="${ns}-col ${ns}-truncate-text" style="margin: 0 .5rem"><span title="${name}">${name}</span></div>` : ''));
		!data.ignoreSoundProperties && (html = html
			.replace(soundPropRE, (...args) => data.sound ? data.sound[args[1]] : '')
			.replace(soundIndexRE, data.sound ? Player.sounds.indexOf(data.sound) + 1 : 0)
			.replace(soundCountRE, Player.sounds.length));
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
	maintain: function (component, property, alwaysRenderConfigs = [], alwaysRenderEvents = []) {
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
	findDependencies: function (property, template) {
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
		hasCount && events.push('add', 'remove');
		// The row template handles this itself to avoid a full playlist render.
		property !== 'rowTemplate' && (hasSoundProp || hasIndex || hasPlaying) && events.push('playsound', 'stop');
		hasIndex && events.push('order');

		// Find which buttons the template includes that are dependent on config values.
		const config = [];
		let match;
		while ((match = buttonRE.exec(template)) !== null) {
			// If user text is given then the display doesn't change.
			if (!match[2]) {
				let type = match[1];
				let buttonConf = buttons.find(conf => conf.tplName === type);
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
	_handleConfig: function (property, value) {
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
	_handleEvent: function (type) {
		// Check if any components are dependent on the updated property.
		componentDeps.forEach(depInfo => {
			if (depInfo.alwaysRenderEvents.includes(type) || depInfo.events.includes(type)) {
				depInfo.component.render();
			}
		});
	},

	/**
	 * Add local files.
	 */
	_handleFileSelect: function (e) {
		e.preventDefault();
		const input = e.eventTarget;
		Player.playlist.addFromFiles(input.files);
	},

	/**
	 * Toggle the repeat style.
	 */
	_handleRepeat: function (e) {
		e.preventDefault();
		const values = [ 'all', 'one', 'none' ];
		const current = values.indexOf(Player.config.repeat);
		Player.set('repeat', values[(current + 4) % 3]);
	},

	/**
	 * Toggle the shuffle style.
	 */
	_handleShuffle: function (e) {
		e.preventDefault();
		Player.set('shuffle', !Player.config.shuffle);
		Player.header.render();

		// Update the play order.
		if (!Player.config.shuffle) {
			Player.sounds.sort((a, b) => Player.compareIds(a.id, b.id));
		} else {
			const sounds = Player.sounds;
			for (let i = sounds.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[ sounds[i], sounds[j] ] = [ sounds[j], sounds[i] ];
			}
		}
		Player.trigger('order');
	},

	_handleViewsMenu: function (e) {
		e.preventDefault();
		e.stopPropagation();
		const dialog = _.element(viewsMenuTemplate());
		Player.userTemplate._showMenu(e.eventTarget, dialog);
	},

	_showMenu: function (relative, dialog, parent) {
		Player.display.closeDialogs();
		parent || (parent = Player.container);
		parent.appendChild(dialog);

		// Position the menu.
		Player.position.showRelativeTo(dialog, relative);

		// Add the focused class handler
		dialog.querySelectorAll('.entry').forEach(el => {
			el.addEventListener('mouseenter', Player.userTemplate._setFocusedMenuItem);
		});

		Player.trigger('menu-open', dialog);
	},

	_setFocusedMenuItem: function (e) {
		const submenu = e.currentTarget.querySelector('.submenu');
		const menu = e.currentTarget.closest('.dialog');
		const currentFocus = menu.querySelectorAll('.focused');
		currentFocus.forEach(el => el.classList.remove('focused'));
		e.currentTarget.classList.add('focused');
		// Move the menu to the other side if there isn't room.
		if (submenu && submenu.getBoundingClientRect().right > document.documentElement.clientWidth) {
			submenu.style.inset = '0px 100% auto auto';
		}
	},

	_handleFilter: function (e) {
		e.preventDefault();
		let filter = e.eventTarget.getAttribute('data-filter');
		if (filter) {
			Player.set('filters', Player.config.filters.concat(filter));
		}
	},

	_handleDownload: function (e) {
		const src = e.eventTarget.getAttribute('data-src');
		const name = e.eventTarget.getAttribute('data-name') || new URL(src).pathname.split('/').pop();

		GM.xmlHttpRequest({
			method: 'GET',
			url: src,
			responseType: 'blob',
			onload: response => {
				const a = _.element(`<a href="${URL.createObjectURL(response.response)}" download="${name}" rel="noopener" target="_blank"></a>`);
				a.click();
				URL.revokeObjectURL(a.href);
			},
			onerror: response => Player.logError('There was an error downloading.', response, 'warning')
		});
	},

	_handleRemove: function (e) {
		const id = e.eventTarget.getAttribute('data-id');
		const sound = id && Player.sounds.find(sound => sound.id === '' + id);
		sound && Player.remove(sound);
	},
};
