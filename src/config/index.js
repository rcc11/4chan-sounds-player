module.exports = [
	// Order the groups appear in.
	...require('./display'),
	...require('./filter'),
	...require('./keybinds'),
	...require('./theme'),
	...require('./hosts'),

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
		property: 'showPlaylistSearch',
		default: true
	},

	// These are for availability in templates
	{
		property: 'offsetTop',
		default: '0'
	},
	{
		property: 'offsetBottom',
		default: '0'
	}
];
