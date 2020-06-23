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
		displayGroup: 'Display',
		settings: [ { title: 'Enabled' } ]
	},
	{
		property: 'pauseOnHide',
		default: true,
		title: 'Pause on hide',
		description: 'Pause the player when it\'s hidden.',
		displayGroup: 'Display',
		settings: [ { title: 'Enabled' } ]
	},
	{
		title: 'Minimised Display',
		description: 'Optional displays for when the player is minimised.',
		displayGroup: 'Display',
		settings: [
			{
				property: 'pip',
				title: 'Thumbnail',
				description: 'Display a fixed thumbnail of the playing sound in the bottom right of the thread.',
				default: true
			},
			{
				property: 'maxPIPWidth',
				title: 'Max Width',
				description: 'Maximum width for the thumbnail.',
				default: '150px',
				updateStylesheet: true
			},
			{
				property: 'chanXControls',
				title: '4chan X Header Controls',
				description: 'Show playback controls in the 4chan X header. Customise the template below.',
				displayMethod: isChanX || null,
				options: {
					always: 'Always',
					closed: 'Only with the player closed',
					never: 'Never'
				}
			}
		]
	},
	{
		property: 'limitPostWidths',
		title: 'Limit Post Width',
		description: 'Limit the width of posts so they aren\'t hidden under the player.',
		displayGroup: 'Display',
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
		property: 'threadsViewStyle',
		title: 'Threads View',
		description: 'How threads in the threads view are listed.',
		displayGroup: 'Display',
		settings: [ {
			title: 'Display',
			default: 'table',
			options: {
				table: 'Table',
				board: 'Board'
			}
		} ]
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
		displayGroup: 'Filter',
		split: '\n'
	},
	{
		property: 'filters',
		default: [ '# Image MD5 or sound URL' ],
		title: 'Filters',
		description: 'List of URLs or image MD5s to filter, one per line.\nLines starting with a # will be ignored.',
		actions: [ { title: 'Reset', handler: 'settings.reset' } ],
		displayGroup: 'Filter',
		split: '\n'
	},
	{
		property: 'headerTemplate',
		title: 'Header',
		actions: [ { title: 'Reset', handler: 'settings.reset' } ],
		default: 'repeat-button shuffle-button hover-images-button playlist-button\nsound-name\nview-menu-button add-button reload-button close-button',
		displayGroup: 'Templates',
		displayMethod: 'textarea'
	},
	{
		property: 'rowTemplate',
		title: 'Row',
		actions: [ { title: 'Reset', handler: 'settings.reset' } ],
		default: 'sound-name h:{menu-button}',
		displayGroup: 'Templates',
		displayMethod: 'textarea'
	},
	{
		property: 'footerTemplate',
		title: 'Footer',
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
		displayGroup: 'Templates',
		displayMethod: 'textarea',
		attrs: 'style="height:120px;"'
	},
	{
		property: 'chanXTemplate',
		title: '4chan X Header',
		default: 'p:{\n\tpost-link:"sound-name"\n\tprev-button\n\tplay-button\n\tnext-button\n\tsound-current-time / sound-duration\n}',
		actions: [ { title: 'Reset', handler: 'settings.reset' } ],
		displayGroup: 'Templates',
		displayMethod: 'textarea'
	},
	{
		title: 'Colors',
		displayGroup: 'Display',
		property: 'colors',
		updateStylesheet: true,
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
