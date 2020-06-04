module.exports = {
	atRoot: [ 'show', 'hide' ],

	delegatedEvents: {
		click: {
			[`.${ns}-close-button`]: 'hide'
		},
		fullscreenchange: {
			[`.${ns}-media`]: 'display._handleFullScreenChange'
		},
		drop: {
			[`#${ns}-container`]: 'display._handleDrop'
		}
	},

	/**
	 * Create the player show/hide button in to the 4chan X header.
	 */
	initChanX: function () {
		if (Player.display._initedChanX) {
			return;
		}
		const shortcuts = document.getElementById('shortcuts');
		if (!shortcuts) {
			return;
		}
		Player.display._initedChanX = true;
		const showIcon = createElement(`<span id="shortcut-sounds" class="shortcut brackets-wrap" data-index="0">
			<a href="javascript:;" title="Sounds" class="fa fa-play-circle">Sounds</a>
		</span>`);
		shortcuts.insertBefore(showIcon, document.getElementById('shortcut-settings'));
		showIcon.querySelector('a').addEventListener('click', Player.display.toggle);
	},

	/**
	 * Render the player.
	 */
	render: async function () {
		try {
			if (Player.container) {
				document.body.removeChild(Player.container);
				document.head.removeChild(Player.stylesheet);
			}

			// Create the main stylesheet.
			Player.display.updateStylesheet();

			// Create the main player.
			const isThread = document.body.classList.contains('is_thread');
			const parent = isThread ? document.body.querySelector('.thread') : document.body;
			Player.container = createElement(Player.templates.body(), parent);

			Player.trigger('rendered');
		} catch (err) {
			_logError('There was an error rendering the sound player. Please check the console for details.');
			console.error('[4chan sounds player]', err);
			// Can't recover, throw.
			throw err;
		}
	},

	updateStylesheet: function () {
		// Insert the stylesheet if it doesn't exist.
		Player.stylesheet = Player.stylesheet || createElement('<style></style>', document.head);
		Player.stylesheet.innerHTML = Player.templates.css();
	},

	/**
	 * Change what view is being shown
	 */
	setViewStyle: function (style) {
		// Get the size and style prior to switching.
		const previousStyle = Player.config.viewStyle;
		const { width, height } = Player.container.getBoundingClientRect();

		// Exit fullscreen before changing to a different view.
		if (style !== 'fullscreen') {
			document.fullscreenElement && document.exitFullscreen();
		}

		// Change the style.
		Player.set('viewStyle', style);
		Player.container.setAttribute('data-view-style', style);

		// Try to reapply the pre change sizing unless it was fullscreen.
		if (previousStyle !== 'fullscreen' || style === 'fullscreen') {
			Player.position.resize(parseInt(width, 10), parseInt(height, 10));
		}
		Player.trigger('view', style, previousStyle);
	},

	/**
	 * Togle the display status of the player.
	 */
	toggle: function (e) {
		e && e.preventDefault();
		if (Player.container.style.display === 'none') {
			Player.show();
		} else {
			Player.hide();
		}
	},

	/**
	 * Hide the player. Stops polling for changes, and pauses the aduio if set to.
	 */
	hide: function (e) {
		if (!Player.container) {
			return;
		}
		try {
			e && e.preventDefault();
			Player.container.style.display = 'none';

			Player.isHidden = true;
			Player.trigger('hide');
		} catch (err) {
			_logError('There was an error hiding the sound player. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},

	/**
	 * Show the player. Reapplies the saved position/size, and resumes loaded amount polling if it was paused.
	 */
	show: async function (e) {
		if (!Player.container) {
			return;
		}
		try {
			e && e.preventDefault();
			if (!Player.container.style.display) {
				return;
			}
			Player.container.style.display = null;

			Player.isHidden = false;
			Player.trigger('show');
		} catch (err) {
			_logError('There was an error showing the sound player. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},

	/**
	 * Toggle the video/image and controls fullscreen state
	 */
	toggleFullScreen: function () {
		if (!document.fullscreenElement) {
			Player.$(`.${ns}-media`).requestFullscreen();
		} else if (document.exitFullscreen) {
			document.exitFullscreen();
		}
	},

	/**
	 * Handle file/s being dropped on the player.
	 */
	_handleDrop: function (e) {
		e.preventDefault();
		e.stopPropagation();
		Player.playlist.addFromFiles(e.dataTransfer.files);
	},

	/**
	 * Handle the fullscreen state being changed
	 */
	_handleFullScreenChange: function () {
		if (document.fullscreenElement) {
			Player.display.setViewStyle('fullscreen');
			Player.$(`.${ns}-image-link`).removeAttribute('href');
		} else {
			if (Player.playing) {
				Player.$(`.${ns}-image-link`).href = Player.playing.image;
			}
			Player.playlist.restore();
		}
	}
};
