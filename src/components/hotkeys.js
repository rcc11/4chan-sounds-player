const settingsConfig = require('config');

module.exports = {
	initialize: function () {
		Player.on('rendered', Player.hotkeys.apply);
		Player.on('config:hotkeys', Player.hotkeys.apply);

		// Setup up hardware media keys.
		if ('mediaSession' in navigator && Player.config.hardwareMediaKeys) {
			const actions = [
				[ 'play', () => Player.play() ],
				[ 'pause', () => Player.pause() ],
				[ 'stop', () => Player.pause() ],
				[ 'previoustrack', () => Player.previous() ],
				[ 'nexttrack', () => Player.next() ],
				[ 'seekbackward', evt => Player.audio.currentTime -= evt.seekOffset || 10 ],
				[ 'seekforward', evt => Player.audio.currentTime += evt.seekOffset || 10 ],
				[ 'seekto', evt => Player.audio.currentTime += evt.seekTime ]
			]
			for (let [ type, handler ] of actions) {
				try {
					navigator.mediaSession.setActionHandler(type, handler);
				} catch(err) {
					// not enabled...
				}
			}

			// Keep the media metadata updated.
			Player.audio.addEventListener('pause', () => navigator.mediaSession.playbackState = 'paused');
			Player.audio.addEventListener('ended', () => navigator.mediaSession.playbackState = 'paused');
			Player.audio.addEventListener('play', function() {
				navigator.mediaSession.playbackState = 'playing';
				navigator.mediaSession.metadata = new MediaMetadata({
					title: Player.playing.title,
					artist: '4chan Sounds Player',
					album: document.title,
					artwork: [ { src: Player.playing.thumb } ]
				});
			});
		}
	},

	_keyMap: {
		' ': 'space',
		arrowleft: 'left',
		arrowright: 'right',
		arrowup: 'up',
		arrowdown: 'down'
	},

	addHandler: () => {
		Player.hotkeys.removeHandler();
		document.body.addEventListener('keydown', Player.hotkeys.handle);
	},
	removeHandler: () => {
		document.body.removeEventListener('keydown', Player.hotkeys.handle);
	},

	/**
	 * Apply the selecting hotkeys option
	 */
	apply: function () {
		const type = Player.config.hotkeys;
		Player.hotkeys.removeHandler();
		Player.off('show', Player.hotkeys.addHandler);
		Player.off('hide', Player.hotkeys.removeHandler);

		if (type === 'always') {
			// If hotkeys are always enabled then just set the handler.
			Player.hotkeys.addHandler();
		} else if (type === 'open') {
			// If hotkeys are only enabled with the player toggle the handler as the player opens/closes.
			// If the player is already open set the handler now.
			if (!Player.isHidden) {
				Player.hotkeys.addHandler();
			}
			Player.on('show', Player.hotkeys.addHandler);
			Player.on('hide', Player.hotkeys.removeHandler);
		}
	},

	/**
	 * Handle a keydown even on the body
	 */
	handle: function (e) {
		// Ignore events on inputs so you can still type.
		const ignoreFor = [ 'INPUT', 'SELECT', 'TEXTAREA', 'INPUT' ];
		if (ignoreFor.includes(e.target.nodeName) || Player.isHidden && (Player.config.hotkeys !== 'always' || !Player.sounds.length)) {
			return;
		}
		const k = e.key.toLowerCase();
		const bindings = Player.config.hotkey_bindings || {};

		// Look for a matching hotkey binding
		for (let key in bindings) {
			const keyDef = bindings[key];
			const bindingConfig = k === keyDef.key
				&& (!!keyDef.shiftKey === !!e.shiftKey) && (!!keyDef.ctrlKey === !!e.ctrlKey) && (!!keyDef.metaKey === !!e.metaKey)
				&& (!keyDef.ignoreRepeat || !e.repeat)
				&& settingsConfig.find(s => s.property === 'hotkey_bindings').settings.find(s => s.property === 'hotkey_bindings.' + key);

			if (bindingConfig) {
				e.preventDefault();
				return Player.events.getHandler(bindingConfig.keyHandler)();
			}
		}
	},

	/**
	 * Turn a hotkey definition or key event into an input string.
	 */
	stringifyKey: function (key) {
		let k = key.key.toLowerCase();
		Player.hotkeys._keyMap[k] && (k = Player.hotkeys._keyMap[k]);
		return (key.ctrlKey ? 'Ctrl+' : '') + (key.shiftKey ? 'Shift+' : '') + (key.metaKey ? 'Meta+' : '') + k;
	},

	/**
	 * Turn an input string into a hotkey definition object.
	 */
	parseKey: function (str) {
		const keys = str.split('+');
		let key = keys.pop();
		Object.keys(Player.hotkeys._keyMap).find(k => Player.hotkeys._keyMap[k] === key && (key = k));
		const newValue = { key };
		keys.forEach(key => newValue[key.toLowerCase() + 'Key'] = true);
		return newValue;
	},

	volumeUp: function () {
		Player.audio.volume = Math.min(Player.audio.volume + 0.05, 1);
	},

	volumeDown: function () {
		Player.audio.volume = Math.max(Player.audio.volume - 0.05, 0);
	}
};
