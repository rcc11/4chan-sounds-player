const selectors = require('../../selectors');

/* eslint-disable max-statements-per-line, no-empty */
module.exports = {
	initialize() {
		// Set the header offsets for use in templates.
		const { top, bottom } = Player.position.getHeaderOffset();
		Player.config.offsetTop = top + 'px';
		Player.config.offsetBottom = bottom + 'px';

		// Apply the last position/size, and post width limiting, when the player is shown.
		Player.on('show', async function () {
			const [ top, left ] = (await GM.getValue('position') || '').split(':');
			const [ width, height ] = (await GM.getValue('size') || '').split(':');
			+width && +height && Player.position.resize(width, height, true);
			+top && +left && Player.position.move(top, left);

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
			});
		}).observe(document.body, {
			childList: true,
			subtree: true
		});

		// Listen for changes from other tabs
		Player.syncTab('position', value => Player.position.move(...value.split(':').concat(true)));
		Player.syncTab('size', value => Player.position.resize(...value.split(':')));
	},

	/**
	 * Applies a max width to posts next to the player so they don't get hidden behind it.
	 */
	setPostWidths() {
		const offset = (document.documentElement.clientWidth - Player.container.offsetLeft) + 10;
		const enabled = !Player.isHidden && Player.config.limitPostWidths;
		const startY = Player.container.offsetTop;
		const endY = Player.container.getBoundingClientRect().height + startY;

		document.querySelectorAll(selectors.limitWidthOf).forEach(post => {
			const rect = enabled && post.getBoundingClientRect();
			const limitWidth = enabled && rect.top + rect.height > startY && rect.top < endY;
			post.style.maxWidth = limitWidth ? `calc(100% - ${offset}px)` : null;
			post.style.minWidth = limitWidth && Player.config.minPostWidth ? `${Player.config.minPostWidth}` : null;
		});
	},

	/**
	 * Handle the user grabbing the expander.
	 */
	initResize(e) {
		try { e.preventDefault(); } catch (e) { }
		Player._startX = (e.touches && e.touches[0] || e).clientX;
		Player._startY = (e.touches && e.touches[0] || e).clientY;
		let { width, height } = Player.container.getBoundingClientRect();
		Player._startWidth = width;
		Player._startHeight = height;
		Player._startTop = Player.container.offsetTop;
		Player._startLeft = Player.container.offsetLeft;
		const dir = e.currentTarget.dataset.direction || 'se';
		Player._resizeX = dir.includes('e') ? 1 : dir.includes('w') ? -1 : 0;
		Player._resizeY = dir.includes('s') ? 1 : dir.includes('n') ? -1 : 0;
		Player._resizeMoveX = dir.includes('w') ? -1 : 0;
		Player._resizeMoveY = dir.includes('n') ? -1 : 0;
		Player._resizeTarget = e.currentTarget;
	},

	/**
	 * Handle the user dragging the expander.
	 */
	doResize(e) {
		try { e.preventDefault(); } catch (e) { }

		const xDelta = ((e.touches && e.touches[0] || e).clientX - Player._startX) * Player._resizeX;
		const yDelta = ((e.touches && e.touches[0] || e).clientY - Player._startY) * Player._resizeY;
		const reposition = Player._resizeTarget.dataset.bypassPosition !== 'true' && (Player._resizeMoveX || Player._resizeMoveY);

		Player.position.resize(Player._startWidth + xDelta, Player._startHeight + yDelta, reposition || Player._resizeTarget.dataset.allowOffscreen);

		// If the direction is north or east then the player will need moving first.
		if (reposition) {
			Player.position.move(Player._startLeft + (xDelta * Player._resizeMoveX), Player._startTop + (yDelta * Player._resizeMoveY));
		}
	},

	/**
	 * Handle the user releasing the expander.
	 */
	stopResize(e) {
		try { e.preventDefault(); } catch (e) { }

		const { width, height } = Player.container.getBoundingClientRect();

		if (Player._resizeTarget.dataset.bypassSave !== 'true') {
			GM.setValue('size', width + ':' + height);
			if (Player._resizeMoveX || Player._resizeMoveY) {
				GM.setValue('position', parseInt(Player.container.style.left, 10) + ':' + parseInt(Player.container.style.top, 10));
			}
		}
	},

	/**
	 * Resize the player.
	 */
	resize(width, height, allowOffscreen) {
		if (!Player.container || Player.config.viewStyle === 'fullscreen') {
			return;
		}
		const { top, bottom } = Player.position.getHeaderOffset();
		// Make sure the player isn't larger than the screen, or going off screen unless allowed.
		height = Math.min(height, document.documentElement.clientHeight - (allowOffscreen ? (top + bottom) : Player.container.offsetTop + bottom));
		width = Math.min(width, document.documentElement.clientWidth - (allowOffscreen ? 0 : Player.container.offsetLeft));

		Player.container.style.width = width + 'px';
		Player.container.style.height = height + 'px';
		Player.controls.preventWrapping();
		Player.playlist.setImageHeight();
	},

	/**
	 * Handle the user grabbing the header.
	 */
	initMove(e) {
		if (e.target.nodeName === 'A' || e.target.closest('a') || e.target.classList.contains(`${ns}-expander`)) {
			return e.preventDrag = true;
		}
		try { e.preventDefault(); } catch (e) { }
		Player.$(`.${ns}-header`).style.cursor = 'grabbing';

		// Try to reapply the current sizing to fix oversized winows.
		const { width, height } = Player.container.getBoundingClientRect();
		Player.position.resize(width, height);

		const clientX = (e.touches && e.touches[0] || e).clientX;
		const clientY = (e.touches && e.touches[0] || e).clientY;
		Player._offsetX = clientX - Player.container.offsetLeft;
		Player._offsetY = clientY - Player.container.offsetTop;
	},

	/**
	 * Handle the user dragging the header.
	 */
	doMove(e) {
		try { e.preventDefault(); } catch (e) { }
		const clientX = (e.touches && e.touches[0] || e).clientX;
		const clientY = (e.touches && e.touches[0] || e).clientY;
		Player.position.move(clientX - Player._offsetX, clientY - Player._offsetY);
	},

	/**
	 * Handle the user releasing the heaer.
	 */
	stopMove(e) {
		try { e.preventDefault(); } catch (e) { }
		Player.$(`.${ns}-header`).style.cursor = null;
		GM.setValue('position', parseInt(Player.container.style.left, 10) + ':' + parseInt(Player.container.style.top, 10));
	},

	/**
	 * Move the player.
	 */
	move(x, y, allowOffscreen) {
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
	getHeaderOffset() {
		const docClasses = document.documentElement.classList;
		const hasChanXHeader = docClasses.contains('fixed');
		const headerHeight = hasChanXHeader ? document.querySelector('#header-bar').getBoundingClientRect().height : 0;
		const top = hasChanXHeader && docClasses.contains('top-header') ? headerHeight : 0;
		const bottom = hasChanXHeader && docClasses.contains('bottom-header') ? headerHeight : 0;

		return { top, bottom };
	},

	/**
	 * Position a fixed item with respect to an element or event.
	 */
	showRelativeTo(item, relative) {
		// Try and put the item aligned to the left under the relative.
		const relRect = relative instanceof Node
			? relative.getBoundingClientRect()
			: { top: relative.clientY, left: relative.clientX, width: 0, height: 0 };
		item.style.top = relRect.top + relRect.height + 'px';
		item.style.left = relRect.left + 'px';

		// Reposition around the relative if the item is off screen.
		const { width: width, height: height } = item.getBoundingClientRect();
		if (relRect.left + width > document.documentElement.clientWidth) {
			item.style.left = (relRect.left + relRect.width - width) + 'px';
		}
		if (relRect.top + relRect.height + height > document.documentElement.clientHeight - Player.position.getHeaderOffset().bottom) {
			item.style.top = (relRect.top - height) + 'px';
		}
	}
};
