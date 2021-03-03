const hasMediaSession = 'mediaSession' in navigator;
const keybindOpts = {
	displayGroup: 'Keybinds',
	format: 'hotkeys.stringifyKey',
	parse: 'hotkeys.parseKey',
	attrs: '@keydown="settings.handleKeyChange"',
	property: 'hotkey_bindings',
	allowInTheme: true
};

module.exports = [
	{
		title: 'Keybinds',
		displayGroup: 'Keybinds',
		settings: [
			{
				property: 'hotkeys',
				default: 'open',
				title: 'Enabled',
				options: {
					always: 'Always',
					open: 'Only with the player open',
					never: 'Never'
				}
			},
			{
				property: 'hardwareMediaKeys',
				title: 'Hardware Media Keys',
				displayGroup: 'Keybinds',
				description: 'Enable playback control via hardware media keys.'
					+ (!hasMediaSession ? ' Your browser does not support this feature.' : ''),
				default: hasMediaSession,
				attrs: !hasMediaSession && 'disabled'
			}
		]
	},
	{
		title: 'Playback',
		themeFieldTitle: 'Playback Keybinds',
		...keybindOpts,
		settings: [
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
				keyHandler: 'actions.volumeUp',
				default: { shiftKey: true, key: 'arrowup' }
			},
			{
				property: 'hotkey_bindings.volumeDown',
				title: 'Volume Down',
				keyHandler: 'actions.volumeDown',
				default: { shiftKey: true, key: 'arrowdown' }
			},
			{
				property: 'hotkey_bindings.shuffle',
				title: 'Shuffle',
				keyHandler: 'playlist.toggleShuffle',
				default: { key: '' }
			},
			{
				property: 'hotkey_bindings.repeat',
				title: 'Toggle Repeat',
				keyHandler: 'playlist.toggleRepeat',
				default: { key: '' }
			}
		]
	},
	{
		title: 'Display',
		themeFieldTitle: 'Display Keybinds',
		...keybindOpts,
		settings: [
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
				keyHandler: () => Player.playlist.scrollToPlaying(),
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
				title: 'Toggle Thread Scroll',
				keyHandler: () => Player.set('autoScrollThread', !Player.config.autoScrollThread),
				default: { key: '' }
			}
		]
	},
	{
		title: 'Theme',
		themeFieldTitle: 'Theme Keybinds',
		...keybindOpts,
		settings: [
			{
				property: 'hotkey_bindings.nextTheme',
				title: 'Next Theme',
				keyHandler: 'theme.next',
				default: { key: '' }
			},
			{
				property: 'hotkey_bindings.previousTheme',
				title: 'Previous Theme',
				keyHandler: 'theme.previous',
				default: { key: '' }
			},
			{
				property: 'hotkey_bindings.switchTheme',
				title: 'Select Theme',
				keyHandler: 'theme.handleSwitch',
				default: [ ],
				displayMethod: 'theme.themeKeybindsTemplate',
				parse: 'theme.parseSwitch',
				format: null
			}
		]
	}
];
