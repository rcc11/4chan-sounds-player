{
	delegatedEvents: {
		mousedown: {
			[`.${ns}-title`]: 'position.initMove',
			[`.${ns}-expander`]: 'position.initResize'
		}
	},

	/**
	 * Handle the user grabbing the expander.
	 */
	initResize: function initDrag(e) {
		e.preventDefault();
		Player._startX = e.clientX;
		Player._startY = e.clientY;
		Player._startWidth = parseInt(document.defaultView.getComputedStyle(Player.container).width, 10);
		Player._startHeight = parseInt(document.defaultView.getComputedStyle(Player.container).height, 10);
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
		const style = document.defaultView.getComputedStyle(Player.container);
		document.documentElement.removeEventListener('mousemove', Player.position.doResize, false);
		document.documentElement.removeEventListener('mouseup', Player.position.stopResize, false);
		GM.setValue(ns + '.size', parseInt(style.width, 10) + ':' + parseInt(style.height, 10));
	},

	/**
	 * Resize the player.
	 */
	resize: function (width, height) {
		if (!Player.container) {
			return;
		}
		// Make sure the player isn't going off screen. 40 to give a bit of spacing for the 4chanX header.
		height = Math.min(height, document.documentElement.clientHeight - 40);

		Player.container.style.width = width + 'px';

		// Change the height of the playlist or image.
		const heightElement = Player.settings.viewStyle === 'playlist' ? Player.$(`.${ns}-list-container`)
			: Player.settings.viewStyle === 'image' ? Player.$(`.${ns}-image-link`)
			: Player.settings.viewStyle === 'settings' ? Player.$(`.${ns}-settings`) : null;

		const containerHeight = parseInt(document.defaultView.getComputedStyle(Player.container).height, 10);
		const offset = containerHeight - (parseInt(heightElement.style.height, 10) || 0);
		heightElement.style.height = Math.max(10, height - offset) + 'px';
	},

	/**
	 * Handle the user grabbing the header.
	 */
	initMove: function (e) {
		e.preventDefault();
		Player.$(`.${ns}-title`).style.cursor = 'grabbing';

		// Try to reapply the current sizing to fix oversized winows.
		const style = document.defaultView.getComputedStyle(Player.container);
		Player.position.resize(parseInt(style.width, 10), parseInt(style.height, 10));

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
		Player.$(`.${ns}-title`).style.cursor = null;
		GM.setValue(ns + '.position', parseInt(Player.container.style.left, 10) + ':' + parseInt(Player.container.style.top, 10));
	},

	/**
	 * Move the player.
	 */
	move: function (x, y) {
		if (!Player.container) {
			return;
		}
		const style = document.defaultView.getComputedStyle(Player.container);
		const maxX = document.documentElement.clientWidth; - parseInt(style.width, 10);
		const maxY = document.documentElement.clientHeight; - parseInt(style.height, 10);
		Player.container.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
		Player.container.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
	}
}