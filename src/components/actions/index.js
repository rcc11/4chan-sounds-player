module.exports = {
	atRoot: [ 'togglePlay', 'play', 'pause', 'next', 'previous', 'stop', 'toggleMute', 'volumeUp', 'volumeDown' ],
	public: [ 'togglePlay', 'play', 'pause', 'next', 'previous', 'stop', 'toggleMute', 'volumeUp', 'volumeDown' ],

	initialize: function () {
		// Keep this reference to switch Player.audio to standalone videos and back.
		Player.controls._audio = Player.audio;
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

			Player.video.removeEventListener('canplaythrough', Player.actions._playOnceLoaded);
			Player.audio.removeEventListener('canplaythrough', Player.actions._playOnceLoaded);

			// If a new sound is being played update the display.
			if (sound) {
				if (Player.playing) {
					Player.playing.playing = false;
				}
				// Remove audio events from the video, and add them back for standalone video.
				const audioEvents = Player.controls.audioEvents;
				for (let evt in audioEvents) {
					let handlers = Array.isArray(audioEvents[evt]) ? audioEvents[evt] : [ audioEvents[evt] ];
					handlers.forEach(handler => {
						const handlerFunction = Player.getHandler(handler);
						Player.video.removeEventListener(evt, handlerFunction);
						sound.standaloneVideo && Player.video.addEventListener(evt, handlerFunction);
					});
				}
				sound.playing = true;
				Player.playing = sound;
				Player.audio.src = sound.src;
				Player.isVideo = sound.image.endsWith('.webm') || sound.type === 'video/webm';
				Player.isStandalone = sound.standaloneVideo;
				Player.audio = sound.standaloneVideo ? Player.video : Player.controls._audio;
				Player.container.classList[Player.isVideo ? 'add' : 'remove']('playing-video');
				Player.container.classList[Player.isVideo || sound.image.endsWith('gif') ? 'add' : 'remove']('playing-animated');
				await Player.trigger('playsound', sound);
			}

			if (!paused) {
				// If there's a video and sound wait for both to load before playing.
				if (!Player.isStandalone && Player.isVideo && (Player.video.readyState < 3 || Player.audio.readyState < 3)) {
					Player.video.addEventListener('canplaythrough', Player.actions._playOnceLoaded);
					Player.audio.addEventListener('canplaythrough', Player.actions._playOnceLoaded);
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
		if (Player.video.readyState > 2 && Player.audio.readyState > 2) {
			Player.video.removeEventListener('canplaythrough', Player.actions._playOnceLoaded);
			Player.audio.removeEventListener('canplaythrough', Player.actions._playOnceLoaded);
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
	 * Stop playback.
	 */
	stop: function () {
		Player.audio.src = null;
		Player.playing = null;
		Player.isVideo = false;
		Player.isStandalone = false;
		Player.trigger('stop');
	},

	/**
	 * Play the next sound.
	 */
	next: function (opts) {
		Player.actions._movePlaying(1, opts);
	},

	/**
	 * Play the previous sound.
	 */
	previous: function (opts) {
		// Over three seconds into a sound restarts it instead.
		if (Player.audio.currentTime > 3) {
			Player.audio.currentTime = 0;
		} else {
			Player.actions._movePlaying(-1, opts);
		}
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
	 * Raise the volume by 5%.
	 */
	volumeUp: function () {
		Player.audio.volume = Math.min(Player.audio.volume + 0.05, 1);
	},

	/**
	 * Lower the volume by 5%.
	 */
	volumeDown: function () {
		Player.audio.volume = Math.max(Player.audio.volume - 0.05, 0);
	},

	/**
	 * Mute the audio, or reset it to the last volume prior to muting.
	 */
	toggleMute: function () {
		Player.audio.volume = (Player._lastVolume || 0.5) * !Player.audio.volume;
	},

	/**
	 * Trigger a download for a file using GM.xmlHttpRequest to avoid cors issues.
	 */
	download: function (src, name) {
		GM.xmlHttpRequest({
			method: 'GET',
			url: src,
			responseType: 'blob',
			onload: response => {
				const a = _.element(`<a href="${URL.createObjectURL(response.response)}" download="${_.escAttr(name)}" rel="noopener" target="_blank"></a>`);
				a.click();
				URL.revokeObjectURL(a.href);
			},
			onerror: response => Player.logError('There was an error downloading.', response, 'warning')
		});
	}
};
