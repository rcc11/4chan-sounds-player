const { parseFiles, parseFileName } = require('../../file_parser');
const { postIdPrefix } = require('../../selectors');

const itemMenuTemplate = require('./templates/item_menu.tpl');

module.exports = {
	atRoot: [ 'add', 'remove' ],
	public: [ 'search' ],

	template: require('./templates/player.tpl'),
	listTemplate: require('./templates/list.tpl'),

	delegatedEvents: {
		click: { [`.${ns}-list-item`]: 'playlist.handleSelect' },
		dragstart: { [`.${ns}-list-item`]: 'playlist.handleDragStart' },
		dragenter: { [`.${ns}-list-item`]: 'playlist.handleDragEnter' },
		dragend: { [`.${ns}-list-item`]: 'playlist.handleDragEnd' },
		dragover: { [`.${ns}-list-item`]: e => e.preventDefault() },
		drop: { [`.${ns}-list-item`]: e => e.preventDefault() },
		keyup: { [`.${ns}-playlist-search`]: 'playlist._handleSearch' },
		contextmenu: { [`.${ns}-list-item`]: 'playlist._handleItemMenu' }
	},

	undelegatedEvents: {
		mouseenter: { [`.${ns}-list-item`]: 'playlist.updateHoverImage' },
		mouseleave: { [`.${ns}-list-item`]: 'playlist.removeHoverImage' },
		mousemove: { [`.${ns}-list-item`]: 'playlist.positionHoverImage' }
	},

	initialize: function () {
		// Keep track of the last view style so we can return to it.
		Player.playlist._lastView = Player.config.viewStyle === 'playlist' || Player.config.viewStyle === 'image'
			? Player.config.viewStyle
			: 'playlist';

		Player.on('view', style => {
			// Focus the playing song when switching to the playlist.
			style === 'playlist' && Player.playlist.scrollToPlaying();
			// Track state.
			if (style === 'playlist' || style === 'image') {
				Player.playlist._lastView = style;
			}
		});

		// Keey track of  of the hover image element.
		Player.on('rendered', () => Player.playlist.hoverImage = Player.$(`.${ns}-hover-image`));

		// Update the UI when a new sound plays, and scroll to it.
		Player.on('playsound', sound => {
			Player.playlist.showImage(sound);
			Player.$all(`.${ns}-list-item.playing, .${ns}-list-item[data-id="${Player.playing.id}"]`).forEach(el => {
				const newItem = Player.playlist.listTemplate({ sounds: [ Player.sounds.find(s => s.id === el.dataset.id) ] });
				_.elementBefore(newItem, el, Player.playlist.undelegatedEvents);
				el.parentNode.removeChild(el);
			});
			Player.config.viewStyle !== 'fullscreen' && Player.playlist.scrollToPlaying('nearest');
			Player.config.autoScrollThread && sound.post && (location.href = location.href.split('#')[0] + '#' + postIdPrefix + sound.post);
		});

		// Reset to the placeholder image when the player is stopped.
		Player.on('stop', () => {
			Player.$all(`.${ns}-list-item.playing`).forEach(el => el.classList.remove('playing'));
			Player.playlist.showImage({ image: `data:image/svg+xml;base64,${btoa(Icons.fcSounds)}` });
		});

		// Reapply filters when they change
		Player.on('config:filters', Player.playlist.applyFilters);

		// Listen to anything that can affect the display of hover images
		Player.on('config:hoverImages', Player.playlist.setHoverImageVisibility);
		Player.on('menu-open', Player.playlist.setHoverImageVisibility);
		Player.on('menu-close', Player.playlist.setHoverImageVisibility);

		// Listen to the search display being toggled
		Player.on('config:showPlaylistSearch', Player.playlist.toggleSearch);

		// Maintain changes to the user templates it's dependent values
		Player.userTemplate.maintain(Player.playlist, 'rowTemplate', [ 'shuffle' ]);
	},

	/**
	 * Render the playlist.
	 */
	render: function () {
		const container = Player.$(`.${ns}-list-container`);
		container.innerHTML = Player.playlist.listTemplate();
		Player.events.addUndelegatedListeners(document.body, Player.playlist.undelegatedEvents);
		Player.playlist.hoverImage = Player.$(`.${ns}-hover-image`);
	},

	/**
	 * Restore the last playlist or image view.
	 */
	restore: function () {
		Player.display.setViewStyle(Player.playlist._lastView || 'playlist');
	},

	/**
	 * Update the image displayed in the player.
	 */
	showImage: function (sound) {
		const container = document.querySelector(`.${ns}-image-link`);
		const img = container.querySelector(`.${ns}-image`);
		const video = container.querySelector(`.${ns}-video`);
		const background = container.querySelector(`.${ns}-background-image`);
		img.src = background.src = '';
		img.src = background.src = sound.imageOrThumb;
		video.src = Player.isVideo ? sound.image : undefined;
		if (Player.config.viewStyle !== 'fullscreen') {
			container.href = sound.image;
		}
		container.classList[Player.isVideo ? 'add' : 'remove'](ns + '-show-video');
	},

	/**
	 * Switch between playlist and image view.
	 */
	toggleView: function (e) {
		e && e.preventDefault();
		let style = Player.config.viewStyle === 'playlist' ? 'image'
			: Player.config.viewStyle === 'image' ? 'playlist'
			: Player.playlist._lastView;
		Player.display.setViewStyle(style);
	},

	/**
	 * Add a new sound from the thread to the player.
	 */
	add: function (sound, skipRender) {
		try {
			const id = sound.id;
			// Make sure the sound is not a duplicate.
			if (Player.sounds.find(sound => sound.id === id)) {
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
					let rowContainer = _.element(`<div>${Player.playlist.listTemplate({ sounds: [ sound ] })}</div>`, null, Player.playlist.undelegatedEvents);
					if (index < Player.sounds.length - 1) {
						const before = Player.$(`.${ns}-list-item[data-id="${Player.sounds[index + 1].id}"]`);
						list.insertBefore(rowContainer.children[0], before);
					} else {
						list.appendChild(rowContainer.children[0]);
					}
				}

				// If nothing else has been added yet show the image for this sound.
				if (Player.sounds.length === 1) {
					Player.playlist.showImage(sound);
				}
				// Auto show if enabled, we're on a thread, and this is the first non-standlone item.
				if (Player.config.autoshow && /\/thread\//.test(location.href) && Player.sounds.filter(s => !s.standaloneVideo).length === 1) {
					Player.show();
				}
				Player.trigger('add', sound);
			}
		} catch (err) {
			Player.logError('There was an error adding to the sound player. Please check the console for details.', err);
			console.log('[4chan sounds player]', sound);
		}
	},

	addFromFiles: function (files) {
		// Check each of the files for sounds.
		[ ...files ].forEach(file => {
			if (!file.type.startsWith('image') && file.type !== 'video/webm') {
				return;
			}
			const imageSrc = URL.createObjectURL(file);
			const type = file.type;
			let thumbSrc = imageSrc;

			// If it's not a webm just use the full image as the thumbnail
			if (file.type !== 'video/webm') {
				return _continue();
			}

			// If it's a webm grab the first frame as the thumbnail
			const canvas = document.createElement('canvas');
			const video = document.createElement('video');
			const context = canvas.getContext('2d');
			video.addEventListener('loadeddata', function () {
				context.drawImage(video, 0, 0);
				thumbSrc = canvas.toDataURL();
				_continue();
			});
			video.src = imageSrc;

			function _continue() {
				parseFileName(file.name, imageSrc, null, thumbSrc, null, true).forEach(sound => Player.add({ ...sound, local: true, type }));
			}
		});
	},

	/**
	 * Remove a sound
	 */
	remove: function (sound) {
		const index = Player.sounds.indexOf(sound);

		// If the playing sound is being removed then play the next sound.
		if (Player.playing === sound) {
			Player.next({ force: true, paused: Player.audio.paused });
		}
		// Remove the sound from the the list and play order.
		index > -1 && Player.sounds.splice(index, 1);

		// Remove the item from the list.
		Player.$(`.${ns}-list-container`).removeChild(Player.$(`.${ns}-list-item[data-id="${sound.id}"]`));
		Player.trigger('remove', sound);
	},

	/**
	 * Handle an playlist item being clicked. Either open/close the menu or play the sound.
	 */
	handleSelect: function (e) {
		// Ignore if a link was clicked.
		if (e.target.nodeName === 'A' || e.target.closest('a')) {
			return;
		}
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
	 * Display an item menu.
	 */
	_handleItemMenu: function (e) {
		e.preventDefault();
		e.stopPropagation();
		const id = e.eventTarget.getAttribute('data-id');
		const sound = Player.sounds.find(s => s.id === id);

		// Add row item menus to the list container. Append to the container otherwise.
		const listContainer = e.eventTarget.closest(`.${ns}-list-container`);
		const parent = listContainer || Player.container;

		// Create the menu.
		const dialog = _.element(itemMenuTemplate({ sound, postIdPrefix }), parent);
		const relative = e.eventTarget.classList.contains(`${ns}-item-menu-button`) ? e.eventTarget : e;
		Player.userTemplate._showMenu(relative, dialog, parent);
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
		const container = Player.$(`.${ns}-player`);
		const hideImage = !Player.config.hoverImages
			|| Player.playlist._dragging
			|| container.querySelector(`.${ns}-menu`);
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
	positionHoverImage: function (e) {
		const { width, height } = Player.playlist.hoverImage.getBoundingClientRect();
		const maxX = document.documentElement.clientWidth - width - 5;
		Player.playlist.hoverImage.style.left = (Math.min(e.clientX, maxX) + 5) + 'px';
		Player.playlist.hoverImage.style.top = (e.clientY - height - 10) + 'px';
	},

	/**
	 * Hide the hover image when nothing is being hovered over.
	 */
	removeHoverImage: function () {
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
		if (!Player.playlist._dragging) {
			return;
		}
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
		if (!Player.playlist._dragging) {
			return;
		}
		e.preventDefault();
		delete Player.playlist._dragging;
		e.eventTarget.classList.remove(`${ns}-dragging`);
		Player.playlist.setHoverImageVisibility();
	},

	/**
	 * Scroll to the playing item, unless there is an open menu in the playlist.
	 */
	scrollToPlaying: function (type = 'center') {
		if (Player.$(`.${ns}-list-container .${ns}-menu`)) {
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
	},

	/**
	 * Search the playlist
	 */
	_handleSearch: function (e) {
		Player.playlist.search(e.eventTarget.value.toLowerCase());
	},

	search: function (v) {
		const lastSearch = Player.playlist._lastSearch;
		Player.playlist._lastSearch = v;
		if (v === lastSearch) {
			return;
		}
		if (!v) {
			return Player.$all(`.${ns}-list-item`).forEach(el => el.style.display = null);
		}
		Player.sounds.forEach(sound => {
			const row = Player.$(`.${ns}-list-item[data-id="${sound.id}"]`);
			row && (row.style.display = Player.playlist.matchesSearch(sound) ? null : 'none');
		});
	},

	matchesSearch: function (sound) {
		const v = Player.playlist._lastSearch;
		return !v
			|| sound.title.toLowerCase().includes(v)
			|| String(sound.post.toLowerCase()).includes(v)
			|| String(sound.src.toLowerCase()).includes(v);
	},

	toggleSearch: function (show) {
		const input = Player.$(`.${ns}-playlist-search`);
		!show && Player.playlist._lastSearch && Player.playlist.search();
		input.style.display = show ? null : 'none';
		show && input.focus();
	}
};
