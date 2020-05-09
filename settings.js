const settingsConfig = [
	{
		property: 'shuffle',
		default: false
	},
	{
		property: 'repeat',
		default: 'all'
	},
	{
		property: 'playlist',
		default: true
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
		property: 'colors.background',
		default: '#d6daf0',
		title: 'Background Color',
		showInSettings: true
	},
	{
		property: 'colors.border',
		default: '#b7c5d9',
		title: 'Border Color',
		showInSettings: true
	},
	{
		property: 'colors.odd_row',
		default: '#d6daf0',
		title: 'Odd Row Color',
		showInSettings: true
	},
	{
		property: 'colors.even_row',
		default: '#b7c5d9',
		title: 'Even Row Color',
		showInSettings: true
	},
	{
		property: 'colors.playing',
		default: '#98bff7',
		title: 'Playing Row Color',
		showInSettings: true
	},
	{
		property: 'colors.expander',
		default: '#808bbf',
		title: 'Expander Color',
		showInSettings: true
	}
]