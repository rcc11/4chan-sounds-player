const { postIdPrefix } = require('../../selectors');
const xhrReplacer = require('../../xhr-replace');

const itemMenuTemplate = require('./templates/item_menu.tpl');

module.exports = {
	atRoot: [ 'add', 'remove' ],
	public: [ 'search' ],

	tagLoadTO: {},

	template: require('./templates/player.tpl'),
	listTemplate: require('./templates/list.tpl'),
	tagsDialogTemplate: require('./templates/tags_dialog.tpl'),

	initialize() {
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

		// Keey track of the hover image element.
		Player.on('rendered', Player.playlist.afterRender);

		// Various things to do when a new sound plays.
		Player.on('playsound', sound => {
			// Update the image/video.
			Player.playlist.showImage(sound);
			// Update the previously and the new playing rows.
			Player.$all(`.${ns}-list-item.playing, .${ns}-list-item[data-id="${Player.playing.id}"]`).forEach(el => {
				const newItem = Player.playlist.listTemplate({ sounds: [ Player.sounds.find(s => s.id === el.dataset.id) ] });
				_.element(newItem, el, 'beforebegin');
				el.parentNode.removeChild(el);
			});
			// If the player isn't fullscreen scroll to the playing item.
			Player.config.viewStyle !== 'fullscreen' && Player.playlist.scrollToPlaying('nearest');
			// Scroll the thread to the playing post.
			Player.config.autoScrollThread && sound.post && (location.href = location.href.split('#')[0] + '#' + postIdPrefix + sound.post);
			// Load tags from the audio file.
			Player.playlist.loadTags(Player.playing.id);
		});

		// Reset to the placeholder image when the player is stopped.
		Player.on('stop', () => {
			Player.$all(`.${ns}-list-item.playing`).forEach(el => el.classList.remove('playing'));
			const container = Player.$(`.${ns}-image-link`);
			container.href = '#';
			Player.$(`.${ns}-background-image`).src = Player.video.src = '';
			Player.$(`.${ns}-image`).src = `data:image/svg+xml;base64,${btoa(Icons.fcSounds)}`;
			container.classList.remove(`${ns}-show-video`);
		});

		// Reapply filters when they change
		Player.on('config:filters', Player.playlist.applyFilters);
		Player.on('config:allow', Player.playlist.applyFilters);

		// Listen to anything that can affect the display of hover images
		Player.on('config:hoverImages', Player.playlist.setHoverImageVisibility);
		Player.on('menu-open', Player.playlist.setHoverImageVisibility);
		Player.on('menu-close', Player.playlist.setHoverImageVisibility);

		// Listen to the search display being toggled
		Player.on('config:showPlaylistSearch', Player.playlist.toggleSearch);

		// Listen for the playlist being shuffled/ordered.
		Player.on('config:shuffle', Player.playlist._handleShuffle);

		// Update an open tags info dialog when tags are loaded for a sound.
		Player.on('tags-loaded', sound => {
			const dialog = Player.$(`.tags-dialog[data-sound-id="${sound.id}"]`);
			dialog && _.elementHTML(dialog, Player.playlist.tagsDialogTemplate(sound));
		});

		// Resize the image when the config is changed (from other tabs)
		Player.on('config:imageHeight', height => Player.$(`.${ns}-image-link`).style.height = height + 'px');

		// Preload the next audio.
		Player.on([ 'playsound', 'order' ], () => {
			const next = Player.sounds[(Player.sounds.indexOf(Player.playing) + 1) % Player.sounds.length];
			next && Player.playlist.preload(next);
		});

		// Maintain changes to the user templates it's dependent values
		Player.userTemplate.maintain(Player.playlist, 'rowTemplate', [ 'shuffle' ]);

		// Resize observer to handle transparent images
		Player.playlist.imageResizeObserver = new ResizeObserver(Player.playlist.resizeTransBG);
	},

	/**
	 * Render the playlist.
	 */
	render() {
		_.elementHTML(Player.$(`.${ns}-list-container`), Player.playlist.listTemplate({ search: true }));
		Player.playlist.afterRender();
	},

	afterRender() {
		Player.playlist.image = Player.$(`.${ns}-image`);
		Player.playlist.transparentImageBG = Player.$(`.${ns}-image-transparent-bg`);
		Player.playlist.hoverImage = Player.$(`.${ns}-hover-image`);
		Player.playlist.imageResizeObserver.disconnect();
		Player.playlist.imageResizeObserver.observe(Player.playlist.image);
		Player.playlist.image.onload = Player.playlist.resizeTransBG;
	},

	/**
	 * Restore the last playlist or image view.
	 */
	restore() {
		Player.display.setViewStyle(Player.playlist._lastView || 'playlist');
	},

	/**
	 * Update the image displayed in the player.
	 */
	showImage(sound) {
		const container = document.querySelector(`.${ns}-image-link`);
		const img = container.querySelector(`.${ns}-image`);
		const background = container.querySelector(`.${ns}-background-image`);
		img.src = background.src = '';
		img.src = background.src = sound.imageOrThumb;
		Player.isVideo && (Player.video.src = sound.image);
		if (Player.config.viewStyle !== 'fullscreen') {
			container.href = sound.image;
		}
		container.classList[Player.isVideo ? 'add' : 'remove'](ns + '-show-video');
	},

	/**
	 * Resize the background element that prevents transparent images display over themself.
	 */
	resizeTransBG() {
		const contentBoxRatio = Player.playlist.image.width / Player.playlist.image.height;
		const imageSizeRatio = Player.playlist.image.naturalWidth / Player.playlist.image.naturalHeight;
		const bgEl = Player.playlist.transparentImageBG;
		bgEl.style.width = Math.min(imageSizeRatio / contentBoxRatio * 100, 100) + '%';
		bgEl.style.height = Math.min(contentBoxRatio / imageSizeRatio * 100, 100) + '%';
	},

	/**
	 * Switch between playlist and image view.
	 */
	toggleView(e) {
		e && e.preventDefault();
		let style = Player.config.viewStyle === 'playlist' ? 'image'
			: Player.config.viewStyle === 'image' ? 'playlist'
			: Player.playlist._lastView;
		Player.display.setViewStyle(style);
	},

	/**
	 * Add a new sound from the thread to the player.
	 */
	add(sound, skipRender) {
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
					let rowContainer = _.element(`<div>${Player.playlist.listTemplate({ sounds: [ sound ] })}</div>`);
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

	addFromDrop(e) {
		for (let item of e.dataTransfer.items) {
			const entry = item.getAsEntry ? item.getAsEntry() : item.webkitGetAsEntry();
			entry && Player.playlist._scanEntry(entry);
		}
	},

	_scanEntry(entry) {
		if (entry.isDirectory) {
			return Player.playlist._readEntries(entry.createReader());
		}
		return entry.file(file => Player.playlist.addFromFiles([ file ]));
	},

	_readEntries(reader) {
		reader.readEntries(entries => {
			if (entries.length) {
				entries.forEach(Player.playlist._scanEntry);
				Player.playlist._readEntries(reader);
			}
		});
	},

	addFromFiles(files) {
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
			video.addEventListener('seeked', function () {
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
				thumbSrc = canvas.toDataURL();
				_continue();
			});
			video.src = imageSrc;
			video.currentTime = 0.001;

			function _continue() {
				const { sounds } = Player.posts.getSounds(file.name, imageSrc, null, thumbSrc, null, true);
				sounds.forEach(sound => Player.add({ ...sound, local: true, type }));
			}
		});
	},

	selectLocalFiles() {
		Player.$(`.${ns}-add-local-file-input`).click();
	},

	/**
	 * Remove a sound
	 */
	remove(sound) {
		// Accept the sound object or id
		if (typeof sound !== 'object') {
			sound = Player.sounds.find(s => s.id === '' + sound);
		}
		const index = Player.sounds.indexOf(sound);

		// If the playing sound is being removed then play the next sound.
		if (Player.playing === sound) {
			Player.next({ force: true, paused: Player.audio.paused });
		}
		// Remove the sound from the the list and play order.
		index > -1 && Player.sounds.splice(index, 1);

		// Remove the item from the list.
		const item = sound && Player.$(`.${ns}-list-item[data-id="${sound.id}"]`);
		item && Player.$(`.${ns}-list-container`).removeChild(item);
		sound && Player.trigger('remove', sound);
	},

	toggleRepeat() {
		const values = [ 'all', 'one', 'none' ];
		const current = values.indexOf(Player.config.repeat);
		Player.set('repeat', values[(current + 4) % 3]);
	},

	toggleShuffle() {
		Player.set('shuffle', !Player.config.shuffle);
	},

	_handleShuffle() {
		// Update the play order.
		if (!Player.config.shuffle) {
			Player.sounds.sort((a, b) => Player.compareIds(a.id, b.id));
		} else {
			const sounds = Player.sounds;
			for (let i = sounds.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[ sounds[i], sounds[j] ] = [ sounds[j], sounds[i] ];
			}
		}
		Player.trigger('order');
	},

	/**
	 * Handle an playlist item being clicked. Either open/close the menu or play the sound.
	 */
	handleSelect(e) {
		// Ignore if a link was clicked.
		if (e.target.nodeName === 'A' || e.target.closest('a')) {
			return;
		}
		const id = e.currentTarget.getAttribute('data-id');
		const sound = id && Player.sounds.find(sound => sound.id === id);
		sound && Player.play(sound);
	},

	/**
	 * Display an item menu.
	 */
	handleItemMenu(e, id) {
		const sound = Player.sounds.find(s => s.id === id);

		// Add row item menus to the list container. Append to the container otherwise.
		const listContainer = e.currentTarget.closest(`.${ns}-list-container`);
		const parent = listContainer || Player.container;

		// Create the menu.
		const html = itemMenuTemplate({ sound, postIdPrefix });
		const dialog = _.element(html, parent);
		const relative = e.currentTarget.classList.contains(`${ns}-item-menu-button`) ? e.currentTarget : e;
		Player.display.showMenu(relative, dialog, parent);
	},

	/**
	 * Toggle the hoverImages setting
	 */
	toggleHoverImages(e) {
		e && e.preventDefault();
		Player.set('hoverImages', !Player.config.hoverImages);
	},

	/**
	 * Only show the hover image with the setting enabled, no item menu open, and nothing being dragged.
	 */
	setHoverImageVisibility() {
		const container = Player.$(`.${ns}-player`);
		const hideImage = !Player.config.hoverImages
			|| Player.playlist._dragging
			|| container.querySelector(`.${ns}-menu`);
		container.classList[hideImage ? 'add' : 'remove'](`${ns}-hide-hover-image`);
	},

	/**
	 * Set the displayed hover image and reposition.
	 */
	updateHoverImage(e) {
		const id = e.currentTarget.getAttribute('data-id');
		const sound = Player.sounds.find(sound => sound.id === id);
		Player.playlist.hoverImage.style.display = 'block';
		Player.playlist.hoverImage.setAttribute('src', sound.thumb);
		Player.playlist.positionHoverImage(e);
	},

	/**
	 * Reposition the hover image to follow the cursor.
	 */
	positionHoverImage(e) {
		const { width, height } = Player.playlist.hoverImage.getBoundingClientRect();
		const maxX = document.documentElement.clientWidth - width - 5;
		Player.playlist.hoverImage.style.left = (Math.min(e.clientX, maxX) + 5) + 'px';
		Player.playlist.hoverImage.style.top = (e.clientY - height - 10) + 'px';
	},

	/**
	 * Hide the hover image when nothing is being hovered over.
	 */
	removeHoverImage() {
		Player.playlist.hoverImage.style.display = 'none';
	},

	/**
	 * Start dragging a playlist item.
	 */
	handleDragStart(e) {
		Player.playlist._dragging = e.currentTarget;
		Player.playlist.setHoverImageVisibility();
		e.currentTarget.classList.add(`${ns}-dragging`);
		const img = document.createElement('img');
		img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
		e.dataTransfer.setDragImage(img, 0, 0);
		e.dataTransfer.dropEffect = 'move';
		e.dataTransfer.setData('text/plain', e.currentTarget.getAttribute('data-id'));
	},

	/**
	 * Swap a playlist item when it's dragged over another item.
	 */
	handleDragEnter(e) {
		if (!Player.playlist._dragging) {
			return;
		}
		const moving = Player.playlist._dragging;
		const id = moving.getAttribute('data-id');
		let before = e.target.closest && e.target.closest(`.${ns}-list-item`);
		if (!before || moving === before) {
			return;
		}
		const movingIdx = Player.sounds.findIndex(s => s.id === id);
		const list = moving.parentNode;

		// If the item is being moved down it needs inserting before the node after the one it's dropped on.
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
	handleDragEnd(e) {
		if (!Player.playlist._dragging) {
			return;
		}
		delete Player.playlist._dragging;
		e.currentTarget.classList.remove(`${ns}-dragging`);
		Player.playlist.setHoverImageVisibility();
	},

	/**
	 * Scroll to the playing item, unless there is an open menu in the playlist.
	 */
	scrollToPlaying(type = 'center') {
		if (Player.$(`.${ns}-list-container .${ns}-menu`)) {
			return;
		}
		const playing = Player.$(`.${ns}-list-item.playing`);
		playing && playing.scrollIntoView({ block: type });
	},

	/**
	 * Remove any user filtered items from the playlist.
	 */
	applyFilters() {
		// Check for added sounds that are now filtered.
		Player.sounds.forEach(sound => {
			sound.disallow = Player.disallowedSound(sound);
			if (sound.disallow) {
				Player.playlist.remove(sound);
				Player.filteredSounds.push(sound);
				Player.posts.updateButtons(sound.post);
			}
		});
		// Check for filtered sounds that are now accepted.
		Player.filteredSounds.forEach((sound, idx) => {
			sound.disallow = Player.disallowedSound(sound);
			if (!sound.disallow) {
				Player.filteredSounds.splice(idx, 1);
				Player.playlist.add(sound);
				Player.posts.updateButtons(sound.post);
			}
		});
		Player.trigger('filters-applied');
	},

	// Add a filter.
	addFilter(filter) {
		filter && Player.set('filters', Player.config.filters.concat(filter));
	},

	/**
	 * Search the playlist
	 */
	_handleSearch(e) {
		Player.playlist.search(e.currentTarget.value.toLowerCase());
	},

	search(v) {
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

	matchesSearch(sound) {
		const v = Player.playlist._lastSearch;
		return !v
			|| sound.title.toLowerCase().includes(v)
			|| sound.post && String(sound.post.toLowerCase()).includes(v)
			|| String(sound.src.toLowerCase()).includes(v);
	},

	toggleSearch(show) {
		const input = Player.$(`.${ns}-playlist-search`);
		!show && Player.playlist._lastSearch && Player.playlist.search();
		input.style.display = show ? null : 'none';
		show && input.focus();
	},

	/**
	 * Attempt to load info tags from a sound source.
	 * @param {String} id The sound id
	 */
	loadTags(id) {
		const sound = Player.sounds.find(s => s.id === id);
		// Fall out if they've already been loaded.
		if (sound.tags) {
			return;
		}
		// Wait a bit before fetching to ignore the mouse going across.
		Player.playlist.tagLoadTO[id] = setTimeout(() => {
			const reader = new jsmediatags.Reader(sound.src);
			// Replace XMLHttpRequest to avoid cors.
			reader._findFileReader().prototype._createXHRObject = () => new xhrReplacer.GM();
			// Load and read the tags.
			reader.read({
				onSuccess: handleTags,
				onError: handleTags
			});
		}, 150);

		function handleTags(data) {
			// Store all the string tags that jsmediatags has set.
			sound.tags = data && Object.entries(data.tags || {}).reduce((tags, [ name, value ]) => {
				typeof value === 'string' && (tags[name] = value);
				return tags;
			}, {});
			Player.trigger('tags-loaded', sound);
		}
	},

	/**
	 * Cancel a pending of tags for a sond.
	 * @param {String} id The sound id
	 */
	abortTags(id) {
		clearTimeout(Player.playlist.tagLoadTO[id]);
		delete Player.playlist.tagLoadTO[id];
	},

	/**
	 * Set a few initial values to being resizing the playlist image.
	 */
	expandImageStart(e) {
		if (e.button === 0 && !Player.isHidden && Player.config.viewStyle === 'playlist') {
			Player.$(`.${ns}-image-link`).style.cursor = 'ns-resize';
			Player._imageResizeStartY = (e.touches && e.touches[0] || e).clientY;
			Player._imageResizeStartHeight = Player.config.imageHeight;
			Player._imageResized = false;
			Player._imageReizeMaxHeight = Player.$(`.${ns}-player`).getBoundingClientRect().height - Player.$(`.${ns}-controls`).getBoundingClientRect().height;
		}
	},

	/**
	 * Resize the playlist image.
	 */
	expandImage(e) {
		if (!Player.isHidden && Player.config.viewStyle === 'playlist') {
			Player._imageResized = true;
			const clientY = (e.touches && e.touches[0] || e).clientY;
			const height = (Player._imageResizeStartHeight + clientY - Player._imageResizeStartY);
			Player.$(`.${ns}-image-link`).style.height = Math.min(Math.max(125, height), Player._imageReizeMaxHeight) + 'px';
		}
	},

	/**
	 * Keep the image within the player.
	 */
	setImageHeight() {
		if (!Player.isHidden && Player.config.viewStyle === 'playlist') {
			Player.$(`.${ns}-image-link`).style.cursor = null;
			const imageLink = Player.$(`.${ns}-image-link`);
			const height = parseInt(imageLink.style.height);
			const maxHeight = Player.$(`.${ns}-player`).getBoundingClientRect().height - Player.$(`.${ns}-controls`).getBoundingClientRect().height;
			const finalHeight = Math.max(125, Math.min(height, maxHeight));
			imageLink.style.height = finalHeight + 'px';
			Player.set('imageHeight', finalHeight);
		}
	},

	/**
	 * If a click on the image link was after resizing then don't open the image.
	 */
	expandImageClick(e) {
		!Player.isHidden && Player.config.viewStyle === 'playlist' && Player._imageResized && e.preventDefault();
	},

	/**
	 * Preload a sound.
	 */
	async preload(sound) {
		if (sound.preloading) {
			return;
		}
		sound.preloading = true;
		const video = sound.image.endsWith('.webm') || sound.type === 'video/webm';
		await Promise.all([
			!sound.standaloneVideo && new Promise(resolve => {
				const audio = new Audio();
				audio.addEventListener('canplaythrough', resolve);
				audio.addEventListener('error', resolve);
				audio.src = sound.src;
			}),
			video && new Promise(resolve => {
				const video = document.createElement('video');
				video.addEventListener('canplaythrough', resolve);
				video.addEventListener('error', resolve);
				video.src = sound.image;
			})
		]);
		sound.preloading = false;
	}
};
