module.exports = [
	// Order the groups appear in.
	...require('./display'),
	...require('./filter'),
	...require('./keybinds'),
	...require('./templates'),
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
	}
];
