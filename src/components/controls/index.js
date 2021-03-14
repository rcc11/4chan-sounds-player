module.exports = {
	template: require('./templates/controls.tpl'),

	audioEvents: {
		ended: () => Player.config.autoplayNext && Player.next(),
		pause: 'controls.handleMediaEvent',
		play: 'controls.handleMediaEvent',
		seeked: 'controls.handleMediaEvent',
		waiting: 'controls.handleMediaEvent',
		timeupdate: 'controls.updateDuration',
		loadedmetadata: [ 'controls.updateDuration', 'controls.preventWrapping' ],
		durationchange: 'controls.updateDuration',
		volumechange: 'controls.updateVolume',
		loadstart: 'controls.pollForLoading',
		error: 'controls.handleAudioError'
	},

	actions: {
		previous: 'previous({ "force": true })',
		playPause: 'togglePlay',
		next: 'next({ "force": true })',
		seek: 'controls.handleSeek("evt", "main"):prevent',
		mute: 'toggleMute',
		volume: 'controls.handleVolume("evt", "main"):prevent',
		fullscreen: 'display.toggleFullScreen'
	},

	initialize: async function () {
		// Apply the previous volume
		GM.getValue('volume').then(volume => volume >= 0 && volume <= 1 && (Player.audio.volume = volume));

		// Only poll for the loaded data when the player is open.
		Player.on('show', () => Player._hiddenWhilePolling && Player.controls.pollForLoading());
		Player.on('hide', () => {
			Player._hiddenWhilePolling = !!Player._loadingPoll;
			Player.controls.stopPollingForLoading();
		});
		Player.on('rendered', () => {
			Player.video = Player.$(`.${ns}-video`);
			Player.video.dataset.id = 'main';
			// Keep track of heavily updated elements.
			Player.audio.volumeBar = Player.video.volumeBar = Player.$(`.${ns}-volume-bar .${ns}-current-bar`);
			Player.audio.currentTimeBar = Player.video.currentTimeBar = Player.$(`.${ns}-seek-bar .${ns}-current-bar`);
			Player.audio.loadedBar = Player.video.loadedBar = Player.$(`.${ns}-seek-bar .${ns}-loaded-bar`);

			// Set the initial volume/seek bar positions and hidden controls.
			Player.controls.updateDuration({ currentTarget: Player.audio });
			Player.controls.updateVolume({ currentTarget: Player.audio });
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
	handleMediaEvent: function (e) {
		const audio = e.currentTarget._inlineAudio || e.currentTarget;
		Player.controls.sync(e.currentTarget);
		Player.controls.updateDuration(e);
		document.querySelectorAll(`.${ns}-play-button[data-audio="${audio.dataset.id}"]`).forEach(el => {
			el.classList[audio.paused ? 'add' : 'remove'](`${ns}-play`);
		});
	},

	/**
	 * Sync the webm to the audio. Matches the videos time and play state to the audios.
	 */
	sync: function (from) {
		const to = from._linked;
		if (from && from.readyState > 3 && to && to.readyState > 3) {
			to.currentTime = from.currentTime % to.duration;
			to[from.paused ? 'pause' : 'play']();
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
		Player.audio.loadedBar.style.width = size + '%';
	},

	/**
	 * Update the seek bar and the duration labels.
	 */
	updateDuration: function (e) {
		const media = e.currentTarget;
		const audio = media._inlineAudio || media;
		const controls = media._inlineAudio ? audio._inlinePlayer.controls : document;
		const currentTime = _.toDuration(media.currentTime);
		const duration = _.toDuration(media.duration);
		const audioId = audio.dataset.id;
		// Gross use of childNodes to avoid textContent triggering mutation observers of other scripts.
		controls && controls.querySelectorAll(`.${ns}-current-time[data-audio="${audioId}"]`).forEach(el => el.childNodes[0].textContent = currentTime);
		controls && controls.querySelectorAll(`.${ns}-duration[data-audio="${audioId}"]`).forEach(el => el.childNodes[0].textContent = duration);
		Player.controls.updateProgressBarPosition(audio.currentTimeBar, media.currentTime, media.duration);
	},

	/**
	 * Update the volume bar.
	 */
	updateVolume: function (e) {
		const audio = e.currentTarget._inlineAudio || e.currentTarget;
		const controls = audio._inlinePlayer ? audio._inlinePlayer.controls : Player.container;
		const vol = audio.volume;
		// Store volume of the main player.
		if (audio === Player.audio) {
			vol > 0 && (Player._lastVolume = vol);
			GM.setValue('volume', vol);
		}
		controls && controls.querySelectorAll(`.${ns}-volume-button[data-audio="${audio.dataset.id}"]`).forEach(el => {
			el.classList[vol === 0 ? 'add' : 'remove']('mute');
			el.classList[vol > 0 ? 'add' : 'remove']('up');
		});
		Player.controls.updateProgressBarPosition(audio.volumeBar, audio.volume, 1);
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
	handleSeek: function (e, audioId) {
		const media = audioId === 'main'
			? Player.audio
			: Player.inline.audio[audioId]._inlinePlayer.master;
		if (media && media.duration && media.duration !== Infinity) {
			media.currentTime = media.duration * Player.controls._getBarXRatio(e);
		}
	},

	/**
	 * Handle the user interacting with the volume bar.
	 */
	handleVolume: function (e, audioId) {
		const audio = audioId === 'main' ? Player.audio : Player.inline.audio[audioId];
		audio.volume = Player.controls._getBarXRatio(e);
	},

	_getBarXRatio: function (e) {
		const offset = 0.4 * Player.remSize;
		const offsetX = e.offsetX || (e.targetTouches[0].pageX - e.currentTarget.getBoundingClientRect().left);
		return Math.max(0, Math.min(1, (offsetX - offset) / (parseInt(getComputedStyle(e.currentTarget).width, 10) - (2 * offset))));
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
