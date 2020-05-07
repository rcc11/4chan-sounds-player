const headerOptions = {
	repeat: {
		all: { title: 'Repeat All', text: '[RA]', class: 'fa-repeat' },
		one: { title: 'Repeat One', text: '[R1]', class: 'fa-repeat fa-repeat-one' },
		none: { title: 'No Repeat', text: '[R0]', class: 'fa-repeat disabled' }
	},
	shuffle: {
		true: { title: 'Shuffle', text: '[S]', class: 'fa-random' },
		false: { title: 'Ordered', text: '[S]', class: 'fa-random disabled' },
	},
	playlist: {
		true: { title: 'Hide Playlist', text: '[+]', class: 'fa-expand' },
		false: { title: 'Show Playlist', text: '[+]', class: 'fa-compress' }
	}
}

const Player = {
	ns,

	sounds: [],
	container: null,
	ui: {},
	settings: settingsConfig.reduce((settings, settingConfig) => {
		return _.set(settings, settingConfig.property, settingConfig.default);
	}, {}),

	$: (...args) => Player.container.querySelector(...args),

	// The templates are setup at initialization.
	templates: {},
	_templates: {
		css: /*%% templates/css.tpl %*/,
		body: /*%% templates/body.tpl %*/,
		header: /*%% templates/header.tpl %*/,
		list: /*%% templates/list.tpl %*/,
		settings: /*%% templates/settings.tpl %*/
	},

	events: {
		click: {
			[`.${ns}-close-button`]: 'hide',
			[`.${ns}-config-button`]: 'toggleSettings',
			[`.${ns}-shuffle-button`]: 'toggleShuffle',
			[`.${ns}-repeat-button`]: 'toggleRepeat',
			[`.${ns}-playlist-button`]: 'togglePlaylist',
			[`.${ns}-list`]: function (e) {
				const id = e.target.getAttribute('data-id');
				const sound = id && Player.sounds.find(function (sound) {
					return sound.id === '' + id;
				});
				sound && Player.play(sound);
			}
		},
		mousedown: {
			[`.${ns}-title`]: 'initMove',
			[`.${ns}-expander`]: 'initResize'
		},
		focusout: {
			[`.${ns}-settings input, .${ns}-settings textarea`]: 'handleSettingChange'
		},
		change: {
			[`.${ns}-settings input[type=checkbox]`]: 'handleSettingChange'
		}
	},

	initialize: async function () {
		try {
			await Player.loadSettings();
			Player.sounds = [ ];
			Player.playOrder = [ ];

			// Set up the template functions.
			for (let name in Player._templates) {
				Player.templates[name] = _.template(Player._templates[name]);
			}

			if (isChanX) {
				Player.initChanX()
			} else {
				document.querySelectorAll('#settingsWindowLink, #settingsWindowLinkBot').forEach(function (link) {
					const bracket = document.createTextNode('] [');
					const showLink = document.createElement('a');
					showLink.innerHTML = 'Sounds';
					showLink.href = 'javascript;';
					link.parentNode.insertBefore(showLink, link);
					link.parentNode.insertBefore(bracket, link);
					showLink.addEventListener('click', Player.toggleDisplay);
				});
			}

			Player.render();
		} catch (err) {
			_logError('There was an error intiaizing the sound player. Please check the console for details.');
			console.error('[4chan sounds player]');
			// Can't recover so throw this error.
			throw err;
		}
	},

	initChanX: function () {
		if (Player._initedChanX) {
			return;
		}
		Player._initedChanX = true;
		const shortcuts = document.getElementById('shortcuts');
		const showIcon = document.createElement('span');
		shortcuts.insertBefore(showIcon, document.getElementById('shortcut-settings'));

		const attrs = { id: 'shortcut-sounds', class: 'shortcut brackets-wrap', 'data-index': 0 };
		for (let attr in attrs) {
			showIcon.setAttribute(attr, attrs[attr]);
		}
		showIcon.innerHTML = '<a href="javascript:;" title="Sounds" class="fa fa-play-circle">Sounds</a>';
		showIcon.querySelector('a').addEventListener('click', Player.toggleDisplay);
	},

	saveSettings: function () {
		try {
			return GM.setValue(ns + '.settings', JSON.stringify(Player.settings));
		} catch (err) {
			_logError('There was an error saving the sound player settings. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},

	loadSettings: async function () {
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
			function _mix (to, from) {
				for (let key in from) {
					if (from[key] && typeof from[key] === 'object' && !Array.isArray(from[key])) {
						to[key] || (to[key] = {});
						_mix(to[key], from[key]);
					} else {
						to[key] = from[key];
					}
				}
			}
			_mix(Player.settings, settings);
		} catch (err) {
			_logError('There was an error loading the sound player settings. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},

	_tplOptions: function () {
		return { data: Player.settings };
	},

	render: async function () {
		try {
			if (Player.container) {
				document.body.removeChild(Player.container);
				document.head.removeChild(Player.stylesheet);
			}

			// Insert the stylesheet
			Player.stylesheet = document.createElement('style');
			Player.stylesheet.innerHTML = Player.templates.css(Player._tplOptions());
			document.head.appendChild(Player.stylesheet);

			// Create the main player
			const el = document.createElement('div');
			el.innerHTML = Player.templates.body(Player._tplOptions());
			Player.container = el.querySelector(`#${ns}-container`);
			document.body.appendChild(Player.container);

			// Keep track of the audio element
			Player.audio = Player.$(`.${ns}-audio`);

			// Wire up event listeners.
			for (let evt in Player.events) {
				Player.container.addEventListener(evt, function (e) {
					for (let selector in Player.events[evt]) {
						let handler = Player.events[evt][selector];
						if (typeof handler === 'string') {
							handler = Player[handler];
						}
						const eventTarget = e.target.closest(selector);
						if (eventTarget) {
							e.eventTarget = eventTarget;
							return handler(e);
						}
					}
				});
			}

			// Add audio event listeners. They don't bubble so do them separately.
			Player.audio.addEventListener('ended', Player.next);
			Player.audio.addEventListener('pause', () => Player.$(`.${ns}-video`).pause());
			Player.audio.addEventListener('play', () => {
				Player.$(`.${ns}-video`).currentTime = Player.audio.currentTime;
				Player.$(`.${ns}-video`).play();
			});
			Player.audio.addEventListener('seeked', () => Player.$(`.${ns}-video`).currentTime = Player.audio.currentTime);
		} catch (err) {
			_logError('There was an error rendering the sound player. Please check the console for details.');
			console.error('[4chan sounds player]');
			// Can't recover, throw.
			throw err;
		}
	},

	renderHeader: function () {
		if (!Player.container) {
			return;
		}
		Player.$(`.${ns}-title`).innerHTML = Player.templates.header(Player._tplOptions());
	},

	renderList: function () {
		if (!Player.container) {
			return;
		}
		if (Player.$(`.${ns}-list`)) {
			Player.$(`.${ns}-list`).innerHTML = Player.templates.list(Player._tplOptions());
		}
	},

	toggleDisplay: function (e) {
		e && e.preventDefault();
		if (Player.container.style.display === 'none') {
			Player.show();
		} else {
			Player.hide();
		}
	},

	hide: function (e) {
		if (!Player.container) {
			return;
		}
		try {
			e && e.preventDefault();
			Player.container.style.display = 'none';
			if (Player.settings.pauseOnHide) {
				Player.pause();
			}
		} catch (err) {
			_logError('There was an error hiding the sound player. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},

	show: async function (e) {
		if (!Player.container) {
			return;
		}
		try {
			e && e.preventDefault();
			if (!Player.container.style.display) {
				return;
			}
			Player.container.style.display = null;
			// Apply the last position/size
			const [ top, left ] = (await GM.getValue(ns + '.position') || '').split(':');
			const [ width, height ] = (await GM.getValue(ns + '.size') || '').split(':');
			+width && +height && Player.resizeTo(width, height);
			+top && +left && Player.moveTo(top, left);
		} catch (err) {
			_logError('There was an error showing the sound player. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},
	
	toggleRepeat: function (e) {
		try {
			e.preventDefault();
			const options = Object.keys(headerOptions.repeat);
			const current = options.indexOf(Player.settings.repeat);
			Player.settings.repeat = options[(current + 4) % 3];
			Player.renderHeader();
			Player.saveSettings();
		} catch (err) {
			_logError('There was an error changing the repeat setting. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},
	
	toggleShuffle: function (e) {
		try {
			e.preventDefault();
			Player.settings.shuffle = !Player.settings.shuffle;
			Player.renderHeader();

			// Update the play order.
			if (!Player.settings.shuffle) {
				Player.playOrder = [ ...Player.sounds ];
			} else {
				const playOrder = Player.playOrder;
				for (let i = playOrder.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[playOrder[i], playOrder[j]] = [playOrder[j], playOrder[i]];
				}
			}
			Player.saveSettings();
		} catch (err) {
			_logError('There was an error changing the shuffle setting. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},

	toggleSettings: function (e) {
		try {
			e.preventDefault();
			if (Player.container.classList.contains(ns + '-show-settings')) {
				Player.container.classList.remove(ns + '-show-settings');
			} else {
				Player.container.classList.add(ns + '-show-settings');
			}
		} catch (err) {
			_logError('There was an error rendering the sound player settings. Please check the console for details.');
			console.error('[4chan sounds player]');
			// Can't recover, throw.
			throw err;
		}
	},

	handleSettingChange: function (e) {
		try {
			const input = e.eventTarget;
			const property = input.getAttribute('data-property');
			const settingConfig = settingsConfig.find(settingConfig => settingConfig.property === property);
			const currentValue = _.get(Player.settings, property);
			let newValue = input[input.getAttribute('type') === 'checkbox' ? 'checked' : 'value'];
			if (settingConfig && settingConfig.split) {
				newValue = newValue.split(decodeURIComponent(settingConfig.split));
			}
			// Not the most stringent check but enough to avoid some spamming.
			if (currentValue !== newValue) {
				// Update the setting.
				_.set(Player.settings, property, newValue);

				// Update the stylesheet reflect any changes.
				Player.stylesheet.innerHTML = Player.templates.css(Player._tplOptions());

				// Save the new settings.
				Player.saveSettings();
			}
		} catch (err) {
			_logError('There was an updating the setting. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},

	initResize: function initDrag(e) {
		disableUserSelect();
		Player._startX = e.clientX;
		Player._startY = e.clientY;
		Player._startWidth = parseInt(document.defaultView.getComputedStyle(Player.container).width, 10);
		Player._startHeight = parseInt(document.defaultView.getComputedStyle(Player.container).height, 10);
		document.documentElement.addEventListener('mousemove', Player.doResize, false);
		document.documentElement.addEventListener('mouseup', Player.stopResize, false);
	},

	doResize: function(e) {
		Player.resizeTo(Player._startWidth + e.clientX - Player._startX, Player._startHeight + e.clientY - Player._startY);
	},

	resizeTo: function (width, height) {
		if (!Player.container) {
			return;
		}
		// Make sure the player isn't going off screen. 40 to give a bit of spacing for the 4chanX header.
		height = Math.min(height, document.documentElement.clientHeight - 40);

		Player.container.style.width = width + 'px';

		// Change the height of the playlist of image.
		const heightElement = Player.settings.playlist
			? Player.$(`.${ns}-list-container`)
			: Player.$(`.${ns}-image-link`);

		const containerHeight = parseInt(document.defaultView.getComputedStyle(Player.container).height, 10);
		const offset = containerHeight - parseInt(heightElement.style.height, 10);
		heightElement.style.height = Math.max(10, height - offset) + 'px';
	},

	stopResize: function() {
		const style = document.defaultView.getComputedStyle(Player.container);
		document.documentElement.removeEventListener('mousemove', Player.doResize, false);
		document.documentElement.removeEventListener('mouseup', Player.stopResize, false);
		enableUserSelect();
		GM.setValue(ns + '.size', parseInt(style.width, 10) + ':' + parseInt(style.height, 10));
	},

	initMove: function (e) {
		disableUserSelect();
		Player.$(`.${ns}-title`).style.cursor = 'grabbing';

		// Try to reapply the current sizing to fix oversized winows.
		const style = document.defaultView.getComputedStyle(Player.container);
		Player.resizeTo(parseInt(style.width, 10), parseInt(style.height, 10));

		Player._offsetX = e.clientX - Player.container.offsetLeft;
		Player._offsetY = e.clientY - Player.container.offsetTop;
		document.documentElement.addEventListener('mousemove', Player.doMove, false);
		document.documentElement.addEventListener('mouseup', Player.stopMove, false);
	},

	doMove: function (e) {
		Player.moveTo(e.clientX - Player._offsetX, e.clientY - Player._offsetY);
	},

	moveTo: function (x, y) {
		if (!Player.container) {
			return;
		}
		const style = document.defaultView.getComputedStyle(Player.container);
		const maxX = document.documentElement.clientWidth - parseInt(style.width, 10);
		const maxY = document.documentElement.clientHeight - parseInt(style.height, 10);
		Player.container.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
		Player.container.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
	},

	stopMove: function (e) {
		document.documentElement.removeEventListener('mousemove', Player.doMove, false);
		document.documentElement.removeEventListener('mouseup', Player.stopMove, false);
		Player.$(`.${ns}-title`).style.cursor = null;
		enableUserSelect();
		GM.setValue(ns + '.position', parseInt(Player.container.style.left, 10) + ':' + parseInt(Player.container.style.top, 10));
	},

	showThumb: function (sound) {
		if (!Player.container) {
			return;
		}
		try {
			Player.$(`.${ns}-image-link`).classList.remove(ns + '-show-video');
			Player.$(`.${ns}-image`).src = sound.thumb;
			Player.$(`.${ns}-image-link`).href = sound.image;
		} catch (err) {
			_logError('There was an error displaying the sound player image. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},

	showImage: function (sound) {
		if (!Player.container) {
			return;
		}
		try {
			Player.$(`.${ns}-image-link`).classList.remove(ns + '-show-video');
			Player.$(`.${ns}-image`).src = sound.image;
			Player.$(`.${ns}-image-link`).href = sound.image;
		} catch (err) {
			_logError('There was an error display the sound player image. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},

	playVideo: function (sound) {
		if (!Player.container) {
			return;
		}
		try {
			Player.$(`.${ns}-image-link`).classList.add(ns + '-show-video');
			Player.$(`.${ns}-video`).src = sound.image;
			Player.$(`.${ns}-video`).play();
		} catch (err) {
			_logError('There was an error display the sound player image. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},

	hidePlaylist: function () {
		if (!Player.container) {
			return;
		}
		try {
			Player.settings.playlist = false;
			Player.container.classList.add(`${ns}-expanded-view`);
			Player.container.classList.remove(`${ns}-playlist-view`);
			Player.saveSettings();
		} catch (err) {
			_logError('There was an error switching to image view. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},

	showPlaylist: function () {
		if (!Player.container) {
			return;
		}
		try {
			Player.settings.playlist = true;
			Player.container.classList.remove(`${ns}-expanded-view`);
			Player.container.classList.add(`${ns}-playlist-view`);
			Player.saveSettings();
		} catch (err) {
			_logError('There was an error switching to playlist view. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},

	togglePlaylist: function (e) {
		if (!Player.container) {
			return;
		}
		e && e.preventDefault();
		if (Player.settings.playlist) {
			Player.hidePlaylist();
		} else {
			Player.showPlaylist();
		}
	},

	add: function (title, id, src, thumb, image) {
		try {
			// Avoid duplicate additions.
			if (Player.sounds.find(sound => sound.id === id)) {
				return;
			}
			const sound = { title, src, id, thumb, image };
			Player.sounds.push(sound);

			// Add the sound to the play order at the end, or someone random for shuffled.
			const index = Player.settings.shuffle
				? Math.floor(Math.random() * Player.sounds.length - 1)
				: Player.sounds.length;
			Player.playOrder.splice(index, 0, sound);

			if (Player.container) {
				// Re-render the list.
				Player.renderList();
				Player.$(`.${ns}-count`).innerHTML = Player.sounds.length;

				// If nothing else has been added yet show the image for this sound.
				if (Player.playOrder.length === 1) {
					// If we're on a thread with autoshow enabled then make sure the player is displayed
					if (/\/thread\//.test(location.href) && Player.settings.autoshow) {
						Player.show();
					}
					Player.showThumb(sound);
				}
			}
		} catch (err) {
			_logError('There was an error adding to the sound player. Please check the console for details.');
			console.log('[4chan sounds player', title, id, src, thumb, image);
			console.error('[4chan sounds player]', err);
		}
	},

	play: function (sound) {
		if (!Player.audio) {
			return;
		}

		try {
			if (sound) {
				if (Player.playing) {
					Player.playing.playing = false;
				}
				sound.playing = true;
				Player.playing = sound;
				Player.renderHeader();
				Player.audio.src = sound.src;
				if (sound.image.endsWith('.webm')) {
					Player.playVideo(sound);
				} else {
					Player.showImage(sound);
				}
				Player.renderList();
			}
			Player.audio.play();
		} catch (err) {
			_logError('There was an error playing the sound. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},

	pause: function () {
		Player.audio && Player.audio.pause();
	},

	next: function () {
		Player._movePlaying(1);
	},

	previous: function () {
		Player._movePlaying(-1);
	},

	_movePlaying: function (direction) {
		if (!Player.audio) {
			return;
		}
		try {
			// If there's no sound fall out.
			if (!Player.playOrder.length) {
				return;
			}
			// If there's no sound currently playing or it's not in the list then just play the first sound.
			const currentIndex = Player.playOrder.indexOf(Player.playing);
			if (currentIndex === -1) {
				return Player.playSound(Player.playOrder[0]);
			}
			// Get the next index, either repeating the same, wrapping round to repeat all or just moving the index.
			const nextIndex = Player.settings.repeat === 'one'
				? currentIndex
				: Player.settings.repeat === 'all'
					? ((currentIndex + direction) + Player.playOrder.length) % Player.playOrder.length
					: currentIndex + direction;
			const nextSound = Player.playOrder[nextIndex];
			nextSound && Player.play(nextSound);
		} catch (err) {
			_logError(`There was an error selecting the ${direction > 0 ? 'next': 'previous'} track. Please check the console for details.`);
			console.error('[4chan sounds player]', err);
		}
	}
};
