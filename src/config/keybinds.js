const hasMediaSession = 'mediaSession' in navigator;

module.exports = [
	{
		property: 'hardwareMediaKeys',
		title: 'Hardware Media Keys',
		displayGroup: 'Keybinds',
		description: 'Enable playback control via hardware media keys.'
			+ (!hasMediaSession ? ' Your browser does not support this feature.' : ''),
		default: hasMediaSession,
		attrs: !hasMediaSession && 'disabled'
	},
	{
		title: 'Keybinds',
		displayGroup: 'Keybinds',
		description: 'Enable keyboard shortcuts.',
		format: 'hotkeys.stringifyKey',
		parse: 'hotkeys.parseKey',
		class: `${ns}-key-input`,
		property: 'hotkey_bindings',
		settings: [
			{
				property: 'hotkeys',
				default: 'open',
				title: 'Enabled',
				format: null,
				parse: null,
				class: null,
				options: {
					always: 'Always',
					open: 'Only with the player open',
					never: 'Never'
				}
			},
			{
				property: 'hotkey_bindings.playPause',
				title: 'Play/Pause',
				keyHandler: 'togglePlay',
				ignoreRepeat: true,
				default: { key: ' ' }
			},
			{
				property: 'hotkey_bindings.previous',
				title: 'Previous',
				keyHandler: () => Player.previous({ force: true }),
				ignoreRepeat: true,
				default: { key: 'arrowleft' }
			},
			{
				property: 'hotkey_bindings.next',
				title: 'Next',
				keyHandler: () => Player.next({ force: true }),
				ignoreRepeat: true,
				default: { key: 'arrowright' }
			},
			{
				property: 'hotkey_bindings.previousGroup',
				title: 'Previous Group',
				keyHandler: () => Player.previous({ force: true, group: true }),
				ignoreRepeat: true,
				default: { shiftKey: true, key: 'arrowleft' }
			},
			{
				property: 'hotkey_bindings.nextGroup',
				title: 'Next Group',
				keyHandler: () => Player.next({ force: true, group: true }),
				ignoreRepeat: true,
				default: { shiftKey: true, key: 'arrowright' }
			},
			{
				property: 'hotkey_bindings.volumeUp',
				title: 'Volume Up',
				keyHandler: 'controls.volumeUp',
				default: { shiftKey: true, key: 'arrowup' }
			},
			{
				property: 'hotkey_bindings.volumeDown',
				title: 'Volume Down',
				keyHandler: 'controls.volumeDown',
				default: { shiftKey: true, key: 'arrowdown' }
			},
			{
				property: 'hotkey_bindings.closePlayer',
				title: 'Close',
				keyHandler: 'display.close',
				default: { key: '' }
			},
			{
				property: 'hotkey_bindings.togglePlayer',
				title: 'Show/Hide',
				keyHandler: 'display.toggle',
				default: { key: 'h' }
			},
			{
				property: 'hotkey_bindings.toggleFullscreen',
				title: 'Toggle Fullscreen',
				keyHandler: 'display.toggleFullScreen',
				default: { key: '' }
			},
			{
				property: 'hotkey_bindings.togglePlaylist',
				title: 'Toggle Playlist',
				keyHandler: 'playlist.toggleView',
				default: { key: '' }
			},
			{
				property: 'hotkey_bindings.toggleSearch',
				title: 'Toggle Playlist Search',
				keyHandler: () => Player.set('showPlaylistSearch', !Player.config.showPlaylistSearch),
				default: { key: '' }
			},
			{
				property: 'hotkey_bindings.scrollToPlaying',
				title: 'Jump To Playing',
				keyHandler: 'playlist.scrollToPlaying',
				default: { key: '' }
			},
			{
				property: 'hotkey_bindings.toggleHoverImages',
				title: 'Toggle Hover Images',
				keyHandler: 'playlist.toggleHoverImages',
				default: { key: '' }
			},
			{
				property: 'hotkey_bindings.toggleAutoScroll',
				title: 'Toggle Auto Scroll',
				keyHandler:  () => Player.set('autoScrollThread', !Player.config.autoScrollThread),
				default: { key: '' }
			}
		]
	}
];
