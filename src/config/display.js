module.exports = [
	{
		property: 'autoshow',
		default: true,
		title: 'Autoshow',
		description: 'Automatically show the player when the thread contains sounds.',
		displayGroup: 'Display'
	},
	{
		property: 'pauseOnHide',
		default: true,
		title: 'Pause On Hide',
		description: 'Pause the player when it\'s hidden.',
		displayGroup: 'Display'
	},
	{
		property: 'showUpdatedNotification',
		default: true,
		title: 'Show Updated Notifications',
		description: 'Show notifications when the player is successfully updated.',
		displayGroup: 'Display'
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
				description: 'Show playback controls in the 4chan X header. The display can be customised in Templates.',
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
