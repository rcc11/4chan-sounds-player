{
	atRoot: [ 'add' ],

	delegatedEvents: {
		click: {
			[`.${ns}-viewStyle-button`]: 'playlist.toggleView',
			[`.${ns}-list`]: 'playlist.handleSelect'
		},
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

	handleSelect: function (e) {
		const id = e.target.getAttribute('data-id');
		const sound = id && Player.sounds.find(function (sound) {
			return sound.id === '' + id;
		});
		sound && Player.play(sound);
	}
}