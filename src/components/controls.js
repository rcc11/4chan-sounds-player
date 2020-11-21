module.exports = {
	atRoot: [ 'togglePlay', 'play', 'pause', 'next', 'previous', 'toggleMute' ],
	public: [ 'togglePlay', 'play', 'pause', 'next', 'previous', 'toggleMute' ],

	delegatedEvents: {
		click: {
			[`.${ns}-previous-button`]: _.noDefault(() => Player.previous({ force: true })),
			[`.${ns}-play-button`]: _.noDefault('togglePlay'),
			[`.${ns}-next-button`]: _.noDefault(() => Player.next({ force: true })),
			[`.${ns}-seek-bar`]: 'controls.handleSeek',
			[`.${ns}-volume-bar`]: 'controls.handleVolume',
			[`.${ns}-volume-button`]: _.noDefault('controls.toggleMute'),
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
		loadedmetadata: 'controls.updateDuration',
		durationchange: 'controls.updateDuration',
		volumechange: 'controls.updateVolume',
		loadstart: 'controls.pollForLoading'
	},

	initialize: async function () {
		// Apply the previous volume
		GM.getValue('volume').then(volume => volume >= 0 && volume <= 1 && (Player.audio.volume = volume));

		Player.on('show', () => Player._hiddenWhilePolling && Player.controls.pollForLoading());
		Player.on('hide', () => {
			Player._hiddenWhilePolling = !!Player._loadingPoll;
			Player.controls.stopPollingForLoading();
		});
		Player.on('rendered', () => {
			// Keep track of heavily updated elements.
			Player.ui.currentTimeBar = Player.$(`.${ns}-seek-bar .${ns}-current-bar`);
			Player.ui.loadedBar = Player.$(`.${ns}-seek-bar .${ns}-loaded-bar`);

			Player.controls.updateDuration();
			Player.controls.updateVolume();
		});
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
	 * Start playback.
	 */
	play: async function (sound, { paused } = {}) {
		try {
			// If nothing is currently selected to play start playing the first sound.
			if (!sound && !Player.playing && Player.sounds.length) {
				sound = Player.sounds[0];
			}

			const video = document.querySelector(`.${ns}-video`);
			video.removeEventListener('canplaythrough', Player.controls.playOnceLoaded);
			Player.audio.removeEventListener('canplaythrough', Player.controls._playOnceLoaded);

			// If a new sound is being played update the display.
			if (sound) {
				if (Player.playing) {
					Player.playing.playing = false;
				}
				sound.playing = true;
				Player.playing = sound;
				Player.audio.src = sound.src;
				await Player.trigger('playsound', sound);
			}

			if (!paused) {
				// If there's a video wait for it and the sound to load before playing.
				if (Player.playlist.isVideo && (video.readyState < 3 || Player.audio.readyState < 3)) {
					video.addEventListener('canplaythrough', Player.controls._playOnceLoaded);
					Player.audio.addEventListener('canplaythrough', Player.controls._playOnceLoaded);
				} else {
					Player.audio.play();
				}
			}
		} catch (err) {
			Player.logError('There was an error playing the sound. Please check the console for details.', err);
		}
	},

	/**
	 * Handler to start playback once the video and audio are both loaded.
	 */
	_playOnceLoaded: function () {
		const video = document.querySelector(`.${ns}-video`);
		if (video.readyState > 2 && Player.audio.readyState > 2) {
			video.removeEventListener('canplaythrough', Player.controls._playOnceLoaded);
			Player.audio.removeEventListener('canplaythrough', Player.controls._playOnceLoaded);
			Player.audio.play();
			// Sometimes it just doesn't sync when the playback starts. Give it a second and then force a sync.
			setTimeout(Player.controls.syncVideo, 100);
		}
	},

	/**
	 * Pause playback.
	 */
	pause: function () {
		Player.audio && Player.audio.pause();
	},

	/**
	 * Play the next sound.
	 */
	next: function (opts) {
		Player.controls._movePlaying(1, opts);
	},

	/**
	 * Play the previous sound.
	 */
	previous: function (opts) {
		Player.controls._movePlaying(-1, opts);
	},

	_movePlaying: function (direction, { force, group, paused } = {}) {
		// If there's no sound fall out.
		if (!Player.sounds.length) {
			return;
		}
		// If there's no sound currently playing or it's not in the list then just play the first sound.
		const currentIndex = Player.sounds.indexOf(Player.playing);
		if (currentIndex === -1) {
			return Player.play(Player.sounds[0]);
		}
		// Get the next index, either repeating the same, wrapping round to repeat all or just moving the index.
		let nextSound;
		if (!force && Player.config.repeat === 'one') {
			nextSound = Player.sounds[currentIndex];
		} else {
			let newIndex = currentIndex;
			// Get the next index wrapping round if repeat all is selected
			// Keep going if it's group move, there's still more sounds to check, and the next sound is still in the same group.
			do {
				newIndex = Player.config.repeat === 'all'
					? ((newIndex + direction) + Player.sounds.length) % Player.sounds.length
					: newIndex + direction;
				nextSound = Player.sounds[newIndex];
			} while (group && nextSound && newIndex !== currentIndex && (!nextSound.post || nextSound.post === Player.playing.post));
		}
		nextSound && Player.play(nextSound, { paused });
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
		if (Player.playlist.isVideo) {
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
		document.querySelectorAll(`.${ns}-current-time`).forEach(el => el.innerHTML = currentTime);
		document.querySelectorAll(`.${ns}-duration`).forEach(el => el.innerHTML = duration);
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

	volumeUp: function () {
		Player.audio.volume = Math.min(Player.audio.volume + 0.05, 1);
	},

	volumeDown: function () {
		Player.audio.volume = Math.max(Player.audio.volume - 0.05, 0);
	},

	toggleMute: async function () {
		Player.audio.volume = (Player._lastVolume || 0.5) * !Player.audio.volume;
	},

	/**
	 * Hide elements in the controls instead of wrapping
	 */
	preventWrapping: function () {
		const controls = Player.$(`.${ns}-controls`);
		const expectedOffsetTop = parseFloat(window.getComputedStyle(controls).paddingTop);
		const hideElements = Array.prototype.slice.call(controls.querySelectorAll('[data-hide-order]'));
		hideElements.sort((a, b) => a.dataset.hideOrder - b.dataset.hideOrder);
		let visibleChildren = Array.prototype.slice.call(controls.children);
		let lastChild = visibleChildren.pop();
		hideElements.forEach(el => el.style.display = null);
		while (lastChild.offsetTop > expectedOffsetTop && hideElements.length) {
			const hide = hideElements.shift();
			hide.style.display = 'none';
			visibleChildren = visibleChildren.filter(el => el !== hide);
			hide === lastChild && (lastChild = visibleChildren.pop());
		}
	}
};
