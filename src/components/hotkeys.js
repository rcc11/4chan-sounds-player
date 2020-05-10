{
	initialize: function () {
		Player.on('rendered', Player.hotkeys.apply);
	},

	/**
	 * Apply the selecting hotkeys option
	 */
	apply: function () {
		const type = Player.settings.hotkeys;
		const handler = Player.hotkeys.handle;
		document.body.removeEventListener('keydown', handler);

		if (type === 'always') {
			// If hotkeys are always enabled then just set the handler.
			document.body.addEventListener('keydown', handler)
		} else if (type === 'open') {
			// If hotkeys are only enabled with the player toggle the handler as the player opens/closes.
			// If the player is already open set the handler now.
			if (!Player.isHidden) {
				document.body.addEventListener('keydown', handler)
			}
			Player.on('hide', () => document.body.removeEventListener('keydown', handler));
			Player.on('show', () => document.body.addEventListener('keydown', handler));
		}
	},

	/**
	 * Handle a keydown even on the body
	 */
	handle: function (e) {
		const ignoreFor = [ 'INPUT', 'SELECT', 'TEXTAREA', 'INPUT' ];
		// Ignore events on inputs so you can still type.
		if (ignoreFor.includes(e.target.nodeName) || Player.settings.hotkeys === 'open' && Player.isHidden) {
			return;
		}

		// Prev, play/pause, and next can be ignored if the player is empty.
		if (Player.playOrder.length) {
			switch (e.which) {
				case 37: e.preventDefault(); Player.previous(); return;
				case 39: e.preventDefault(); Player.next(); return;
				case 32: e.preventDefault(); Player.togglePlay(); return;
			}
		}

		if (e.shiftKey) {
			switch (e.which) {
				case 38: e.preventDefault(); Player.audio.volume = Math.min(Player.audio.volume + .05, 1); return;
				case 40: e.preventDefault(); Player.audio.volume = Math.max(Player.audio.volume - .05, 0); return;
			}
		}
	}
}
