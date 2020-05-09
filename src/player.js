const headerOptions = {
	repeat: {
		all: { title: 'Repeat All', text: '[RA]', class: 'fa-repeat' },
		one: { title: 'Repeat One', text: '[R1]', class: 'fa-repeat fa-repeat-one' },
		none: { title: 'No Repeat', text: '[R0]', class: 'fa-repeat disabled' }
	},
	shuffle: {
		true: { title: 'Shuffled', text: '[S]', class: 'fa-random' },
		false: { title: 'Ordered', text: '[O]', class: 'fa-random disabled' },
	},
	playlist: {
		true: { title: 'Hide Playlist', text: '[+]', class: 'fa-expand' },
		false: { title: 'Show Playlist', text: '[-]', class: 'fa-compress' }
	}
}

const Player = {
	ns,

	audio: new Audio(),
	sounds: [],
	container: null,
	ui: {},
	_progressBarStyleSheets: {},
	settings: settingsConfig.reduce((settings, settingConfig) => {
		return _set(settings, settingConfig.property, settingConfig.default);
	}, {}),

	$: (...args) => Player.container.querySelector(...args),

	templates: {
		css: ({ data }) => /*% templates/css.tpl %*/,
		body: ({ data }) => /*% templates/body.tpl %*/,
		header: ({ data }) => /*% templates/header.tpl %*/,
		player: ({ data }) => /*% templates/player.tpl %*/,
		controls: ({ data }) => /*% templates/controls.tpl %*/,
		list: ({ data }) => /*% templates/list.tpl %*/,
		settings: ({ data }) => /*% templates/settings.tpl %*/
	},

	delegatedEvents: {
		click: {
			[`.${ns}-close-button`]: 'hide',

			// Playback settings
			[`.${ns}-shuffle-button`]: 'toggleShuffle',
			[`.${ns}-repeat-button`]: 'toggleRepeat',

			// Media controls
			[`.${ns}-previous-button`]: 'previous',
			[`.${ns}-play-button`]: 'togglePlay',
			[`.${ns}-next-button`]: 'next',
			[`.${ns}-seek-bar`]: 'handleSeek',
			[`.${ns}-volume-bar`]: 'handleVolume',

			// View settings
			[`.${ns}-playlist-button`]: 'togglePlayerView',
			[`.${ns}-config-button`]: 'toggleSettings',

			// Playlist controls
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
			[`.${ns}-expander`]: 'initResize',
			[`.${ns}-seek-bar`]: () => Player._seekBarDown = true,
			[`.${ns}-volume-bar`]: () => Player._volumeBarDown = true
		},
		mousemove: {
			[`.${ns}-seek-bar`]: e => Player._seekBarDown && Player.handleSeek(e),
			[`.${ns}-volume-bar`]: e => Player._volumeBarDown && Player.handleVolume(e)
		},
		focusout: {
			[`.${ns}-settings input, .${ns}-settings textarea`]: 'handleSettingChange'
		},
		change: {
			[`.${ns}-settings input[type=checkbox]`]: 'handleSettingChange'
		}
	},

	undelegatedEvents: {
		mouseleave: {
			[`.${ns}-seek-bar`]: e => Player._seekBarDown && Player.handleSeek(e),
			[`.${ns}-volume-bar`]: e => Player._volumeBarDown && Player.handleVolume(e)
		},
		mouseup: {
			body: () => {
				Player._seekBarDown = false;
				Player._volumeBarDown = false;
			}
		},
		play: { [`.${ns}-video`]: 'syncVideo' },
		playing: { [`.${ns}-video`]: 'syncVideo' },
		pause: { [`.${ns}-video`]: 'syncVideo' },
		seeked: { [`.${ns}-video`]: 'syncVideo' },
		loadeddata: { [`.${ns}-video`]: 'syncVideo' }
	},

	audioEvents: {
		ended: 'next',
		pause:'handleAudioEvent',
		play: 'handleAudioEvent',
		seeked: 'handleAudioEvent',
		waiting: 'handleAudioEvent',
		timeupdate: 'updateDuration',
		loadedmetadata: 'updateDuration',
		durationchange: 'updateDuration',
		volumechange: 'updateVolume',
		loadstart: 'pollForLoading'
	},

	/**
	 * Returns the function of Player referenced by name or a given handler function.
	 * @param {String|Function} handler Name to function on Player or a handler function.
	 */
	getEventHandler: function (handler) {
		return typeof handler === 'string' ? Player[handler] : handler;
	},

	/**
	 * Set up the player.
	 */
	initialize: async function () {
		try {
			await Player.loadSettings();
			Player.sounds = [ ];
			Player.playOrder = [ ];
 
			// If it's already known that 4chan X is running then setup the button for it.
			// If not add the the [Sounds] link in the top and bottom nav.
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

			// Render the player, but not neccessarily show it.
			Player.render();
		} catch (err) {
			_logError('There was an error intiaizing the sound player. Please check the console for details.');
			console.error('[4chan sounds player]', err);
			// Can't recover so throw this error.
			throw err;
		}
	},

	/**
	 * Create the player show/hide button in to the 4chan X header.
	 */
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

	/**
	 * Persist the player settings.
	 */
	saveSettings: function () {
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

	/**
	 * Generate the data passed to the templates.
	 */
	_tplOptions: function () {
		return { data: Player.settings };
	},

	/**
	 * Render the player.
	 */
	render: async function () {
		try {
			if (Player.container) {
				document.body.removeChild(Player.container);
				document.head.removeChild(Player.stylesheet);
			}

			// Insert the stylesheet.
			Player.stylesheet = document.createElement('style');
			Player.stylesheet.innerHTML = Player.templates.css(Player._tplOptions());
			document.head.appendChild(Player.stylesheet);

			// Create the main player.
			const el = document.createElement('div');
			el.innerHTML = Player.templates.body(Player._tplOptions());
			Player.container = el.querySelector(`#${ns}-container`);
			document.body.appendChild(Player.container);

			// Keep track of heavily updated elements.
			Player.ui.currentTime = Player.$(`.${ns}-current-time`);
			Player.ui.duration = Player.$(`.${ns}-duration`);
			Player.ui.currentTimeBar = Player.$(`.${ns}-seek-bar .${ns}-current-bar`);
			Player.ui.loadedBar = Player.$(`.${ns}-seek-bar .${ns}-loaded-bar`);

			// Add stylesheets to adjust the progress indicator of the seekbar and volume bar.
			document.head.appendChild(Player._progressBarStyleSheets[`.${ns}-seek-bar`] = document.createElement('style'));
			document.head.appendChild(Player._progressBarStyleSheets[`.${ns}-volume-bar`] = document.createElement('style'));
			Player.updateDuration();
			Player.updateVolume();

			// Wire up delegated events on the container.
			for (let evt in Player.delegatedEvents) {
				Player.container.addEventListener(evt, function (e) {
					for (let selector in Player.delegatedEvents[evt]) {
						const eventTarget = e.target.closest(selector);
						if (eventTarget) {
							e.eventTarget = eventTarget;
							return Player.getEventHandler(Player.delegatedEvents[evt][selector])(e);
						}
					}
				});
			}

			// Wire up undelegated events.
			Player.wireUpUndelegatedEvents();

			// Wite up audio events.
			for (let evt in Player.audioEvents) {
				Player.audio.addEventListener(evt, Player.getEventHandler(Player.audioEvents[evt]));
			}
		} catch (err) {
			_logError('There was an error rendering the sound player. Please check the console for details.');
			console.error('[4chan sounds player]', err);
			// Can't recover, throw.
			throw err;
		}
	},

	/**
	 * Render the player header.
	 */
	renderHeader: function () {
		if (!Player.container) {
			return;
		}
		Player.$(`.${ns}-title`).innerHTML = Player.templates.header(Player._tplOptions());
	},

	/**
	 * Render the playlist.
	 */
	renderList: function () {
		if (!Player.container) {
			return;
		}
		if (Player.$(`.${ns}-list`)) {
			Player.$(`.${ns}-list`).innerHTML = Player.templates.list(Player._tplOptions());
		}
	},

	/**
	 * Set, or reset, directly bound events.
	 */
	wireUpUndelegatedEvents: function () {
		for (let evt in Player.undelegatedEvents) {
			for (let selector in Player.undelegatedEvents[evt]) {
				document.querySelectorAll(selector).forEach(element => {
					const handler = Player.getEventHandler(Player.undelegatedEvents[evt][selector]);
					element.removeEventListener(evt, handler);
					element.addEventListener(evt, handler);
				});
			}
		}
	},

	/**
	 * Handle audio events. Sync the video up, and update the controls.
	 */
	handleAudioEvent: function () {
		Player.syncVideo();
		Player.updateDuration();
		Player.$(`.${ns}-play-button .${ns}-play-button-display`).classList[Player.audio.paused ? 'add' : 'remove'](`${ns}-play`);
	},

	/**
	 * Sync the webm to the audio. Matches the videos time and play state to the audios.
	 */
	syncVideo: function () {
		const paused = Player.audio.paused;
		const video = Player.$(`.${ns}-video`);
		if (video) {
			video.currentTime = Player.audio.currentTime;
			if (paused) {
				video.pause();
			} else {
				video.play();
			}
		}
	},

	/**
	 * Poll for how much has loaded. I know there's the progress event but it unreliable.
	 */
	pollForLoading: function () {
		Player._loadingPoll = Player._loadingPoll || setInterval(Player.updateLoaded, 1000);
	},

	/**
	 * Stop polling for how much has loaded.
	 */
	stopPollingForLoading: function () {
		Player._loadingPoll && clearInterval(Player._loadingPoll);
		Player._loadingPoll = null;
	},

	/**
	 * Update the loading bar.
	 */
	updateLoaded: function () {
		const length = Player.audio.buffered.length;
		const size = length > 0
			? (Player.audio.buffered.end(length - 1) / Player.audio.duration) * 100
			: 0;
		// If it's fully loaded then stop polling.
		size === 100 && Player.stopPollingForLoading();
		Player.ui.loadedBar.style.width = size + '%';
	},

	/**
	 * Update the seek bar and the duration labels.
	 */
	updateDuration: function () {
		if (!Player.container) {
			return;
		}
		Player.ui.currentTime.innerHTML = toDuration(Player.audio.currentTime);
		Player.ui.duration.innerHTML = ' / ' + toDuration(Player.audio.duration);
		Player.updateProgressBarPosition(`.${ns}-seek-bar`, Player.ui.currentTimeBar, Player.audio.currentTime, Player.audio.duration);
	},

	/**
	 * Update the volume bar.
	 */
	updateVolume: function () {
		Player.updateProgressBarPosition(`.${ns}-volume-bar`, Player.$(`.${ns}-volume-bar .${ns}-current-bar`), Player.audio.volume, 1);
	},

	/**
	 * Update a progress bar width. Adjust the margin of the circle so it's contained within the bar at both ends.
	 */
	updateProgressBarPosition: function (id, bar, current, total) {
		current || (current = 0);
		total || (total = 0);
		const ratio = !total ? 0 : Math.max(0, Math.min(((current || 0) / total), 1));
		bar.style.width = (ratio * 100) + '%';
		if (Player._progressBarStyleSheets[id]) {
			Player._progressBarStyleSheets[id].innerHTML = `${id} .${ns}-current-bar:after {
				margin-right: ${-.8 * (1 - ratio)}rem;
			}`;
		}
	},

	/**
	 * Handle the user interacting with the seek bar.
	 */
	handleSeek: function (e) {
		e.preventDefault();
		if (Player.container && Player.audio.duration && Player.audio.duration !== Infinity) {
			const ratio = e.offsetX / parseInt(document.defaultView.getComputedStyle(e.eventTarget || e.target).width, 10);
			Player.audio.currentTime = Player.audio.duration * ratio;
		}
	},

	/**
	 * Handle the user interacting with the volume bar.
	 */
	handleVolume: function (e) {
		e.preventDefault();
		if (!Player.container) {
			return;
		}
		const ratio = e.offsetX / parseInt(document.defaultView.getComputedStyle(e.eventTarget || e.target).width, 10);
		Player.audio.volume = Math.max(0, Math.min(ratio, 1));
		Player.updateVolume();
	},

	/**
	 * Change what view is being shown
	 * @param {Chagn} e 
	 */
	setViewStyle: function (style) {
		Player.settings.viewStyle = style;
		Player.container.setAttribute('data-view-style', style);
	},

	/**
	 * Togle the display status of the player.
	 */
	toggleDisplay: function (e) {
		e && e.preventDefault();
		if (Player.container.style.display === 'none') {
			Player.show();
		} else {
			Player.hide();
		}
	},

	/**
	 * Hide the player. Stops polling for changes, and pauses the aduio if set to.
	 */
	hide: function (e) {
		if (!Player.container) {
			return;
		}
		try {
			e && e.preventDefault();
			Player._hiddenWhilePolling = !!Player._loadingPoll;
			Player.stopPollingForLoading();
			Player.container.style.display = 'none';
			if (Player.settings.pauseOnHide) {
				Player.pause();
			}
		} catch (err) {
			_logError('There was an error hiding the sound player. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},

	/**
	 * Show the player. Reapplies the saved position/size, and resumes loadeing polling if it was paused.
	 * @param {*} e 
	 */
	show: async function (e) {
		if (!Player.container) {
			return;
		}
		try {
			e && e.preventDefault();
			if (!Player.container.style.display) {
				return;
			}
			Player._hiddenWhilePolling && Player.pollForLoading();
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
	
	/**
	 * Toggle the repeat style.
	 */
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
	
	
	/**
	 * Toggle the shuffle style.
	 */
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

	
	/**
	 * Toggle whether the player or settings are displayed.
	 */
	toggleSettings: function (e) {
		try {
			e.preventDefault();
			if (Player.settings.viewStyle === 'settings') {
				Player.setViewStyle(Player._preSettingsView);
			} else {
				Player._preSettingsView = Player.settings.viewStyle;
				Player.setViewStyle('settings');
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
	handleSettingChange: function (e) {
		try {
			const input = e.eventTarget;
			const property = input.getAttribute('data-property');
			const settingConfig = settingsConfig.find(settingConfig => settingConfig.property === property);
			const currentValue = _get(Player.settings, property);
			let newValue = input[input.getAttribute('type') === 'checkbox' ? 'checked' : 'value'];
			if (settingConfig && settingConfig.split) {
				newValue = newValue.split(decodeURIComponent(settingConfig.split));
			}
			// Not the most stringent check but enough to avoid some spamming.
			if (currentValue !== newValue) {
				// Update the setting.
				_set(Player.settings, property, newValue);

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

	/**
	 * Handle the user grabbing the expander.
	 */
	initResize: function initDrag(e) {
		disableUserSelect();
		Player._startX = e.clientX;
		Player._startY = e.clientY;
		Player._startWidth = parseInt(document.defaultView.getComputedStyle(Player.container).width, 10);
		Player._startHeight = parseInt(document.defaultView.getComputedStyle(Player.container).height, 10);
		document.documentElement.addEventListener('mousemove', Player.doResize, false);
		document.documentElement.addEventListener('mouseup', Player.stopResize, false);
	},

	/**
	 * Handle the user dragging the expander.
	 */
	doResize: function(e) {
		e.preventDefault();
		Player.resizeTo(Player._startWidth + e.clientX - Player._startX, Player._startHeight + e.clientY - Player._startY);
	},

	/**
	 * Handle the user releasing the expander.
	 */
	stopResize: function() {
		const style = document.defaultView.getComputedStyle(Player.container);
		document.documentElement.removeEventListener('mousemove', Player.doResize, false);
		document.documentElement.removeEventListener('mouseup', Player.stopResize, false);
		enableUserSelect();
		GM.setValue(ns + '.size', parseInt(style.width, 10) + ':' + parseInt(style.height, 10));
	},

	/**
	 * Resize the player.
	 */
	resizeTo: function (width, height) {
		if (!Player.container) {
			return;
		}
		// Make sure the player isn't going off screen. 40 to give a bit of spacing for the 4chanX header.
		height = Math.min(height, document.documentElement.clientHeight - 40);

		Player.container.style.width = width + 'px';

		// Change the height of the playlist or image.
		const heightElement = Player.settings.viewStyle === 'playlist'
			? Player.$(`.${ns}-list-container`)
			: Player.$(`.${ns}-image-link`);

		const containerHeight = parseInt(document.defaultView.getComputedStyle(Player.container).height, 10);
		const offset = containerHeight - parseInt(heightElement.style.height, 10);
		heightElement.style.height = Math.max(10, height - offset) + 'px';
	},

	/**
	 * Handle the user grabbing the header.
	 */
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

	/**
	 * Handle the user dragging the header.
	 */
	doMove: function (e) {
		e.preventDefault();
		Player.moveTo(e.clientX - Player._offsetX, e.clientY - Player._offsetY);
	},

	/**
	 * Handle the user releasing the heaer.
	 */
	stopMove: function (e) {
		document.documentElement.removeEventListener('mousemove', Player.doMove, false);
		document.documentElement.removeEventListener('mouseup', Player.stopMove, false);
		Player.$(`.${ns}-title`).style.cursor = null;
		enableUserSelect();
		GM.setValue(ns + '.position', parseInt(Player.container.style.left, 10) + ':' + parseInt(Player.container.style.top, 10));
	},

	/**
	 * Move the player.
	 */
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

	/**
	 * Update the image displayed in the player.
	 */
	showImage: function (sound, thumb) {
		if (!Player.container) {
			return;
		}
		try {
			Player.$(`.${ns}-image`).src = thumb ? sound.thumb : sound.image;
			Player.$(`.${ns}-image-link`).href = sound.image;
			Player.$(`.${ns}-image-link`).classList.remove(ns + '-show-video');
		} catch (err) {
			_logError('There was an error display the sound player image. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},

	/**
	 * Play the video for a sound in place of an image.
	 */
	playVideo: function (sound) {
		if (!Player.container) {
			return;
		}
		try {
			Player.$(`.${ns}-video`).src = sound.image;
			Player.$(`.${ns}-image-link`).href = sound.image;
			Player.$(`.${ns}-image-link`).classList.add(ns + '-show-video');
		} catch (err) {
			_logError('There was an error display the sound player image. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},

	/**
	 * Switch between playlist and image view.
	 */
	togglePlayerView: function (e) {
		e.preventDefault()
		if (!Player.container) {
			return;
		}
		e && e.preventDefault();
		let style = Player.settings.viewStyle === 'playlist' ? 'image' : 'playlist';
		try {
			Player.setViewStyle(style);
			Player.renderHeader();
			Player.saveSettings();
		} catch (err) {
			_logError('There was an error switching the view style. Please check the console for details.', 'warning');
			console.error('[4chan sounds player]', err);
		}
	},

	/**
	 * Add a new sound from the thread to the player.
	 */
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
					Player.showImage(sound);
				}
			}
		} catch (err) {
			_logError('There was an error adding to the sound player. Please check the console for details.');
			console.log('[4chan sounds player', title, id, src, thumb, image);
			console.error('[4chan sounds player]', err);
		}
	},

	/**
	 * Start playback.
	 */
	play: function (sound) {
		if (!Player.audio) {
			return;
		}

		try {
			// If a new sound is being played update the display.
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

	/**
	 * Pause playback.
	 */
	pause: function () {
		Player.audio && Player.audio.pause();
	},

	/**
	 * Switching being playing and paused.
	 */
	togglePlay: function () {
		if (Player.audio.paused) {
			Player.play();
		} else {
			Player.pause();
		}
	},

	/**
	 * Play the next sound.
	 */
	next: function () {
		Player._movePlaying(1);
	},

	/**
	 * Play the previous sound.
	 */
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
