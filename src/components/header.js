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
			[`.${ns}-reload-button`]: e => { e.preventDefault(); Player.playlist.refresh() }
		}
	},

	initialize: function () {
		Player.on('playsoud', Player.header.render)
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
				Player.playOrder = [ ...Player.sounds ];
			} else {
				const playOrder = Player.playOrder;
				for (let i = playOrder.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[playOrder[i], playOrder[j]] = [playOrder[j], playOrder[i]];
				}
			}
			Player.settings.save();
		} catch (err) {
			_logError('There was an error changing the shuffle setting. Please check the console for details.', 'warning');
			console.error('[4chan sounds player]', err);
		}
	}
}
