module.exports = [
	{
		property: 'shuffle',
		default: false
	},
	{
		property: 'repeat',
		default: 'all'
	},
	{
		property: 'viewStyle',
		default: 'playlist'
	},
	{
		property: 'hoverImages',
		default: false
	},
	{
		property: 'preventHoverImagesFor',
		default: [],
		save: false
	},
	{
		property: 'autoshow',
		default: true,
		title: 'Autoshow',
		description: 'Automatically show the player when the thread contains sounds.',
		showInSettings: true,
		settings: [ { title: 'Enabled' } ]
	},
	{
		property: 'pauseOnHide',
		default: true,
		title: 'Pause on hide',
		description: 'Pause the player when it\'s hidden.',
		showInSettings: true,
		settings: [ { title: 'Enabled' } ]
	},
	{
		property: 'limitPostWidths',
		title: 'Limit Post Width',
		description: 'Limit the width of posts so they aren\'t hidden under the player.',
		showInSettings: true,
		settings: [
			{
				property: 'limitPostWidths',
				title: 'Enabled',
				default: true
			},
			{
				property: 'minPostWidth',
				title: 'Minimum Width',
				default: '50%'
			}
		]
	},
	{
		title: 'Keybinds',
		showInSettings: true,
		description: 'Enable keyboard shortcuts.',
		format: 'hotkeys.stringifyKey',
		parse: 'hotkeys.parseKey',
		class: `${ns}-key-input`,
		property: 'hotkey_bindings',
		settings: [
			{
				property: 'hotkeys',
				default: 'open',
				handler: 'hotkeys.apply',
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
				keyHandler: 'previous',
				ignoreRepeat: true,
				default: { key: 'arrowleft' }
			},
			{
				property: 'hotkey_bindings.next',
				title: 'Next',
				keyHandler: 'next',
				ignoreRepeat: true,
				default: { key: 'arrowright' }
			},
			{
				property: 'hotkey_bindings.volumeUp',
				title: 'Volume Up',
				keyHandler: 'hotkeys.volumeUp',
				default: { shiftKey: true, key: 'arrowup' }
			},
			{
				property: 'hotkey_bindings.volumeDown',
				title: 'Volume Down',
				keyHandler: 'hotkeys.volumeDown',
				default: { shiftKey: true, key: 'arrowdown' }
			},
			{
				property: 'hotkey_bindings.toggleFullscreen',
				title: 'Toggle Fullscreen',
				keyHandler: 'display.toggleFullScreen',
				default: { key: '' }
			},
			{
				property: 'hotkey_bindings.togglePlayer',
				title: 'Show/Hide',
				keyHandler: 'display.toggle',
				default: { key: 'h' }
			},
			{
				property: 'hotkey_bindings.togglePlaylist',
				title: 'Toggle Playlist',
				keyHandler: 'playlist.toggleView',
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
			}
		]
	},
	{
		property: 'allow',
		title: 'Allowed Hosts',
		description: 'Which domains sources are allowed to be loaded from.',
		default: [
			'4cdn.org',
			'catbox.moe',
			'dmca.gripe',
			'lewd.se',
			'pomf.cat',
			'zz.ht'
		],
		actions: [ { title: 'Reset', handler: 'settings.reset' } ],
		showInSettings: true,
		split: '\n'
	},
	{
		property: 'filters',
		default: [ '# Image MD5 or sound URL' ],
		title: 'Filters',
		description: 'List of URLs or image MD5s to filter, one per line.\nLines starting with a # will be ignored.',
		actions: [ { title: 'Reset', handler: 'settings.reset' } ],
		showInSettings: true,
		split: '\n'
	},
	{
		property: 'headerTemplate',
		title: 'Header Contents',
		actions: [ { title: 'Reset', handler: 'settings.reset' } ],
		default: 'repeat-button shuffle-button hover-images-button playlist-button\nsound-name\nadd-button reload-button threads-button settings-button close-button',
		showInSettings: 'textarea',
	},
	{
		property: 'rowTemplate',
		title: 'Row Contents',
		actions: [ { title: 'Reset', handler: 'settings.reset' } ],
		default: 'sound-name h:{menu-button}',
		showInSettings: 'textarea'
	},
	{
		property: 'footerTemplate',
		title: 'Footer Contents',
		actions: [ { title: 'Reset', handler: 'settings.reset' } ],
		default: 'playing-button:"sound-index /" sound-count sounds\n'
			+ 'p:{\n'
			+ '	<div style="float: right; margin-right: .5rem">\n'
			+ '		post-link\n'
			+ '		Open [ image-link sound-link ]\n'
			+ '		Download [ dl-image-button dl-sound-button ]\n'
			+ '	</div>\n'
			+ '}',
		description: 'Template for the footer contents',
		showInSettings: 'textarea',
		attrs: 'style="height:120px;"'
	},
	{
		title: 'Colors',
		showInSettings: true,
		property: 'colors',
		actions: [
			{ title: 'Match Theme', handler: 'settings.forceBoardTheme' }
		],
		// These colors will be overriden with the theme defaults at initialization.
		settings: [
			{
				property: 'colors.text',
				default: '#000000',
				title: 'Text Color'
			},
			{
				property: 'colors.background',
				default: '#d6daf0',
				title: 'Background Color'
			},
			{
				property: 'colors.border',
				default: '#b7c5d9',
				title: 'Border Color'
			},
			{
				property: 'colors.odd_row',
				default: '#d6daf0',
				title: 'Odd Row Color',
			},
			{
				property: 'colors.even_row',
				default: '#b7c5d9',
				title: 'Even Row Color'
			},
			{
				property: 'colors.playing',
				default: '#98bff7',
				title: 'Playing Row Color'
			},
			{
				property: 'colors.dragging',
				default: '#c396c8',
				title: 'Dragging Row Color'
			}
		]
	}
];
