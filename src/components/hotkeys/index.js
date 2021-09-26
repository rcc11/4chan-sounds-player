const settingsConfig = require('config');

let keyConfigs;

module.exports = {
	_keyMap: {
		' ': 'space',
		arrowleft: 'left',
		arrowright: 'right',
		arrowup: 'up',
		arrowdown: 'down'
	},

	initialize() {
		Player.on('rendered', Player.hotkeys.apply);
		Player.on('config:hotkeys', Player.hotkeys.apply);

		keyConfigs = settingsConfig.reduce((c, s) => {
			s.property === 'hotkey_bindings' && s.settings.forEach(s => c[s.property.slice(16)] = s);
			return c;
		}, {});

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
			];
			for (let [ type, handler ] of actions) {
				try {
					navigator.mediaSession.setActionHandler(type, handler);
				} catch (err) {
					// not enabled...
				}
			}

			// Keep the media metadata updated.
			Player.audio.addEventListener('pause', () => navigator.mediaSession.playbackState = 'paused');
			Player.audio.addEventListener('ended', () => navigator.mediaSession.playbackState = 'paused');
			Player.audio.addEventListener('play', Player.hotkeys.setMediaMetadata);
			Player.audio.addEventListener('ratechange', Player.hotkeys.setMediaPosition);
			Player.audio.addEventListener('seeked', Player.hotkeys.setMediaPosition);
			Player.on('tags-loaded', sound => sound === Player.playing && Player.hotkeys.setMediaMetadata());
		}
	},

	async setMediaMetadata() {
		const sound = Player.playing;
		const tags = sound.tags || {};
		navigator.mediaSession.playbackState = 'playing';
		const metadata = {
			title: tags.title || sound.name || sound.title,
			artist: tags.artist ||  `/${Board}/ - ${Thread || '4chan Sounds Player'}`,
			album: tags.album || document.title,
			artwork: [
				{
					src: Player.playing.thumb,
					sizes: '125x125'
				}
			]
		};

		// If it's not a video add the full image to artwork. (TODO: grab the first frame for videos)
		// If we have the dimensions already add the artwork, otherwise load them then reset the metadata.
		if (!Player.isVideo) {
			if (sound._fullDimension) {
				metadata.artwork.push({
					src: Player.playing.image,
					sizes: sound._fullDimension
				});
			} else {
				const img = new Image();
				img.onload = function () {
					sound._fullDimension = img.width + 'x' + img.height;
					Player.hotkeys.setMediaMetadata();
				};
				img.src = Player.playing.image;
			}
		}

		navigator.mediaSession.metadata = new MediaMetadata(metadata);
		Player.hotkeys.setMediaPosition();
	},

	setMediaPosition() {
		navigator.mediaSession.setPositionState({
			duration: Player.audio.duration || 0,
			playbackRate: Player.audio.playbackRate,
			position: Player.audio.currentTime
		});
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
	apply() {
		const type = Player.config.hotkeys;
		Player.hotkeys.removeHandler();
		Player.off('show', Player.hotkeys.addHandler);
		Player.off('hide', Player.hotkeys.removeHandler);

		if (type === 'always') {
			// If hotkeys are always enabled then just set the handler.
			Player.hotkeys.addHandler();
		} else if (type === 'open') {
			// If hotkeys are only enabled with the player open toggle the handler as the player opens/closes.
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
	handle(e) {
		// Ignore events on inputs so you can still type.
		const ignoreFor = [ 'INPUT', 'SELECT', 'TEXTAREA', 'INPUT' ];
		if (ignoreFor.includes(e.target.nodeName) || Player.isHidden && (Player.config.hotkeys !== 'always' || !Player.sounds.length)) {
			return;
		}
		const k = e.key.toLowerCase();
		const bindings = Player.config.hotkey_bindings || {};

		// Look for a matching hotkey binding
		Object.entries(bindings).find(function checkBinding([ name, keyDef ]) {
			if (Array.isArray(keyDef)) {
				return keyDef.find(_def => checkBinding([ name, _def ]));
			}
			const bindingConfig = k === keyDef.key
				&& (!!keyDef.shiftKey === !!e.shiftKey) && (!!keyDef.ctrlKey === !!e.ctrlKey) && (!!keyDef.metaKey === !!e.metaKey)
				&& (!keyDef.ignoreRepeat || !e.repeat)
				&& keyConfigs[name];

			if (bindingConfig) {
				e.preventDefault();
				e._binding = keyDef;
				Player.getHandler(bindingConfig.keyHandler)(e);
				return true;
			}
			return false;
		});
	},

	/**
	 * Turn a hotkey definition or key event into an input string.
	 */
	stringifyKey(key) {
		let k = key.key.toLowerCase();
		Player.hotkeys._keyMap[k] && (k = Player.hotkeys._keyMap[k]);
		return (key.ctrlKey ? 'Ctrl+' : '') + (key.shiftKey ? 'Shift+' : '') + (key.metaKey ? 'Meta+' : '') + k;
	},

	/**
	 * Turn an input string into a hotkey definition object.
	 */
	parseKey(str) {
		const keys = str.split('+');
		let key = keys.pop();
		Object.keys(Player.hotkeys._keyMap).find(k => Player.hotkeys._keyMap[k] === key && (key = k));
		const newValue = { key };
		keys.forEach(key => newValue[key.toLowerCase() + 'Key'] = true);
		return newValue;
	}
};
