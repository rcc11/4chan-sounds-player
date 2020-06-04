module.exports = {
	delegatedEvents: {
		mousedown: {
			[`.${ns}-header`]: 'position.initMove',
			[`.${ns}-expander`]: 'position.initResize'
		}
	},

	initialize: function () {
		// Apply the last position/size, and post width limiting, when the player is shown.
		Player.on('show', async function () {
			const [ top, left ] = (await GM.getValue(ns + '.position') || '').split(':');
			const [ width, height ] = (await GM.getValue(ns + '.size') || '').split(':');
			+top && +left && Player.position.move(top, left, true);
			+width && +height && Player.position.resize(width, height);

			if (Player.config.limitPostWidths) {
				Player.position.setPostWidths();
				window.addEventListener('scroll', Player.position.setPostWidths);
			}
		});

		// Remove post width limiting when the player is hidden.
		Player.on('hide', function () {
			Player.position.setPostWidths();
			window.removeEventListener('scroll', Player.position.setPostWidths);
		});

		// Reapply the post width limiting config values when they're changed.
		Player.on('config', prop => {
			if (prop === 'limitPostWidths' || prop === 'minPostWidth') {
				window.removeEventListener('scroll', Player.position.setPostWidths);
				Player.position.setPostWidths();
				if (Player.config.limitPostWidths) {
					window.addEventListener('scroll', Player.position.setPostWidths);
				}
			}
		});

		// Remove post width limit from inline quotes
		new MutationObserver(function () {
			document.querySelectorAll('#hoverUI .postContainer, .inline .postContainer, .backlink_container article').forEach(post => {
				post.style.maxWidth = null;
				post.style.minWidth = null;
			})
		}).observe(document.body, {
			childList: true,
			subtree: true
		});
	},

	/**
	 * Applies a max width to posts next to the player so they don't get hidden behind it.
	 */
	setPostWidths: function () {
		const offset = (document.documentElement.clientWidth - Player.container.offsetLeft) + 10;
		const selector = is4chan ? '.thread > .postContainer' : '.posts > article.post';
		const enabled = !Player.isHidden && Player.config.limitPostWidths;
		const startY = Player.container.offsetTop;
		const endY = Player.container.getBoundingClientRect().height + startY;

		document.querySelectorAll(selector).forEach(post => {
			const rect = enabled && post.getBoundingClientRect();
			const limitWidth = enabled && rect.top + rect.height > startY && rect.top < endY;
			post.style.maxWidth = limitWidth ? `calc(100% - ${offset}px)` : null;
			post.style.minWidth = limitWidth && Player.config.minPostWidth ? `${Player.config.minPostWidth}` : null;
		})
	},

	/**
	 * Handle the user grabbing the expander.
	 */
	initResize: function initDrag(e) {
		e.preventDefault();
		Player._startX = e.clientX;
		Player._startY = e.clientY;
		let { width, height } = Player.container.getBoundingClientRect();
		Player._startWidth = width;
		Player._startHeight = height;
		document.documentElement.addEventListener('mousemove', Player.position.doResize, false);
		document.documentElement.addEventListener('mouseup', Player.position.stopResize, false);
	},

	/**
	 * Handle the user dragging the expander.
	 */
	doResize: function(e) {
		e.preventDefault();
		Player.position.resize(Player._startWidth + e.clientX - Player._startX, Player._startHeight + e.clientY - Player._startY);
	},

	/**
	 * Handle the user releasing the expander.
	 */
	stopResize: function() {
		const { width, height } = Player.container.getBoundingClientRect();
		document.documentElement.removeEventListener('mousemove', Player.position.doResize, false);
		document.documentElement.removeEventListener('mouseup', Player.position.stopResize, false);
		GM.setValue(ns + '.size', width + ':' + height);
	},

	/**
	 * Resize the player.
	 */
	resize: function (width, height) {
		if (!Player.container || Player.config.viewStyle === 'fullscreen') {
			return;
		}
		const { bottom } = Player.position.getHeaderOffset();
		// Make sure the player isn't going off screen.
		height = Math.min(height, document.documentElement.clientHeight - Player.container.offsetTop - bottom);
		width = Math.min(width - 2, document.documentElement.clientWidth - Player.container.offsetLeft);

		Player.container.style.width = width + 'px';

		// Change the height of the playlist or image.
		const heightElement = Player.config.viewStyle === 'playlist' ? Player.$(`.${ns}-list-container`)
			: Player.config.viewStyle === 'image' ? Player.$(`.${ns}-image-link`)
			: Player.config.viewStyle === 'settings' ? Player.$(`.${ns}-settings`)
			: Player.config.viewStyle === 'threads' ? Player.$(`.${ns}-threads`) : null;

		const offset = Player.container.getBoundingClientRect().height - heightElement.getBoundingClientRect().height;
		heightElement.style.height = (height - offset) + 'px';
	},

	/**
	 * Handle the user grabbing the header.
	 */
	initMove: function (e) {
		e.preventDefault();
		Player.$(`.${ns}-header`).style.cursor = 'grabbing';

		// Try to reapply the current sizing to fix oversized winows.
		const { width, height } = Player.container.getBoundingClientRect();
		Player.position.resize(width, height);

		Player._offsetX = e.clientX - Player.container.offsetLeft;
		Player._offsetY = e.clientY - Player.container.offsetTop;
		document.documentElement.addEventListener('mousemove', Player.position.doMove, false);
		document.documentElement.addEventListener('mouseup', Player.position.stopMove, false);
	},

	/**
	 * Handle the user dragging the header.
	 */
	doMove: function (e) {
		e.preventDefault();
		Player.position.move(e.clientX - Player._offsetX, e.clientY - Player._offsetY);
	},

	/**
	 * Handle the user releasing the heaer.
	 */
	stopMove: function (e) {
		document.documentElement.removeEventListener('mousemove', Player.position.doMove, false);
		document.documentElement.removeEventListener('mouseup', Player.position.stopMove, false);
		Player.$(`.${ns}-header`).style.cursor = null;
		GM.setValue(ns + '.position', parseInt(Player.container.style.left, 10) + ':' + parseInt(Player.container.style.top, 10));
	},

	/**
	 * Move the player.
	 */
	move: function (x, y, allowOffscreen) {
		if (!Player.container) {
			return;
		}

		const { top, bottom } = Player.position.getHeaderOffset();

		// Ensure the player stays fully within the window.
		const { width, height } = Player.container.getBoundingClientRect();
		const maxX = allowOffscreen ? Infinity : document.documentElement.clientWidth - width;
		const maxY = allowOffscreen ? Infinity : document.documentElement.clientHeight - height - bottom;

		// Move the window.
		Player.container.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
		Player.container.style.top = Math.max(top, Math.min(y, maxY)) + 'px';

		if (Player.config.limitPostWidths) {
			Player.position.setPostWidths();
		}
	},

	/**
	 * Get the offset from the top or bottom required for the 4chan X header.
	 */
	getHeaderOffset: function () {
		const docClasses = document.documentElement.classList;
		const hasChanXHeader = docClasses.contains('fixed');
		const headerHeight = hasChanXHeader ? document.querySelector('#header-bar').getBoundingClientRect().height : 0;
		const top = hasChanXHeader && docClasses.contains('top-header') ? headerHeight : 0;
		const bottom = hasChanXHeader && docClasses.contains('bottom-header') ? headerHeight : 0;

		return { top, bottom };
	}
}
