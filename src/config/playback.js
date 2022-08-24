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
		property: 'restartSeconds',
		title: 'Restart After',
		displayGroup: 'Playback',
		description: 'How long into a track until selecting previous restarts the track instead. Set to 0 to disable.',
		default: 3,
		parse: v => +v >= 0 && +v < Infinity ? +v : 0
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
				description: 'Show playback controls for expanded images.',
				default: true,
				attrs: () => !Player.config.playExpandedImages ? 'disabled' : ''
			},
			{
				property: 'expandedLoopMaster',
				title: 'Master Source',
				default: 'sound',
				description: 'Which media source to play in full for audio and video of different durations.',
				options: {
					sound: 'Audio',
					video: 'Video',
					// longest: 'Longest'
				}
			},
			{
				property: 'expandedAllowFiltered',
				title: 'Allow Filtered',
				default: true,
				description: 'Allow sounds that have been filtered to be played inline. '
					+ 'Sounds from unknown hosts will not be played regardless of this setting.',
			},
			{
				property: 'expandedRepeat',
				title: 'Repeat',
				default: 'all',
				description: 'How to repeat expanded images with multiple sounds.',
				options: {
					all: 'All',
					one: 'One',
					none: 'None'
				}
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
