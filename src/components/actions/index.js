module.exports = {
	atRoot: [ 'togglePlay', 'play', 'pause', 'next', 'previous', 'stop', 'toggleMute', 'volumeUp', 'volumeDown' ],
	public: [ 'togglePlay', 'play', 'pause', 'next', 'previous', 'stop', 'toggleMute', 'volumeUp', 'volumeDown' ],

	initialize() {
		// Keep this reference to switch Player.audio to standalone videos and back.
		Player.controls._audio = Player.audio;
	},

	/**
	 * Switching being playing and paused.
	 */
	togglePlay() {
		if (Player.audio.paused) {
			Player.play();
		} else {
			Player.pause();
		}
	},

	/**
	 * Start playback.
	 */
	async play(sound, { paused } = {}) {
		try {
			// Handle id instead of sound object.
			if (typeof sound === 'string') {
				sound = Player.sounds.find(s => s.id === sound);
			}
			// If nothing is currently selected to play start playing the first sound.
			if (!sound && !Player.playing && Player.sounds.length) {
				sound = Player.sounds[0];
			}

			// If a new sound is being played update the display.
			if (sound && sound !== Player.playing) {
				if (Player.playing) {
					Player.playing.playing = false;
				}
				// Remove play on load listeners for the previous sound.
				Player.video.removeEventListener('canplaythrough', Player.actions.playOnceLoaded);
				Player.audio.removeEventListener('canplaythrough', Player.actions.playOnceLoaded);
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
				Player.video.loop = !Player.isStandalone;
				Player.audio = sound.standaloneVideo ? Player.video : Player.controls._audio;
				Player.audio._linked = Player.isVideo && !Player.isStandalone && Player.video;
				Player.video._linked = Player.isVideo && !Player.isStandalone && Player.audio;
				Player.container.classList[Player.isVideo ? 'add' : 'remove']('playing-video');
				Player.container.classList[Player.isVideo || sound.image.endsWith('gif') ? 'add' : 'remove']('playing-animated');
				await Player.trigger('playsound', sound);
			}

			if (!paused) {
				// If there's a video and sound wait for both to load before playing.
				if (!Player.isStandalone && Player.isVideo && (Player.video.readyState < 3 || Player.audio.readyState < 3)) {
					Player.video.addEventListener('canplaythrough', Player.actions.playOnceLoaded);
					Player.audio.addEventListener('canplaythrough', Player.actions.playOnceLoaded);
				} else {
					Player.audio.play();
				}
			}
		} catch (err) {
			Player.logError('There was an error playing the sound. Please check the console for details.', err);
		}
	},

	/**
	 * Handler to only start playback once the video and audio are both loaded.
	 */
	playOnceLoaded(e) {
		if (e.currentTarget.readyState > 3 && e.currentTarget._linked.readyState > 3) {
			e.currentTarget.removeEventListener('canplaythrough', Player.actions.playOnceLoaded);
			e.currentTarget._linked.removeEventListener('canplaythrough', Player.actions.playOnceLoaded);
			e.currentTarget._inlinePlayer && e.currentTarget._inlinePlayer.pendingControls && e.currentTarget._inlinePlayer.pendingControls();
			e.currentTarget._linked.play();
			e.currentTarget.play();
		} else {
			!e.currentTarget.paused && e.currentTarget.pause();
			!e.currentTarget._linked.paused && e.currentTarget._linked.pause();
			e.currentTarget.currentTime !== 0 && (e.currentTarget.currentTime = 0);
			e.currentTarget._linked.currentTime !== 0 && (e.currentTarget._linked.currentTime = 0);
		}
	},

	/**
	 * Pause playback.
	 */
	pause() {
		Player.audio && Player.audio.pause();
	},

	/**
	 * Stop playback.
	 */
	stop() {
		Player.audio.src = null;
		Player.playing = null;
		Player.isVideo = false;
		Player.isStandalone = false;
		Player.trigger('stop');
	},

	/**
	 * Play the next sound.
	 */
	next(opts) {
		Player.actions._movePlaying(1, opts);
	},

	/**
	 * Play the previous sound.
	 */
	previous(opts) {
		// Over three seconds into a sound restarts it instead.
		if (Player.audio.currentTime > 3) {
			Player.audio.currentTime = 0;
		} else {
			Player.actions._movePlaying(-1, opts);
		}
	},

	_movePlaying(direction, { force, group, paused } = {}) {
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
	volumeUp() {
		Player.audio.volume = Math.min(Player.audio.volume + 0.05, 1);
	},

	/**
	 * Lower the volume by 5%.
	 */
	volumeDown() {
		Player.audio.volume = Math.max(Player.audio.volume - 0.05, 0);
	},

	/**
	 * Mute the audio, or reset it to the last volume prior to muting.
	 */
	toggleMute() {
		Player.audio.volume = (Player._lastVolume || 0.5) * !Player.audio.volume;
	}
};
