module.exports = {
	atRoot: [ 'show', 'hide' ],

	delegatedEvents: {
		click: {
			[`.${ns}-close-button`]: 'hide'
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
		const showIcon = document.createElement('span');
		shortcuts.insertBefore(showIcon, document.getElementById('shortcut-settings'));

		const attrs = { id: 'shortcut-sounds', class: 'shortcut brackets-wrap', 'data-index': 0 };
		for (let attr in attrs) {
			showIcon.setAttribute(attr, attrs[attr]);
		}
		showIcon.innerHTML = '<a href="javascript:;" title="Sounds" class="fa fa-play-circle">Sounds</a>';
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

			// Insert the stylesheet.
			Player.stylesheet = document.createElement('style');
			Player.stylesheet.innerHTML = Player.templates.css();
			document.head.appendChild(Player.stylesheet);

			// Create the main player.
			const el = document.createElement('div');
			el.innerHTML = Player.templates.body();
			Player.container = el.querySelector(`#${ns}-container`);
			document.body.appendChild(Player.container);

			Player.trigger('rendered');

			// Keep track of heavily updated elements.
			Player.ui.currentTime = Player.$(`.${ns}-current-time`);
			Player.ui.duration = Player.$(`.${ns}-duration`);
			Player.ui.currentTimeBar = Player.$(`.${ns}-seek-bar .${ns}-current-bar`);
			Player.ui.loadedBar = Player.$(`.${ns}-seek-bar .${ns}-loaded-bar`);

			// Add stylesheets to adjust the progress indicator of the seekbar and volume bar.
			document.head.appendChild(Player._progressBarStyleSheets[`.${ns}-seek-bar`] = document.createElement('style'));
			document.head.appendChild(Player._progressBarStyleSheets[`.${ns}-volume-bar`] = document.createElement('style'));
			Player.controls.updateDuration();
			Player.controls.updateVolume();
		} catch (err) {
			_logError('There was an error rendering the sound player. Please check the console for details.');
			console.error('[4chan sounds player]', err);
			// Can't recover, throw.
			throw err;
		}
	},

	/**
	 * Change what view is being shown
	 */
	setViewStyle: function (style) {
		// Get the size prior to switching.
		const { width, height } = Player.container.getBoundingClientRect();

		// Change the style.
		Player.config.viewStyle = style;
		Player.container.setAttribute('data-view-style', style);

		// Try to reapply the pre change sizing.
		Player.position.resize(parseInt(width, 10), parseInt(height, 10));
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
			Player._hiddenWhilePolling = !!Player._loadingPoll;
			Player.controls.stopPollingForLoading();
			Player.container.style.display = 'none';

			Player.isHidden = true;
			Player.trigger('hide');

			if (Player.config.pauseOnHide) {
				Player.pause();
			}
		} catch (err) {
			_logError('There was an error hiding the sound player. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	},

	/**
	 * Show the player. Reapplies the saved position/size, and resumes loadeing polling if it was paused.
	 * @param {*} e 
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
			Player._hiddenWhilePolling && Player.controls.pollForLoading();
			Player.container.style.display = null;

			Player.isHidden = false;
			Player.trigger('show');

			// Apply the last position/size
			const [ top, left ] = (await GM.getValue(ns + '.position') || '').split(':');
			const [ width, height ] = (await GM.getValue(ns + '.size') || '').split(':');
			+top && +left && Player.position.move(top, left, true);
			+width && +height && Player.position.resize(width, height);

			Player.container.focus();
		} catch (err) {
			_logError('There was an error showing the sound player. Please check the console for details.');
			console.error('[4chan sounds player]', err);
		}
	}
}
