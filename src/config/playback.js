module.exports = [
	{
		property: 'shuffle',
		title: 'Shuffle',
		displayGroup: 'Playback',
		default: false
	},
	{
		property: 'repeat',
		title: 'Repeat',
		displayGroup: 'Playback',
		default: 'all',
		options: {
			all: 'All',
			one: 'One',
			none: 'None'
		}
	},
	{
		property: 'preventSleep',
		title: 'Prevent Sleep',
		displayGroup: 'Playback',
		description: 'Prevent sleeping while audio is playing. This only works when the browser and tab are in the foreground.',
		default: true
	},
	{
		property: 'autoplayNext',
		title: 'Autoplay Next',
		displayGroup: 'Playback',
		description: 'Automatically play the next sound when the current one finishes.',
		default: true
	},
	{
		title: 'Inline Player',
		displayGroup: 'Playback',
		settings: [
			{
				property: 'playExpandedImages',
				title: 'Expanded Image',
				description: 'Play audio when sound images are expanded.',
				default: true,
				dependentRender: [ 'expandedControls' ]
			},
			{
				property: 'expandedControls',
				title: 'Expanded Controls',
				description: 'Show playback controls for expanded image audio.',
				default: true,
				attrs: () => !Player.config.playExpandedImages ? 'disabled' : ''
			},
			{
				property: 'playHoveredImages',
				title: 'Hover Image',
				description: 'Play audio when sound hover images are shown. This applies to hover images displayed by the native extention or 4chan X.',
				default: true
			}
		]
	}
];
