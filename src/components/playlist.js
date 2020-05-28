const { parseFiles } = require('../file_parser');

module.exports = {
	atRoot: [ 'add', 'remove' ],

	delegatedEvents: {
		click: {
			[`.${ns}-viewStyle-button`]: 'playlist.toggleView',
			[`.${ns}-hoverImages-button`]: 'playlist.toggleHoverImages',
			[`.${ns}-remove-link`]: 'playlist.handleRemove',
			[`.${ns}-list-item`]: 'playlist.handleSelect',
			[`.${ns}-filter-link`]: 'playlist.handleFilter'
		},
		mousemove: { [`.${ns}-list-item`]: 'playlist.moveHoverImage' },
		dragstart: { [`.${ns}-list-item`]: 'playlist.handleDragStart' },
		dragenter: { [`.${ns}-list-item`]: 'playlist.handleDragEnter' },
		dragend: { [`.${ns}-list-item`]: 'playlist.handleDragEnd' },
		dragover: { [`.${ns}-list-item`]: e => e.preventDefault() },
		drop: { [`.${ns}-list-item`]: e => e.preventDefault() }
	},

	undelegatedEvents: {
		click: {
			body: 'playlist.closeMenus'
		},
		keydown: {
			body: e => e.key === 'Escape' && Player.playlist.closeMenus()
		},
		mouseenter: {
			[`.${ns}-list-item`]: 'playlist.showHoverImage'
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
		Player.on('config', property => property === 'filters' && Player.playlist.applyFilters());
	},

	/**
	 * Render the playlist.
	 */
	render: function () {
		if (!Player.container) {
			return;
		}
		if (Player.$(`.${ns}-list-container`)) {
			Player.$(`.${ns}-list-container`).innerHTML = Player.templates.list();
		}
		Player.events.addUndelegatedListeners({
			mouseenter: Player.playlist.undelegatedEvents.mouseenter,
			mouseleave:  Player.playlist.undelegatedEvents.mouseleave
		});
	},

	/**
	 * Update the image displayed in the player.
	 */
	showImage: function (sound, thumb) {
		if (!Player.container) {
			return;
		}
		let isVideo = Player.playlist.isVideo = !thumb && sound.image.endsWith('.webm');
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
			Player.header.render();
			Player.settings.save();
		} catch (err) {
			_logError('There was an error switching the view style. Please check the console for details.', 'warning');
			console.error('[4chan sounds player]', err);
		}
	},

	/**
	 * Add a new sound from the thread to the player.
	 */
	add: function (title, id, src, thumb, image, post, imageMD5, skipRender) {
		try {
			const sound = { title, src, id, thumb, image, post, imageMD5 };
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
			console.log('[4chan sounds player]', title, id, src, thumb, image);
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
	 * Handle a click on the remove link
	 */
	handleRemove: function (e) {
		const id = e.eventTarget.closest(`.${ns}-list-item`).getAttribute('data-id');
		const sound = id && Player.sounds.find(sound => sound.id === '' + id);
		sound && Player.remove(sound);
	},

	/**
	 * Close any open menus, except for one belonging to an item that was clicked.
	 */
	closeMenus: function (e) {
		const clickedListItem = e && e.target.closest(`.${ns}-list-item`);

		document.querySelectorAll(`.${ns}-item-menu`).forEach(menu => {
			const row = menu.parentNode;
			// Ignore for a list item that was clicked. The handleSelect below will deal with it.
			if (row === clickedListItem) {
				return;
			}
			row.removeChild(menu);
			row.classList.remove(`.${ns}-has-menu`);
		});
	},

	/**
	 * Handle an playlist item being clicked. Either open/close the menu or play the sound.
	 */
	handleSelect: function (e) {
		const clickedMenu = e.target.closest(`.${ns}-item-menu`);
		const menu = clickedMenu || e.eventTarget.querySelector(`.${ns}-item-menu`);

		const id = e.eventTarget.getAttribute('data-id');
		const clickedMenuButton = e.target.closest(`.${ns}-item-menu-button`);
		const sound = id && Player.sounds.find(sound => sound.id === id);

		// Remove the menu.
		if (menu) {
			e.eventTarget.removeChild(menu);
			e.eventTarget.classList.remove(`.${ns}-has-menu`);

		// If the manu wasn't showing and menu button was clicked go ahead and show the menu.
		} else if (clickedMenuButton) {
			e.preventDefault();
			if (e.eventTarget.hoverImage) {
				e.eventTarget.hoverImage.parentNode.removeChild(e.eventTarget.hoverImage);
				delete e.eventTarget.hoverImage;
			}
			// Create the menu.
			const container = document.createElement('div');
			container.innerHTML = Player.templates.itemMenu({
				top: e.clientY,
				left: e.clientX,
				sound
			});
			const dialog = container.children[0];

			// Update the row with it.
			e.eventTarget.appendChild(dialog);
			e.eventTarget.classList.remove(`.${ns}-has-menu`);

			// Make sure it's within the page.
			const style = document.defaultView.getComputedStyle(dialog);
			const width = parseInt(style.width, 10);
			const height = parseInt(style.height, 10);
			// Show the dialog to the left of the cursor, if there's room.
			if (e.clientX - width > 0) {
				dialog.style.left = e.clientX - width + 'px';
			}
			// Move the dialog above the cursor if it's off screen.
			if (e.clientY + height > document.documentElement.clientHeight - 40) {
				dialog.style.top = e.clientY - height + 'px';
			}
			// Add the focused class handler
			dialog.querySelectorAll('.entry').forEach(el => {
				el.addEventListener('mouseenter', Player.playlist.setFocusedMenuItem);
				el.addEventListener('mouseleave', Player.playlist.unsetFocusedMenuItem);
			});
		}

		// If the menu or menu button was clicked don't play the sound.
		if (clickedMenuButton || clickedMenu) {
			return;
		}

		e.preventDefault();
		sound && Player.play(sound);
	},

	setFocusedMenuItem: function (e) {
		e.currentTarget.classList.add('focused');
	},

	unsetFocusedMenuItem: function (e) {
		e.currentTarget.classList.remove('focused');
	},

	refresh: function () {
		parseFiles(document.body);
	},

	toggleHoverImages: function (e) {
		e && e.preventDefault();
		Player.config.hoverImages = !Player.config.hoverImages;
		Player.header.render();
		Player.settings.save();
	},

	showHoverImage: function (e) {
		// Make sure there isn't already an image, hover images are enabled, and there isn't an open menu.
		if (e.currentTarget.hoverImage || !Player.config.hoverImages || Player.$(`.${ns}-item-menu`)) {
			return;
		}
		const id = e.currentTarget.getAttribute('data-id');
		const sound = Player.sounds.find(sound => sound.id === id);
		const hoverImage = document.createElement('img');

		// Add it to the list so the mouseleave triggers properly
		e.currentTarget.parentNode.appendChild(hoverImage);
		e.currentTarget.hoverImage = hoverImage;
		hoverImage.setAttribute('class', `${ns}-hover-image`);
		hoverImage.setAttribute('src', sound.thumb);
		Player.playlist.positionHoverImage(e, hoverImage);
	},

	moveHoverImage: function (e) {
		if (e.eventTarget.hoverImage) {
			Player.playlist.positionHoverImage(e, e.eventTarget.hoverImage);
		}
	},

	positionHoverImage: function(e, image) {
		const { width, height } = image.getBoundingClientRect();
		const maxX = document.documentElement.clientWidth - width - 5;
		image.style.left = (Math.min(e.clientX, maxX) + 5) + 'px';
		image.style.top = (e.clientY - height - 10) + 'px';
	},

	removeHoverImage: function (e) {
		e.currentTarget.hoverImage && (e.currentTarget.parentNode.removeChild(e.currentTarget.hoverImage));
		delete e.currentTarget.hoverImage;
	},

	handleDragStart: function (e) {
		Player.playlist._dragging = e.eventTarget;
		Player._hoverImages = Player.config.hoverImages;
		Player.config.hoverImages = false;
		e.eventTarget.classList.add(`${ns}-dragging`);
		e.dataTransfer.setDragImage(new Image(), 0, 0);
		e.dataTransfer.dropEffect = 'move';
		e.dataTransfer.setData('text/plain', e.eventTarget.getAttribute('data-id'));
	},

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

	handleDragEnd: function (e) {
		e.preventDefault();
		delete Player.playlist._dragging;
		e.eventTarget.classList.remove(`${ns}-dragging`);
		Player.config.hoverImages = Player._hoverImages;
	},

	scrollToPlaying: function (type = 'center') {
		// Avoid scrolling if there's a menu open. That would be quite rude.
		if (Player.$(`.${ns}-item-menu`)) {
			return;
		}
		const playing = Player.$(`.${ns}-list-item.playing`);
		playing && playing.scrollIntoView({ block: type });
	},

	handleFilter: function (e) {
		e.preventDefault();
		let filter = e.eventTarget.getAttribute('data-filter');
		if (filter) {
			Player.config.filters.push(filter);
			Player.playlist.applyFilters();
			Player.settings.render();
			Player.settings.save();
		}
	},

	applyFilters: function () {
		Player.sounds.filter(sound => !Player.acceptedSound(sound)).forEach(Player.playlist.remove);
	}
};
