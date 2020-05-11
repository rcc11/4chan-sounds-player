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
		if (!Player.container) {
			return;
		}
		const { bottom } = Player.position.getHeaderOffset();
		// Make sure the player isn't going off screen. 40 to give a bit of spacing for the 4chanX header.
		height = Math.min(height, document.documentElement.clientHeight - Player.container.offsetTop - bottom);
		width = Math.min(width, document.documentElement.clientWidth - Player.container.offsetLeft)

		Player.container.style.width = width + 'px';

		// Change the height of the playlist or image.
		const heightElement = Player.config.viewStyle === 'playlist' ? Player.$(`.${ns}-list-container`)
			: Player.config.viewStyle === 'image' ? Player.$(`.${ns}-image-link`)
			: Player.config.viewStyle === 'settings' ? Player.$(`.${ns}-settings`) : null;

		const offset = Player.container.getBoundingClientRect().height - heightElement.getBoundingClientRect().height;
		heightElement.style.height = Math.max(10, height - offset) + 'px';
	},

	/**
	 * Handle the user grabbing the header.
	 */
	initMove: function (e) {
		e.preventDefault();
		Player.$(`.${ns}-title`).style.cursor = 'grabbing';

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

		const { top, bottom } = Player.position.getHeaderOffset();

		// Ensure the player stays fully within the window.
		const { width, height } = Player.container.getBoundingClientRect();
		const maxX = document.documentElement.clientWidth - width;
		const maxY = document.documentElement.clientHeight - height - bottom;

		// Move the window.
		Player.container.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
		Player.container.style.top = Math.max(top, Math.min(y, maxY)) + 'px';
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