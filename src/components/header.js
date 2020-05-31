const { parseFileName } = require('../file_parser');

module.exports = {
	options: {
		repeat: {
			all: { title: 'Repeat All', text: '[RA]', class: 'fa-repeat' },
			one: { title: 'Repeat One', text: '[R1]', class: 'fa-repeat fa-repeat-one' },
			none: { title: 'No Repeat', text: '[R0]', class: 'fa-repeat disabled' }
		},
		shuffle: {
			true: { title: 'Shuffled', text: '[S]', class: 'fa-random' },
			false: { title: 'Ordered', text: '[O]', class: 'fa-random disabled' },
		},
		viewStyle: {
			playlist: { title: 'Hide Playlist', text: '[+]', class: 'fa-compress' },
			image: { title: 'Show Playlist', text: '[-]', class: 'fa-expand' }
		},
		hoverImages: {
			true: { title: 'Hover Images Enabled', text: '[H]', class: 'fa-picture-o' },
			false: { title: 'Hover Images Disabled', text: '[-]', class: 'fa-picture-o disabled' },
		}
	},

	delegatedEvents: {
		click: {
			[`.${ns}-shuffle-button`]: 'header.toggleShuffle',
			[`.${ns}-repeat-button`]: 'header.toggleRepeat',
			[`.${ns}-reload-button`]: e => { e.preventDefault(); Player.playlist.refresh(); },
			[`.${ns}-add-button`]: e => { e.preventDefault(); Player.$(`.${ns}-file-input`).click(); }
		},
		change: {
			[`.${ns}-file-input`]: 'header.handleFileSelect'
		}
	},

	initialize: function () {
		Player.on('playsound', Player.header.render);
	},

	/**
	 * Render the player header.
	 */
	render: function () {
		if (!Player.container) {
			return;
		}
		Player.$(`.${ns}-title`).innerHTML = Player.templates.header();
	},

	/**
	 * Add local files.
	 */
	handleFileSelect: function (e) {
		e.preventDefault();
		const input = e.eventTarget;
		const files = input.files;
		// Check each of the files for sounds.
		[ ...files ].forEach(file => {
			const imageSrc = URL.createObjectURL(file);
			const type = file.type
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

			function _continue () {
				parseFileName(file.name, imageSrc, null, thumbSrc).forEach(sound => Player.add({ ...sound, local: true, type }));
			}
		});
	},

	/**
	 * Toggle the repeat style.
	 */
	toggleRepeat: function (e) {
		try {
			e.preventDefault();
			const options = Object.keys(Player.header.options.repeat);
			const current = options.indexOf(Player.config.repeat);
			Player.config.repeat = options[(current + 4) % 3];
			Player.header.render();
			Player.settings.save();
		} catch (err) {
			_logError('There was an error changing the repeat setting. Please check the console for details.', 'warning');
			console.error('[4chan sounds player]', err);
		}
	},

	/**
	 * Toggle the shuffle style.
	 */
	toggleShuffle: function (e) {
		try {
			e.preventDefault();
			Player.config.shuffle = !Player.config.shuffle;
			Player.header.render();

			// Update the play order.
			if (!Player.config.shuffle) {
				Player.sounds.sort((a, b) => Player.compareIds(a.id, b.id));
			} else {
				const sounds = Player.sounds;
				for (let i = sounds.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[sounds[i], sounds[j]] = [sounds[j], sounds[i]];
				}
			}
			Player.playlist.render();
			Player.settings.save();
			Player.trigger('order');
		} catch (err) {
			_logError('There was an error changing the shuffle setting. Please check the console for details.', 'warning');
			console.error('[4chan sounds player]', err);
		}
	}
}
