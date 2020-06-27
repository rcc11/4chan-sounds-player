module.exports = [
	...require('./display'),
	...require('./filter'),
	...require('./hosts'),
	...require('./keybinds'),
	...require('./templates'),

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
		property: 'showPlaylistSearch',
		deafult: true
	}
];
