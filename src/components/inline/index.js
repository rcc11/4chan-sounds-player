const selectors = require('../../selectors');
const controlsTemplate = require('../controls/templates/controls.tpl');

module.exports = {
	idx: 0,

	audio: { },
	expandedNodes: [ ],

	// Similar but not exactly the audio events in the controls component.
	mediaEvents: {
		ended: evt => Player.inline._movePlaying(evt.currentTarget.dataset.id, +(Player.config.expandedRepeat !== 'one')),
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
				let sounds = id && Player.sounds.filter(s => s.post === id && !s.standaloneVideo) || [];
				if (Player.config.expandedAllowFiltered) {
					sounds = sounds.concat(Player.filteredSounds.filter(s => s.post === id && !s.disallow.host));
				}
				if (!sounds.length) {
					return;
				}
				// Create a new audio element.
				const audio = new Audio(sounds[0].src);
				const aId = audio.dataset.id = Player.inline.idx++;
				const master = isVideo && Player.config.expandedLoopMaster === 'video' ? node : audio;
				Player.inline.audio[aId] = audio;

				// Remember this node is playing audio.
				Player.inline.expandedNodes.push(node);

				// Add some data and cross link the nodes.
				node.classList.add(`${ns}-has-inline-audio`);
				node._inlineAudio = audio;
				audio._inlinePlayer = node._inlinePlayer = {
					master,
					video: node,
					isVideo,
					audio,
					sounds,
					index: 0
				};
				// Link video & audio so they sync.
				if (isVideo) {
					node._linked = audio;
					audio._linked = node;
				}

				// Start from the beginning taking the volume from the main player.
				audio.src = sounds[0].src;
				audio.volume = Player.audio.volume;
				audio.currentTime = 0;

				// Add the sync handlers to which source is master.
				Player.inline.updateSyncListeners(master, 'add');

				// Show the player controls for expanded images/videos.
				const showPlayerControls = isExpandedImage && Player.config.expandedControls;

				if (isVideo && showPlayerControls) {
					// Remove the default controls, and remove them again when 4chan X tries to add them.
					node.controls = false;
					node.controlsObserver = new MutationObserver(() => node.controls = false);
					node.controlsObserver.observe(node, { attributes: true });
					// Play/pause the audio instead when the video is clicked.
					node.addEventListener('click', () => Player.inline.playPause(aId));
				}

				// For videos wait for both to load before playing.
				if (isVideo && (node.readyState < 3 || audio.readyState < 3)) {
					audio.pause();
					node.pause();
					// Set the add controls function so playOnceLoaded can run it when it's ready.
					node._inlinePlayer.pendingControls = showPlayerControls && addControls;
					node.addEventListener('canplaythrough', Player.actions.playOnceLoaded);
					audio.addEventListener('canplaythrough', Player.actions.playOnceLoaded);
				} else {
					showPlayerControls && addControls();
					audio.play();
				}

				function addControls() {
					delete node._inlinePlayer.pendingControls;
					node.parentNode.classList.add(`${ns}-has-controls`);
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
					}), node.parentNode);
					// Don't want to close the expanded image or open the image when the controls are clicked.
					controls.addEventListener('click', e => {
						e.preventDefault();
						e.stopPropagation();
					});
					audio.volumeBar = controls.querySelector(`.${ns}-volume-bar .${ns}-current-bar`);
					audio.currentTimeBar = controls.querySelector(`.${ns}-seek-bar .${ns}-current-bar`);
					Player.controls.updateProgressBarPosition(audio.volumeBar, audio.volume, 1);
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
		const nodes = [ node ];
		node.querySelectorAll && nodes.push(...node.querySelectorAll(`.${ns}-has-inline-audio`));
		nodes.forEach(node => {
			if (node._inlineAudio) {
				Player.inline._removeForNode(node);
			}
		});
	},

	_removeForNode(node) {
		// Stop removing controls.
		node.controlsObserver && node.controlsObserver.disconnect();
		// Stop listening for media events.
		Player.inline.updateSyncListeners(node._inlinePlayer.master, 'remove');
		// Remove controls.
		const controls = node._inlineAudio._inlinePlayer.controls;
		if (controls) {
			controls.parentNode.classList.remove(`${ns}-has-controls`);
			controls.parentNode.removeChild(controls);
		}
		// Stop the audio and cleanup the data.
		node._inlineAudio.pause();
		delete Player.inline.audio[node._inlineAudio.dataset.id];
		delete node._inlineAudio;
		Player.inline.expandedNodes = Player.inline.expandedNodes.filter(n => n !== node);
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
		Player.inline.expandedNodes.forEach(Player.inline._removeForNode);
		Player.inline.expandedNodes = [];
	},

	/**
	 * Handle previous click for inline controls.
	 *
	 * @param {String} audioId Identifier of the inline audio.
	 */
	previous(audioId) {
		const audio = Player.inline.audio[audioId];
		if (audio.currentTime > 3) {
			audio.currentTime = 0;
		} else {
			Player.inline._movePlaying(audioId, -1);
		}
	},

	/**
	 * Handle next click for inline controls.
	 *
	 * @param {String} audioId Identifier of the inline audio.
	 */
	next(audioId) {
		Player.inline._movePlaying(audioId, 1);
	},

	_movePlaying(audioId, dir) {
		const audio = Player.inline.audio[audioId];
		const data = audio && audio._inlinePlayer;
		const count = data.sounds.length;
		const repeat = Player.config.expandedRepeat;
		if (data && (repeat !== 'none' || data.index + dir >= 0 && data.index + dir < count)) {
			data.index = (data.index + dir + count) % count;
			audio.src = data.sounds[data.index].src;
			if (data.controls) {
				const prev = data.controls.querySelector(`.${ns}-previous-button`);
				const next = data.controls.querySelector(`.${ns}-next-button`);
				prev && prev.classList[repeat !== 'all' && data.index === 0 ? 'add' : 'remove']('disabled');
				next && next.classList[repeat !== 'all' && data.index === count - 1 ? 'add' : 'remove']('disabled');
			}
			// For videos wait for both to load before playing.
			if (data.isVideo && (data.video.readyState < 3 || audio.readyState < 3)) {
				data.master.currentTime = 0;
				data.master.pause();
				data.video.pause();
				data.video.addEventListener('canplaythrough', Player.actions.playOnceLoaded);
				audio.addEventListener('canplaythrough', Player.actions.playOnceLoaded);
			} else {
				data.master.currentTime = 0;
				data.master.play();
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
	 * Handle mute click for inline controls.
	 *
	 * @param {String} audioId Identifier of the inline audio.
	 */
	mute(audioId) {
		const audio = Player.inline.audio[audioId];
		audio && (audio.volume = (Player._lastVolume || 0.5) * !audio.volume);
	}
};
