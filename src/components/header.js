{
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
		}
	},

	delegatedEvents: {
		click: {
			[`.${ns}-shuffle-button`]: 'header.toggleShuffle',
			[`.${ns}-repeat-button`]: 'header.toggleRepeat',
		}
	},

	/**
	 * Render the player header.
	 */
	render: function () {
		if (!Player.container) {
			return;
		}
		Player.$(`.${ns}-title`).innerHTML = Player.templates.header(Player.display._tplOptions());
	},

	/**
	 * Toggle the repeat style.
	 */
	toggleRepeat: function (e) {
		try {
			e.preventDefault();
			const options = Object.keys(Player.header.options.repeat);
			const current = options.indexOf(Player.settings.repeat);
			Player.settings.repeat = options[(current + 4) % 3];
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
			Player.settings.shuffle = !Player.settings.shuffle;
			Player.header.render();

			// Update the play order.
			if (!Player.settings.shuffle) {
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