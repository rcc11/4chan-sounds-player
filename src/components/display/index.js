const cssTemplate = require('../../scss/style.scss');
const css4chanXPolyfillTemplate = require('../../scss/4chan-x-polyfill.scss');

const menus = {
	themes: require('./templates/themes_menu.tpl'),
	views: require('./templates/views_menu.tpl')
};

const dismissedContentCache = {};
const dismissedRestoreCache = {};

const noSleep = typeof NoSleep === 'function' && new NoSleep();
const enableNoSleep = () => noSleep.enable();
const disableNoSleep = () => noSleep.disable();

module.exports = {
	atRoot: [ 'show', 'hide' ],
	public: [ 'show', 'hide' ],
	template: require('./templates/body.tpl'),
	_noSleepEnabled: false,

	initialize: async function () {
		try {
			Player.display.dismissed = (await GM.getValue('dismissed')).split(',');
		} catch (err) {
			Player.display.dismissed = [];
		}
		// Reset marquees when a new sound is played.
		Player.on('playsound', () => {
			Player.display._marquees = {};
			!Player.display._marqueeTO && Player.display.runTitleMarquee();
		});
		// Store the rem size
		Player.remSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
		// Set up no sleep
		Player.on('config:preventSleep', Player.display._initNoSleep);
		Player.display._initNoSleep(Player.config.preventSleep);
		// Close dialogs when the user clicks anywhere or presses escape.
		document.body.addEventListener('click', Player.display.closeDialogs);
		document.body.addEventListener('keydown', e => e.key === 'Escape' && Player.display.closeDialogs(e));
	},

	/**
	 * Create the player show/hide button in to the 4chan X header.
	 */
	createPlayerButton: function () {
		if (Site === 'FoolFuuka') {
			// Add a sounds link in the nav for archives
			const nav = document.querySelector('.navbar-inner .nav:nth-child(2)');
			const li = _.element('<li><a href="javascript:;">Sounds</a></li>', nav);
			li.children[0].addEventListener('click', Player.display.toggle);
		} else if (Site === 'Fuuka') {
			const br = document.querySelector('body > div > br');
			br.parentNode.insertBefore(document.createTextNode('['), br);
			_.element('<a href="#" @click="display.toggle:prevent">Sounds</a>', br, 'beforebegin');
			br.parentNode.insertBefore(document.createTextNode(']'), br);
		} else if (isChanX) {
			// Add a button in the header for 4chan X.
			_.element(`<span id="shortcut-sounds" class="shortcut brackets-wrap" data-index="0">
				<a href="#" @click="display.toggle:prevent" title="Sounds" class="fa fa-play-circle">Sounds</a>
			</span>`, document.getElementById('shortcut-settings'), 'beforebegin');
		} else {
			// Add a [Sounds] link in the top and bottom nav for native 4chan.
			document.querySelectorAll('#settingsWindowLink, #settingsWindowLinkBot').forEach(function (link) {
				_.element('<a href="#" @click="display.toggle:prevent">Sounds</a>', link, 'beforebegin');
				link.parentNode.insertBefore(document.createTextNode('] ['), link);
			});
		}
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

			// Create the main player. For native threads put it in the threads to get free quote previews.
			const parent = Thread && !isChanX && document.body.querySelector('.board') || document.body;
			Player.container = _.element(Player.display.template(), parent);

			await Player.trigger('rendered');
		} catch (err) {
			Player.logError('There was an error rendering the sound player.', err);
			// Can't recover, throw.
			throw err;
		}
	},

	updateStylesheet: function () {
		// Insert the stylesheet if it doesn't exist. 4chan X polyfill, sound player styling, and user styling.
		Player.stylesheet = Player.stylesheet || _.element('<style id="sound-player-css"></style>', document.head);
		Player.stylesheet.innerHTML = (!isChanX ? '/* 4chanX Polyfill */\n\n' + css4chanXPolyfillTemplate() : '')
			+ '\n\n/* Sounds Player CSS */\n\n' + cssTemplate();
	},

	/**
	 * Change what view is being shown
	 */
	setViewStyle: async function (style) {
		// Get the size and style prior to switching.
		const previousStyle = Player.config.viewStyle;

		// Exit fullscreen before changing to a different view.
		if (style !== 'fullscreen') {
			document.fullscreenElement && document.exitFullscreen();
		}

		// Change the style.
		Player.set('viewStyle', style);
		Player.container.setAttribute('data-view-style', style);

		if (style === 'playlist' || style === 'image') {
			Player.controls.preventWrapping();
		}
		// Try to reapply the pre change sizing unless it was fullscreen.
		if (previousStyle !== 'fullscreen' || style === 'fullscreen') {
			const [ width, height ] = (await GM.getValue('size') || '').split(':');
			width && height && Player.position.resize(parseInt(width, 10), parseInt(height, 10));
			Player.position.setPostWidths();
		}

		Player.trigger('view', style, previousStyle);
	},

	/**
	 * Togle the display status of the player.
	 */
	toggle: function () {
		if (Player.container.style.display === 'none') {
			Player.show();
		} else {
			Player.hide();
		}
	},

	/**
	 * Hide the player. Stops polling for changes, and pauses the aduio if set to.
	 */
	hide: function () {
		Player.container.style.display = 'none';

		Player.isHidden = true;
		Player.trigger('hide');
	},

	/**
	 * Show the player. Reapplies the saved position/size, and resumes loaded amount polling if it was paused.
	 */
	show: async function () {
		if (!Player.container.style.display) {
			return;
		}
		Player.container.style.display = null;

		Player.isHidden = false;
		await Player.trigger('show');
	},

	/**
	 * Stop playback and close the player.
	 */
	close: async function () {
		Player.stop();
		Player.hide();
	},

	/**
	 * Toggle the video/image and controls fullscreen state
	 */
	toggleFullScreen: async function () {
		if (!document.fullscreenElement) {
			// Make sure the player (and fullscreen contents) are visible first.
			if (Player.isHidden) {
				Player.show();
			}
			Player.$(`.${ns}-player`).requestFullscreen();
			document.body.addEventListener('pointermove', Player.display._fullscreenMouseMove);
			Player.display._fullscreenMouseMove();
		} else if (document.exitFullscreen) {
			document.exitFullscreen();
			document.body.removeEventListener('pointermove', Player.display._fullscreenMouseMove);
		}
	},

	_fullscreenMouseMove: function () {
		Player.container.classList.remove('cursor-inactive');
		Player.display.fullscreenCursorTO && clearTimeout(Player.display.fullscreenCursorTO);
		Player.display.fullscreenCursorTO = setTimeout(function () {
			Player.container.classList.add('cursor-inactive');
		}, 2000);
	},

	/**
	 * Handle the fullscreen state being changed
	 */
	_handleFullScreenChange: function () {
		if (document.fullscreenElement) {
			Player.display.setViewStyle('fullscreen');
			document.querySelector(`.${ns}-image-link`).removeAttribute('href');
		} else {
			if (Player.playing) {
				document.querySelector(`.${ns}-image-link`).href = Player.playing.image;
			}
			Player.playlist.restore();
		}
		Player.controls.preventWrapping();
	},

	restore: async function (restore) {
		const restoreIndex = Player.display.dismissed.indexOf(restore);
		if (restore && restoreIndex > -1) {
			Player.display.dismissed.splice(restoreIndex, 1);
			Player.$all(`[\\@click^='display.restore("${restore}")']`).forEach(el => {
				_.element(dismissedContentCache[restore], el, 'beforebegin');
				el.parentNode.removeChild(el);
			});
			await GM.setValue('dismissed', Player.display.dismissed.join(','));
		}
	},

	dismiss: async function (dismiss) {
		if (dismiss && !Player.display.dismissed.includes(dismiss)) {
			Player.display.dismissed.push(dismiss);
			Player.$all(`[data-dismiss-id="${dismiss}"]`).forEach(el => {
				_.element(`<a href="#" @click='display.restore("${dismiss}"):prevent'>${dismissedRestoreCache[dismiss]}</a>`, el, 'beforebegin');
				el.parentNode.removeChild(el);
			});
			await GM.setValue('dismissed', Player.display.dismissed.join(','));
		}
	},

	ifNotDismissed: function (name, restore, text) {
		dismissedContentCache[name] = text;
		dismissedRestoreCache[name] = restore;
		return Player.display.dismissed.includes(name)
			? `<a href="#" @click='display.restore("${name}"):prevent'>${restore}</a>`
			: text;
	},

	/**
	 * Display a menu
	 */
	showMenu: function (relative, menu, parent) {
		const dialog = typeof menu === 'string' ? _.element(menus[menu]()) : menu;
		Player.display.closeDialogs();
		parent || (parent = Player.container);
		parent.appendChild(dialog);

		// Position the menu.
		Player.position.showRelativeTo(dialog, relative);

		// Add the focused class handler
		dialog.querySelectorAll('.entry').forEach(el => {
			el.addEventListener('mouseenter', e => {
				Player.display._setFocusedMenuItem(e);
				el.dispatchEvent(new CustomEvent('entry-focus'));
			});
		});
		// Allow clicks of sub menus
		dialog._keepOpenFor = Array.from(dialog.querySelectorAll('.entry.has-submenu'));
		dialog._closeFor = Array.from(dialog.querySelectorAll('.submenu'));

		Player.trigger('menu-open', dialog);
	},

	_setFocusedMenuItem: function (e) {
		const submenu = e.currentTarget.querySelector('.submenu');
		const menu = e.currentTarget.closest('.dialog');
		const currentFocus = menu.querySelectorAll('.focused');
		currentFocus.forEach(el => {
			el.classList.remove('focused');
			el.dispatchEvent(new CustomEvent('entry-blur'));
		});
		e.currentTarget.classList.add('focused');
		// Move the menu to the other side if there isn't room.
		if (submenu && submenu.getBoundingClientRect().right > document.documentElement.clientWidth) {
			submenu.style.inset = '0px 100% auto auto';
		}
	},

	/**
	 * Close any open menus.
	 */
	closeDialogs: function (e) {
		document.querySelectorAll(`.${ns}-dialog`).forEach(dialog => {
			const clickableElements = (dialog._keepOpenFor || []).concat(dialog.dataset.allowClick ? dialog : []);
			// Close the dialog if there's no event...
			const closeDialog = !e
				// ...the event was not for an element that allows the dialog to stay open
				|| !clickableElements.find(el => el === e.target || el.contains(e.target))
				// ...or the event was for an element explicitly set to close the dialog.
				|| (dialog._closeFor || []).find(el => el === e.target || el.contains(e.target));
			if (closeDialog) {
				dialog.parentNode.removeChild(dialog);
				Player.trigger('menu-close', dialog);
			}
		});
	},

	runTitleMarquee: async function () {
		Player.display._marqueeTO = setTimeout(Player.display.runTitleMarquee, 1000);
		document.querySelectorAll(`.${ns}-title-marquee`).forEach(title => {
			const offset = title.parentNode.getBoundingClientRect().width - (title.scrollWidth + 1);
			const location = title.getAttribute('data-location');
			// Fall out if the title is fully visible.
			if (offset >= 0) {
				return title.style.marginLeft = null;
			}
			const data = Player.display._marquees[location] = Player.display._marquees[location] || {
				direction: 1,
				position: parseInt(title.style.marginLeft, 10) || 0
			};
			// Pause at each end.
			if (data.pause > 0) {
				data.pause--;
				return;
			}
			data.position -= (20 * data.direction);

			// Pause then reverse direction when the end is reached.
			if (data.position > 0 || data.position < offset) {
				data.position = Math.min(0, Math.max(data.position, offset));
				data.direction *= -1;
				data.pause = 1;
			}

			title.style.marginLeft = data.position + 'px';
		});
	},

	_popoverMouseEnter: e => {
		const icon = e.currentTarget;
		if (!icon.infoEl || !Player.container.contains(icon.infoEl)) {
			icon.infoEl = _.element(`<div class="${ns}-popover-body ${ns}-dialog dialog">${icon.dataset.content}</div>`, Player.container);
			icon.infoEl._keepOpenFor = [ icon ];
			Player.position.showRelativeTo(icon.infoEl, icon);
		}
	},

	_popoverMouseLeave: e => {
		const icon = e.currentTarget;
		if (icon.infoEl && !icon.infoEl._clicked) {
			icon.infoEl.parentNode.removeChild(icon.infoEl);
			delete icon.infoEl;
		}
	},

	_popoverClick: e => {
		const icon = e.currentTarget;
		const openPopover = icon.infoEl && Player.container.contains(icon.infoEl);
		if (!openPopover) {
			Player.display._popoverMouseEnter(e);
		} else if (!(icon.infoEl._clicked = !icon.infoEl._clicked)) {
			Player.display._popoverMouseLeave(e);
		}
	},

	_initNoSleep: newValue => {
		const action = newValue ? 'addEventListener' : 'removeEventListener';
		if (!noSleep || !!newValue === Player.display._noSleepEnabled) {
			return;
		}
		Player.audio[action]('play', enableNoSleep);
		Player.audio[action]('pause', disableNoSleep);
		Player.audio[action]('ended', disableNoSleep);
		Player.display._noSleepEnabled = !!newValue;
		if (!Player.audio.paused) {
			noSleep[newValue ? 'enable' : 'disable']();
		}
	},

	untz() {
		const container =  Player.$(`.${ns}-image-link`);
		Player.untzing = !Player.untzing;
		Player.audio.playbackRate = Player.audio.defaultPlaybackRate = Player.untzing ? 1.3 : 1;
		Player.container.classList[Player.untzing ? 'add' : 'remove']('untz');
		if (Player.untzing) {
			const overlay = Player.$('.image-color-overlay');
			let rotate = 0;
			overlay.style.filter = `brightness(1.5); hue-rotate(${rotate}deg)`;
			(function color() {
				overlay.style.filter = `hue-rotate(${rotate = 360 - rotate}deg)`;
				Player.untzColorTO = setTimeout(color, 500);
			}());
			(function bounce() {
				if (Player.untzing) {
					container.style.transform = `scale(${1 + Math.random() * 0.05})`;
					container.style.filter = `brightness(${1 + Math.random() * 0.5}) blur(${Math.random() * 3}px)`;
					Player.untzBounceTO = setTimeout(bounce, 200);
				}
			}());
		} else {
			container.style.transform = null;
			container.style.filter = null;
			clearTimeout(Player.untzBounceTO);
			clearTimeout(Player.untzColorTO);
		}
	}
};
