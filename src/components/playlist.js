module.exports = {
	atRoot: [ 'add', 'remove' ],

	delegatedEvents: {
		click: {
			[`.${ns}-viewStyle-button`]: 'playlist.toggleView',
			[`.${ns}-remove-link`]: 'playlist.handleRemove',
			[`.${ns}-list-item`]: 'playlist.handleSelect'
		}
	},

	undelegatedEvents: {
		click: {
			body: 'playlist.closeMenus'
		},
		keydown: {
			body: e => e.key === 'Escape' && Player.playlist.closeMenus()
		}
	},

	/**
	 * Render the playlist.
	 */
	render: function () {
		if (!Player.container) {
			return;
		}
		if (Player.$(`.${ns}-list`)) {
			Player.$(`.${ns}-list`).innerHTML = Player.templates.list(Player.display._tplOptions());
		}
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
			Player.$(`.${ns}-image`).src = isVideo || thumb ? sound.thumb : sound.image;
			if (isVideo) {
				Player.$(`.${ns}-video`).src = sound.image;
				Player.$(`.${ns}-image-link`).classList.add(ns + '-show-video');
			} else {
				Player.$(`.${ns}-image-link`).href = sound.image;
				Player.$(`.${ns}-image-link`).classList.remove(ns + '-show-video');
			}
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
	add: function (title, id, src, thumb, image) {
		try {
			// Avoid duplicate additions.
			if (Player.sounds.find(sound => sound.id === id)) {
				return;
			}
			const sound = { title, src, id, thumb, image };
			Player.sounds.push(sound);

			// Add the sound to the play order at the end, or someone random for shuffled.
			const index = Player.config.shuffle
				? Math.floor(Math.random() * Player.sounds.length - 1)
				: Player.sounds.length;
			Player.playOrder.splice(index, 0, sound);

			if (Player.container) {
				// Re-render the list.
				Player.playlist.render();
				Player.$(`.${ns}-count`).innerHTML = Player.sounds.length;

				// If nothing else has been added yet show the image for this sound.
				if (Player.playOrder.length === 1) {
					// If we're on a thread with autoshow enabled then make sure the player is displayed
					if (/\/thread\//.test(location.href) && Player.config.autoshow) {
						Player.show();
					}
					Player.playlist.showImage(sound);
				}
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
		const orderIndex = Player.playOrder.indexOf(sound);

		// If the playing sound is being removed then play the next sound.
		if (Player.playing === sound) {
			Player.pause();
			Player.next(true);
		}
		// Remove the sound from the the list and play order.
		index > -1 && Player.sounds.splice(index, 1);
		orderIndex > -1 && Player.playOrder.splice(orderIndex, 1);

		// Re-render the list.
		Player.playlist.render();
		Player.$(`.${ns}-count`).innerHTML = Player.sounds.length;
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
		const sound = id && Player.sounds.find(sound => sound.id === '' + id);

		// Remove the menu.
		if (menu) {
			e.eventTarget.removeChild(menu);
			e.eventTarget.classList.remove(`.${ns}-has-menu`);

		// If the manu wasn't showing and menu button was clicked go ahead and show the menu.
		} else if (clickedMenuButton) {
			e.preventDefault();
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
	}
};
