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
		title: 'Show Update Notifications',
		description: 'Show notifications when the player is successfully updated.',
		displayGroup: 'Display'
	},
	{
		title: 'Controls',
		displayGroup: 'Display',
		settings: [
			{
				property: 'preventControlWrapping',
				title: 'Prevent Wrapping',
				description: 'Hide controls to prevent wrapping when the player is too small',
				default: true
			},
			{
				property: 'controlsHideOrder',
				title: 'Hide Order',
				description: 'Order controls are hidden in to prevent wrapping. Available controls are previous, next, seek-bar, time, duration, volume, mute, volume-bar, and fullscreen.',
				default: [ 'fullscreen', 'duration', 'volume-bar', 'seek-bar', 'time', 'previous' ],
				displayMethod: (value, attrs) => `<div class="${ns}-col"><textarea ${attrs}>${value}</textarea></div>`,
				format: v => v.join('\n'),
				parse: v => v.split(/\s+/)
			}
		]
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
		title: 'Thread',
		displayGroup: 'Display',
		settings: [
			{
				property: 'autoScrollThread',
				description: 'Automatically scroll the thread to posts as sounds play.',
				title: 'Auto Scroll',
				default: false
			},
			{
				property: 'limitPostWidths',
				description: 'Limit the width of posts so they aren\'t hidden under the player.',
				title: 'Limit Post Widths',
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
		class: `${ns}-colorpicker-input`,
		displayMethod: (value, attrs) => `<div class="${ns}-col">
				<input type="text" ${attrs} value="${value}">
				<div class="${ns}-cp-preview" style="background: ${value}"></div>
			</div>`,
		actions: [
			{ title: 'Match Theme', handler: 'display.forceBoardTheme' }
		],
		// These colors will be overriden with the theme defaults at initialization. They're set to yotsuba b here.
		settings: [
			{
				property: 'colors.text',
				default: '#000000',
				title: 'Text'
			},
			{
				property: 'colors.background',
				default: '#d6daf0',
				title: 'Background'
			},
			{
				property: 'colors.border',
				default: '#b7c5d9',
				title: 'Border'
			},
			{
				property: 'colors.odd_row',
				default: '#d6daf0',
				title: 'Odd Row',
			},
			{
				property: 'colors.even_row',
				default: '#b7c5d9',
				title: 'Even Row'
			},
			{
				property: 'colors.playing',
				default: '#98bff7',
				title: 'Playing Row'
			},
			{
				property: 'colors.dragging',
				default: '#c396c8',
				title: 'Dragging Row'
			},
			{
				property: 'colors.controls_background',
				default: '#3f3f44',
				title: 'Controls Background',
				description: 'The controls container element background.',
				actions: [ { title: 'Reset', handler: 'settings.reset' } ],
			},
			{
				property: 'colors.controls_inactive',
				default: '#FFFFFF',
				title: 'Control Items',
				description: 'The playback controls and played bar.',
				actions: [ { title: 'Reset', handler: 'settings.reset' } ],
			},
			{
				property: 'colors.controls_active',
				default: '#00b6f0',
				title: 'Focused Control Items',
				description: 'The control items when hovered.',
				actions: [ { title: 'Reset', handler: 'settings.reset' } ],
			},
			{
				property: 'colors.controls_empty_bar',
				default: '#131314',
				title: 'Volume/Seek Bar Background',
				decscription: 'The background of the volume and seek bars.',
				actions: [ { title: 'Reset', handler: 'settings.reset' } ],
			},
			{
				property: 'colors.controls_loaded_bar',
				default: '#5a5a5b',
				title: 'Loaded Bar Background',
				description: 'The loaded bar within the seek bar.',
				actions: [ { title: 'Reset', handler: 'settings.reset' } ],
			},
			// Not configurable but here for access in templates.
			{
				property: 'colors.page_background',
				default: 'rgb(238, 242, 255)',
				displayMethod: null
			}
		]
	}
];
