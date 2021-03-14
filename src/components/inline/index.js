const selectors = require('../../selectors');
const controlsTemplate = require('../controls/templates/controls.tpl');

module.exports = {
	idx: 0,

	audio: { },
	expandedNodes: [ ],

	// Similar but not exactly the audio events in the controls component.
	mediaEvents: {
		pause: 'controls.handleMediaEvent',
		play: 'controls.handleMediaEvent',
		seeked: 'controls.handleMediaEvent',
		waiting: 'controls.handleMediaEvent',
		timeupdate: 'controls.updateDuration',
		loadedmetadata: 'controls.updateDuration',
		durationchange: 'controls.updateDuration',
		volumechange: 'controls.updateVolume'
	},

	initialize() {
		if (!is4chan) {
			return;
		}

		Player.inline.observer = new MutationObserver(function (mutations) {
			mutations.forEach(function (mutation) {
				mutation.addedNodes.forEach(Player.inline.handleAddedNode);
				mutation.removedNodes.forEach(Player.inline.handleRemovedNode);
			});
		});

		Player.on('config:playExpandedImages', Player.inline._handleConfChange);
		Player.on('config:playHoveredImages', Player.inline._handleConfChange);
		Player.inline._handleConfChange();
	},

	/**
	 * Start/stop observing for hover images when a dependent conf is changed.
	 */
	_handleConfChange() {
		if (Player.config.playExpandedImages || Player.config.playHoveredImages) {
			Player.inline.start();
		} else {
			Player.inline.stop();
		}
	},

	/**
	 * Check if an added node is an expanded/hover sound image and play the audio.
	 *
	 * @param {Element} node Added node.
	 */
	handleAddedNode(node) {
		try {
			if (node.nodeName !== 'IMG' && node.nodeName !== 'VIDEO') {
				return;
			}
			const isExpandedImage = Player.config.playExpandedImages && node.matches(selectors.expandedImage);
			const isHoverImage = Player.config.playHoveredImages && node.matches(selectors.hoverImage);

			if (isExpandedImage || isHoverImage) {
				const isVideo = node.nodeName === 'VIDEO';
				let id;
				try {
					// 4chan X images have the id set. Handy.
					// Otherwise get the parent post, looking up the image link for native hover images, and the id from it.
					id = isChanX
						? node.dataset.fileID.split('.')[1]
						: (isExpandedImage ? node : document.querySelector(`a[href$="${node.src.replace(/^https?:/, '')}"]`))
							.closest(selectors.posts).id.slice(selectors.postIdPrefix.length);
				} catch (err) {
					return;
				}
				// Check for sounds added to the player.
				const sounds = id && Player.sounds.filter(s => s.post === id);
				if (!sounds.length) {
					return;
				}
				// Create a new audio element.
				const audio = new Audio(sounds[0].src);
				const aId = audio.dataset.id = Player.inline.idx++;
				Player.inline.audio[aId] = audio;

				// Remember this node is playing audio.
				Player.inline.expandedNodes.push(node);

				// Add some data and cross link the nodes.
				node._inlineAudio = audio;
				audio._inlinePlayer = {
					master: isVideo ? node : audio,
					video: node,
					sounds,
					index: 0
				};

				// Start from the beginning taking the volume from the main player.
				audio.src = sounds[0].src;
				audio.volume = Player.audio.volume;
				audio.currentTime = 0;

				if (isVideo) {
					// For videos link the two to keep them in sync and set the listeners on the video.
					// That way the video controls propagate to the audio.
					node._linked = audio;
					audio._linked = node;
					Player.inline.updateSyncListeners(node, 'add');
				} else if (isExpandedImage && Player.config.expandedControls) {
					// For images, with controls enabled, set the listeners on the audio to sync to controls display.
					Player.inline.updateSyncListeners(audio, 'add');
					// Create the controls and store the bars on the audio node for reference. Avoid checking the DOM.
					const controls = audio._inlinePlayer.controls = _.element(controlsTemplate({
						audio,
						multiple: sounds.length > 1,
						audioId: aId,
						inline: true,
						actions: {
							previous: `inline.previous("${aId}"):disabled`,
							playPause: `inline.playPause("${aId}")`,
							next: `inline.next("${aId}"):disabled`,
							seek: `controls.handleSeek("evt", "${aId}"):prevent`,
							mute: `inline.mute("${aId}")`,
							volume: `controls.handleVolume("evt", "${aId}"):prevent`
						}
					}), node.closest(selectors.posts));
					audio.volumeBar = controls.querySelector(`.${ns}-volume-bar .${ns}-current-bar`);
					audio.currentTimeBar = controls.querySelector(`.${ns}-seek-bar .${ns}-current-bar`);
					Player.controls.updateProgressBarPosition(audio.volumeBar, audio.volume, 1);
				}

				// For videos wait for both to load before playing.
				if (isVideo && (node.readyState < 3 || audio.readyState < 3)) {
					audio.pause();
					node.pause();
					node.addEventListener('canplaythrough', Player.actions.playOnceLoaded);
					audio.addEventListener('canplaythrough', Player.actions.playOnceLoaded);
				} else {
					audio.play();
				}
			}
		} catch (err) {
			Player.logError('Failed to play sound.', err);
		}
	},

	/**
	 * Check if a removed node is an expanded/hover sound image and stop the audio.
	 *
	 * @param {Element} node Added node.
	 */
	handleRemovedNode(node) {
		if (node._inlineAudio) {
			// Stop listening for media events.
			Player.inline.updateSyncListeners(node._inlineAudio._inlinePlayer.master, 'remove');
			// Remove controls.
			const controls = node._inlineAudio._inlinePlayer.controls;
			controls && controls.parentNode.removeChild(controls);
			// Stop the audio and cleanup the data.
			node._inlineAudio.pause();
			delete Player.inline.audio[node._inlineAudio.dataset.id];
			delete node._inlineAudio;
			Player.inline.expandedNodes = Player.inline.expandedNodes.filter(n => n !== node);
		}
	},

	/**
	 * Set audio/video sync listeners on a video for an inline sound webm.
	 *
	 * @param {Element} video Video node.
	 * @param {String} action add or remove.
	 */
	updateSyncListeners(node, action) {
		if (node.nodeName === 'VIDEO' || node.nodeName === 'AUDIO') {
			const audio = node._inlineAudio || node;
			if (action === 'remove') {
				const video = audio._inlinePlayer.video;
				video.removeEventListener('canplaythrough', Player.actions.playOnceLoaded);
				audio.removeEventListener('canplaythrough', Player.actions.playOnceLoaded);
			}
			Object.entries(Player.inline.mediaEvents).forEach(([ event, handler ]) => {
				node[`${action}EventListener`](event, Player.getHandler(handler));
			});
			action === 'add' && !node._endedListener && (node._endedListener = () => Player.inline.next(audio.dataset.id));
			node[`${action}EventListener`]('ended', node._endedListener);
		}
	},

	/**
	 * Start observing for expanded/hover images.
	 */
	start() {
		Player.inline.observer.observe(document.body, {
			childList: true,
			subtree: true
		});
	},

	/**
	 * Stop observing for expanded/hover images.
	 */
	stop() {
		Player.inline.observer.disconnect();
		Player.inline.expandedNodes.forEach(node => {
			Player.inline.updateSyncListeners(node, 'remove');
			node._inlineAudio.pause();
		});
		Player.inline.expandedNodes = [];
	},

	/**
	 * Handle previous click for inline controls.
	 *
	 * @param {String} audioId Identifier of the inline audio.
	 */
	previous(audioId) {
		const audio = Player.inline.audio[audioId];
		const data = audio && audio._inlinePlayer;
		if (data && data.index > 0) {
			audio.src = data.sounds[--data.index].src;
			audio.play();
			data.controls.querySelector(`.${ns}-next-button`).classList.remove('disabled');
			if (data.index === 0) {
				data.controls.querySelector(`.${ns}-previous-button`).classList.add('disabled');
			}
		}
	},

	/**
	 * Handle play/pause click for inline controls.
	 *
	 * @param {String} audioId Identifier of the inline audio.
	 */
	playPause(audioId) {
		const audio = Player.inline.audio[audioId];
		audio && audio[audio.paused ? 'play' : 'pause']();
	},

	/**
	 * Handle next click for inline controls.
	 *
	 * @param {String} audioId Identifier of the inline audio.
	 */
	next(audioId) {
		const audio = Player.inline.audio[audioId];
		const data = audio && audio._inlinePlayer;
		if (data && data.index < data.sounds.length - 1) {
			audio.src = data.sounds[++data.index].src;
			audio.play();
			data.controls.querySelector(`.${ns}-previous-button`).classList.remove('disabled');
			if (data.index === data.sounds.length - 1) {
				data.controls.querySelector(`.${ns}-next-button`).classList.add('disabled');
			}
		}
	},

	/**
	 * Handle mute click for inline controls.
	 *
	 * @param {String} audioId Identifier of the inline audio.
	 */
	mute(audioId) {
		const audio = Player.inline.audio[audioId];
		audio && (audio.volume = (Player._lastVolume || 0.5) * !audio.volume);
	}
};
