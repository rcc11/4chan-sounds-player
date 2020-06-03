const { parseFiles } = require('../file_parser');

module.exports = {
	atRoot: [ 'add', 'remove' ],

	delegatedEvents: {
		click: { [`.${ns}-list-item`]: 'playlist.handleSelect' },
		mousemove: { [`.${ns}-list-item`]: 'playlist.positionHoverImage' },
		dragstart: { [`.${ns}-list-item`]: 'playlist.handleDragStart' },
		dragenter: { [`.${ns}-list-item`]: 'playlist.handleDragEnter' },
		dragend: { [`.${ns}-list-item`]: 'playlist.handleDragEnd' },
		dragover: { [`.${ns}-list-item`]: e => e.preventDefault() },
		drop: { [`.${ns}-list-item`]: e => e.preventDefault() }
	},

	undelegatedEvents: {
		mouseenter: {
			[`.${ns}-list-item`]: 'playlist.updateHoverImage'
		},
		mouseleave: {
			[`.${ns}-list-item`]: 'playlist.removeHoverImage'
		}
	},

	initialize: function () {
		// Focus the playing song when switching to the playlist.
		Player.on('view', style => style === 'playlist' && Player.playlist.scrollToPlaying());

		// Update the UI when a new sound plays, and scroll to it.
		Player.on('playsound', sound => {
			Player.playlist.showImage(sound);
			Player.$all(`.${ns}-list-item.playing`).forEach(el => el.classList.remove('playing'));
			Player.$(`.${ns}-list-item[data-id="${Player.playing.id}"]`).classList.add('playing');
			Player.playlist.scrollToPlaying('nearest');
		});

		// Reapply filters when they change
		Player.on('config:filters', Player.playlist.applyFilters);

		// Listen to anything that can affect the display of hover images
		Player.on('config:hoverImages', Player.playlist.setHoverImageVisibility);
		Player.on('menu-open', Player.playlist.setHoverImageVisibility);
		Player.on('menu-close', Player.playlist.setHoverImageVisibility);

		// Maintain changes to the user templates it's dependent values
		Player.userTemplate.maintain(Player.playlist, 'rowTemplate', [ 'shuffle' ]);
	},

	/**
	 * Render the playlist.
	 */
	render: function () {
		if (!Player.container) {
			return;
		}
		const container = Player.$(`.${ns}-list-container`);
		container.innerHTML = Player.templates.list();
		Player.events.addUndelegatedListeners(Player.playlist.undelegatedEvents);
		Player.playlist.hoverImage = container.querySelector(`.${ns}-hover-image`);
	},

	/**
	 * Update the image displayed in the player.
	 */
	showImage: function (sound, thumb) {
		if (!Player.container) {
			return;
		}
		let isVideo = Player.playlist.isVideo = !thumb && (sound.image.endsWith('.webm') || sound.type === 'video/webm');
		try {
			const img = Player.$(`.${ns}-image`);
			const video = Player.$(`.${ns}-video`);
			img.src = '';
			img.src = isVideo || thumb ? sound.thumb : sound.image;
			video.src = isVideo ? sound.image : undefined;
			if (Player.config.viewStyle !== 'fullscreen') {
				Player.$(`.${ns}-image-link`).href = sound.image;
			}
			Player.$(`.${ns}-image-link`).classList[isVideo ? 'add' : 'remove'](ns + '-show-video');
		} catch (err) {
			_logError('There was an error display the sound player image. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},

	/**
	 * Switch between playlist and image view.
	 */
	toggleView: function (e) {
		if (!Player.container) {
			return;
		}
		e && e.preventDefault();
		let style = Player.config.viewStyle === 'playlist' ? 'image' : 'playlist';
		try {
			Player.display.setViewStyle(style);
		} catch (err) {
			_logError('There was an error switching the view style. Please check the console for details.', 'warning');
			console.error('[4chan sounds player]', err);
		}
	},

	/**
	 * Add a new sound from the thread to the player.
	 */
	add: function (sound, skipRender) {
		try {
			const id = sound.id;
			// Make sure the sound is an allowed host, not filtered, and not a duplicate.
			if (!Player.acceptedSound(sound) || Player.sounds.find(sound => sound.id === id)) {
				return;
			}

			// Add the sound with the location based on the shuffle settings.
			let index = Player.config.shuffle
				? Math.floor(Math.random() * Player.sounds.length - 1)
				: Player.sounds.findIndex(s => Player.compareIds(s.id, id) > 1);
			index < 0 && (index = Player.sounds.length);
			Player.sounds.splice(index, 0, sound);

			if (Player.container) {
				if (!skipRender) {
					// Add the sound to the playlist.
					const list = Player.$(`.${ns}-list-container`);
					let rowContainer = document.createElement('div');
					rowContainer.innerHTML = Player.templates.list({ sounds: [ sound ] });
					Player.events.addUndelegatedListeners(Player.playlist.undelegatedEvents, rowContainer);
					let row = rowContainer.children[0];
					if (index < Player.sounds.length - 1) {
						const before = Player.$(`.${ns}-list-item[data-id="${Player.sounds[index + 1].id}"]`);
						list.insertBefore(row, before);
					} else {
						list.appendChild(row);
					}
				}

				// If nothing else has been added yet show the image for this sound.
				if (Player.sounds.length === 1) {
					// If we're on a thread with autoshow enabled then make sure the player is displayed
					if (/\/thread\//.test(location.href) && Player.config.autoshow) {
						Player.show();
					}
					Player.playlist.showImage(sound);
				}
				Player.trigger('add', sound);
			}
		} catch (err) {
			_logError('There was an error adding to the sound player. Please check the console for details.');
			console.log('[4chan sounds player]', sound);
			console.error('[4chan sounds player]', err);
		}
	},

	/**
	 * Remove a sound
	 */
	remove: function (sound) {
		const index = Player.sounds.indexOf(sound);

		// If the playing sound is being removed then play the next sound.
		if (Player.playing === sound) {
			Player.pause();
			Player.next(true);
		}
		// Remove the sound from the the list and play order.
		index > -1 && Player.sounds.splice(index, 1);

		// Remove the item from the list.
		Player.$(`.${ns}-list-container`).removeChild(Player.$(`.${ns}-list-item[data-id="${sound.id}"]`))
		Player.trigger('remove', sound);
	},

	/**
	 * Handle an playlist item being clicked. Either open/close the menu or play the sound.
	 */
	handleSelect: function (e) {
		e.preventDefault();
		const id = e.eventTarget.getAttribute('data-id');
		const sound = id && Player.sounds.find(sound => sound.id === id);
		sound && Player.play(sound);
	},

	/**
	 * Read all the sounds from the thread again.
	 */
	refresh: function () {
		parseFiles(document.body);
	},

	/**
	 * Toggle the hoverImages setting
	 */
	toggleHoverImages: function (e) {
		e && e.preventDefault();
		Player.set('hoverImages', !Player.config.hoverImages);
	},

	/**
	 * Only show the hover image with the setting enabled, no item menu open, and nothing being dragged.
	 */
	setHoverImageVisibility: function () {
		const container = Player.$(`.${ns}-list-container`);
		const hideImage = !Player.config.hoverImages
			|| Player.playlist._dragging
			|| container.querySelector(`.${ns}-item-menu`);
		container.classList[hideImage ? 'add' : 'remove'](`${ns}-hide-hover-image`);
	},

	/**
	 * Set the displayed hover image and reposition.
	 */
	updateHoverImage: function (e) {
		const id = e.currentTarget.getAttribute('data-id');
		const sound = Player.sounds.find(sound => sound.id === id);
		Player.playlist.hoverImage.style.display = 'block';
		Player.playlist.hoverImage.setAttribute('src', sound.thumb);
		Player.playlist.positionHoverImage(e);
	},

	/**
	 * Reposition the hover image to follow the cursor.
	 */
	positionHoverImage: function(e) {
		const { width, height } = Player.playlist.hoverImage.getBoundingClientRect();
		const maxX = document.documentElement.clientWidth - width - 5;
		Player.playlist.hoverImage.style.left = (Math.min(e.clientX, maxX) + 5) + 'px';
		Player.playlist.hoverImage.style.top = (e.clientY - height - 10) + 'px';
	},

	/**
	 * Hide the hover image when nothing is being hovered over.
	 */
	removeHoverImage: function (e) {
		Player.playlist.hoverImage.style.display = 'none';
	},

	/**
	 * Start dragging a playlist item.
	 */
	handleDragStart: function (e) {
		Player.playlist._dragging = e.eventTarget;
		Player.playlist.setHoverImageVisibility();
		e.eventTarget.classList.add(`${ns}-dragging`);
		e.dataTransfer.setDragImage(new Image(), 0, 0);
		e.dataTransfer.dropEffect = 'move';
		e.dataTransfer.setData('text/plain', e.eventTarget.getAttribute('data-id'));
	},

	/**
	 * Swap a playlist item when it's dragged over another item.
	 */
	handleDragEnter: function (e) {
		e.preventDefault();
		const moving = Player.playlist._dragging;
		const id = moving.getAttribute('data-id');
		let before = e.target.closest && e.target.closest(`.${ns}-list-item`);
		if (!before || moving === before) {
			return;
		}
		const movingIdx = Player.sounds.findIndex(s => s.id === id);
		const list = moving.parentNode;

		// If the item is being moved down it need inserting before the node after the one it's dropped on.
		const position = moving.compareDocumentPosition(before);
		if (position & 0x04) {
			before = before.nextSibling;
		}

		// Move the element and sound.
		// If there's nothing to go before then append.
		if (before) {
			const beforeId = before.getAttribute('data-id');
			const beforeIdx = Player.sounds.findIndex(s => s.id === beforeId);
			const insertIdx = movingIdx < beforeIdx ? beforeIdx - 1 : beforeIdx;
			list.insertBefore(moving, before);
			Player.sounds.splice(insertIdx, 0, Player.sounds.splice(movingIdx, 1)[0]);
		} else {
			Player.sounds.push(Player.sounds.splice(movingIdx, 1)[0]);
			list.appendChild(moving);
		}
		Player.trigger('order');
	},

	/**
	 * Start dragging a playlist item.
	 */
	handleDragEnd: function (e) {
		e.preventDefault();
		delete Player.playlist._dragging;
		e.eventTarget.classList.remove(`${ns}-dragging`);
		Player.playlist.setHoverImageVisibility();
	},

	/**
	 * Scroll to the playing item, unless there is an open menu in the playlist.
	 */
	scrollToPlaying: function (type = 'center') {
		if (Player.$(`.${ns}-list-container .${ns}-item-menu`)) {
			return;
		}
		const playing = Player.$(`.${ns}-list-item.playing`);
		playing && playing.scrollIntoView({ block: type });
	},

	/**
	 * Remove any user filtered items from the playlist.
	 */
	applyFilters: function () {
		Player.sounds.filter(sound => !Player.acceptedSound(sound)).forEach(Player.playlist.remove);
	}
};
