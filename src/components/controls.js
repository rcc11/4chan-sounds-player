module.exports = {

	delegatedEvents: {
		click: {
			[`.${ns}-previous-button`]: _.noDefault(() => Player.previous({ force: true })),
			[`.${ns}-play-button`]: _.noDefault('togglePlay'),
			[`.${ns}-next-button`]: _.noDefault(() => Player.next({ force: true })),
			[`.${ns}-seek-bar`]: 'controls.handleSeek',
			[`.${ns}-volume-bar`]: 'controls.handleVolume',
			[`.${ns}-volume-button`]: _.noDefault('toggleMute'),
			[`.${ns}-fullscreen-button`]: 'display.toggleFullScreen'
		},
		mousedown: {
			[`.${ns}-seek-bar`]: () => Player._seekBarDown = true,
			[`.${ns}-volume-bar`]: () => Player._volumeBarDown = true
		},
		mousemove: {
			[`.${ns}-seek-bar`]: e => Player._seekBarDown && Player.controls.handleSeek(e),
			[`.${ns}-volume-bar`]: e => Player._volumeBarDown && Player.controls.handleVolume(e)
		}
	},

	undelegatedEvents: {
		mouseleave: {
			[`.${ns}-seek-bar`]: e => Player._seekBarDown && Player.controls.handleSeek(e),
			[`.${ns}-volume-bar`]: e => Player._volumeBarDown && Player.controls.handleVolume(e)
		},
		mouseup: {
			body: () => {
				Player._seekBarDown = false;
				Player._volumeBarDown = false;
			}
		},
		play: { [`.${ns}-video`]: 'controls.syncVideo' },
		pause: { [`.${ns}-video`]: 'controls.syncVideo' }
	},

	audioEvents: {
		ended: () => Player.next(),
		pause: 'controls.handleAudioEvent',
		play: 'controls.handleAudioEvent',
		seeked: 'controls.handleAudioEvent',
		waiting: 'controls.handleAudioEvent',
		timeupdate: 'controls.updateDuration',
		loadedmetadata: [ 'controls.updateDuration', 'controls.preventWrapping' ],
		durationchange: 'controls.updateDuration',
		volumechange: 'controls.updateVolume',
		loadstart: 'controls.pollForLoading',
		error: 'controls.handleAudioError'
	},

	initialize: async function () {
		// Keep this reference to switch Player.audio to standalone videos and back.
		Player.controls._audio = Player.audio;

		// Apply the previous volume
		GM.getValue('volume').then(volume => volume >= 0 && volume <= 1 && (Player.audio.volume = volume));

		// Only poll for the loaded data when the player is open.
		Player.on('show', () => Player._hiddenWhilePolling && Player.controls.pollForLoading());
		Player.on('hide', () => {
			Player._hiddenWhilePolling = !!Player._loadingPoll;
			Player.controls.stopPollingForLoading();
		});
		Player.on('rendered', () => {
			// Keep track of heavily updated elements.
			Player.ui.currentTimeBar = Player.$(`.${ns}-seek-bar .${ns}-current-bar`);
			Player.ui.loadedBar = Player.$(`.${ns}-seek-bar .${ns}-loaded-bar`);

			// Set the initial volume/seek bar positions and hidden controls.
			Player.controls.updateDuration();
			Player.controls.updateVolume();
			Player.controls.preventWrapping();
		});
		// Show all the controls when wrapping prevention is disabled.
		Player.on('config:preventControlsWrapping', newValue => !newValue && Player.controls.showAllControls());
		// Reset the hidden controls when the hide order is changed.
		Player.on('config:controlsHideOrder', () => {
			Player.controls.setHideOrder();
			Player.controls.preventWrapping();
		});
	},

	/**
	 * Handle audio errors
	 */
	handleAudioError: function (err) {
		if (Player.playing) {
			Player.logError(`Failed to play ${Player.playing.title}. Please check the console for details.`, err, 'warning');
			Player.next();
		}
	},

	/**
	 * Handle audio events. Sync the video up, and update the controls.
	 */
	handleAudioEvent: function () {
		Player.controls.syncVideo();
		Player.controls.updateDuration();
		document.querySelectorAll(`.${ns}-play-button`).forEach(el => {
			el.classList[Player.audio.paused ? 'add' : 'remove'](`${ns}-play`);
		});
	},

	/**
	 * Sync the webm to the audio. Matches the videos time and play state to the audios.
	 */
	syncVideo: function () {
		if (Player.isVideo && !Player.isStandalone) {
			const paused = Player.audio.paused;
			const video = document.querySelector(`.${ns}-video`);
			if (video) {
				video.currentTime = Player.audio.currentTime % video.duration;
				if (paused) {
					video.pause();
				} else {
					video.play();
				}
			}
		}
	},

	/**
	 * Poll for how much has loaded. I know there's the progress event but it unreliable.
	 */
	pollForLoading: function () {
		Player._loadingPoll = Player._loadingPoll || setInterval(Player.controls.updateLoaded, 1000);
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
		size === 100 && Player.controls.stopPollingForLoading();
		Player.ui.loadedBar.style.width = size + '%';
	},

	/**
	 * Update the seek bar and the duration labels.
	 */
	updateDuration: function () {
		const currentTime = _.toDuration(Player.audio.currentTime);
		const duration = _.toDuration(Player.audio.duration);
		// Gross use of childNodes to avoid textContent triggering mutation observers of other scripts.
		document.querySelectorAll(`.${ns}-current-time`).forEach(el => el.childNodes[0].textContent = currentTime);
		document.querySelectorAll(`.${ns}-duration`).forEach(el => el.childNodes[0].textContent = duration);
		Player.controls.updateProgressBarPosition(Player.ui.currentTimeBar, Player.audio.currentTime, Player.audio.duration);
	},

	/**
	 * Update the volume bar.
	 */
	updateVolume: function () {
		const vol = Player.audio.volume;
		vol > 0 && (Player._lastVolume = vol);
		GM.setValue('volume', vol);
		document.querySelectorAll(`.${ns}-volume-button`).forEach(el => {
			el.classList[vol === 0 ? 'add' : 'remove']('mute');
			el.classList[vol > 0 ? 'add' : 'remove']('up');
		});
		Player.controls.updateProgressBarPosition(Player.$(`.${ns}-volume-bar .${ns}-current-bar`), Player.audio.volume, 1);
	},

	/**
	 * Update a progress bar width. Adjust the margin of the circle so it's contained within the bar at both ends.
	 */
	updateProgressBarPosition: function (bar, current, total) {
		if (!bar) {
			return;
		}
		current || (current = 0);
		total || (total = 0);
		const ratio = !total ? 0 : Math.max(0, Math.min(((current || 0) / total), 1));
		bar.style.width = `calc(${ratio * 100}% - ${(0.8 * ratio) - 0.4}rem)`;
	},

	/**
	 * Handle the user interacting with the seek bar.
	 */
	handleSeek: function (e) {
		e.preventDefault();
		if (Player.audio.duration && Player.audio.duration !== Infinity) {
			Player.audio.currentTime = Player.audio.duration * Player.controls._getBarXRatio(e);
		}
	},

	/**
	 * Handle the user interacting with the volume bar.
	 */
	handleVolume: function (e) {
		e.preventDefault();
		Player.audio.volume = Player.controls._getBarXRatio(e);
		Player.controls.updateVolume();
	},

	_getBarXRatio: function (e) {
		const offset = 0.4 * Player.remSize;
		return Math.max(0, Math.min(1, (e.offsetX - offset) / (parseInt(getComputedStyle(e.eventTarget || e.target).width, 10) - (2 * offset))));
	},

	/**
	 * Set all controls visible.
	 */
	showAllControls: function () {
		Player.$all(`.${ns}-controls [data-hide-id]`).forEach(el => el.style.display = null);
	},

	/**
	 * Hide elements in the controls instead of wrapping
	 */
	preventWrapping: function () {
		if (!Player.config.preventControlWrapping) {
			return;
		}
		const controls = Player.$(`.${ns}-controls`);
		// If the offset top of the last visible child than this value it indicates wrapping.
		const expectedOffsetTop = parseFloat(window.getComputedStyle(controls).paddingTop);
		const hideElements = Player.controls.hideOrder || Player.controls.setHideOrder();
		let visibleChildren = Array.prototype.slice.call(controls.children);
		let lastChild = visibleChildren.pop();
		let hidden = 0;
		// Show everything to check what has wrapped.
		Player.controls.showAllControls();
		// Keep hiding elements until the last visible child has not wrapped, or there's nothing left to hide.
		while (lastChild.offsetTop > expectedOffsetTop && hidden < hideElements.length) {
			const hide = hideElements[hidden++];
			hide.style.display = 'none';
			visibleChildren = visibleChildren.filter(el => el !== hide);
			hide === lastChild && (lastChild = visibleChildren.pop());
		}
	},

	/**
	 * Set the hide order from the user config.
	 */
	setHideOrder: function () {
		if (!Array.isArray(Player.config.controlsHideOrder)) {
			Player.settings.reset('controlsHideOrder');
		}
		const controls = Player.$(`.${ns}-controls`);
		return Player.controls.hideOrder = Player.config.controlsHideOrder
			.map(id => controls.querySelector(`[data-hide-id="${id}"]`))
			.filter(el => el)
			.sort((a, b) => a.dataset.hideOrder - b.dataset.hideOrder);
	}
};
