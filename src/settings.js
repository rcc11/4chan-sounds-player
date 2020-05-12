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
		property: 'autoshow',
		default: true,
		title: 'Autoshow',
		description: 'Automatically show the player when the thread contains sounds.',
		showInSettings: true
	},
	{
		property: 'pauseOnHide',
		default: true,
		title: 'Pause on hide',
		description: 'Pause the player when it\'s hidden.',
		showInSettings: true
	},
	{
		property: 'hotkeys',
		default: 'open',
		title: 'Hotkeys',
		description: 'Enable hot keys for controlling the player playback.',
		showInSettings: true,
		handler: 'hotkeys.apply',
		options: [
			[ 'always', 'Always' ],
			[ 'open', 'Only with the player open' ],
			[ 'never', 'Never' ]
		]
	},
	{
		title: 'Hotkey Bindings',
		showInSettings: true,
		format: 'hotkeys.stringifyKey',
		parse: 'hotkeys.parseKey',
		class: `${ns}-key-input`,
		property: 'hotkey_bindings',
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
			}
		]
	},
	{
		property: 'allow',
		default: [
			'4cdn.org',
			'catbox.moe',
			'dmca.gripe',
			'lewd.se',
			'pomf.cat',
			'zz.ht'
		],
		title: 'Allow',
		description: 'Which domains sources are allowed to be loaded from.',
		showInSettings: true,
		split: '\n'
	},
	{
		title: 'Colors',
		showInSettings: true,
		property: 'colors',
		settings: [
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
				property: 'colors.expander',
				default: '#808bbf',
				title: 'Expander Color'
			}
		]
	}
]