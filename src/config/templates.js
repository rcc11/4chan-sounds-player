module.exports = [
	{
		property: 'savedThemes',
		title: 'Saved Themes',
		actions: [
			{ title: 'Restore Defaults', handler: 'theme._restoreDefaults' },
			{ title: 'Save Current', handler: 'theme._showSaveOptions' }
		],
		displayGroup: 'Theme',
		displayMethod: 'theme.savedThemesTemplate',
		mix: true,
		default:  { }
	},
	{
		property: 'savedThemesOrder',
		default: [ ],
	},
	{
		property: 'selectedTheme',
		default: 'Default'
	},
	{
		property: 'headerTemplate',
		title: 'Header',
		actions: [ { title: 'Reset', handler: 'settings.reset' } ],
		default: 'repeat-button shuffle-button hover-images-button playlist-button\nsound-name-marquee\nview-menu-button add-button reload-button close-button',
		displayGroup: 'Theme',
		displayMethod: 'textarea',
		themeField: true
	},
	{
		property: 'rowTemplate',
		title: 'Row',
		actions: [ { title: 'Reset', handler: 'settings.reset' } ],
		default: 'sound-name h:{menu-button}',
		displayGroup: 'Theme',
		displayMethod: 'textarea',
		themeField: true
	},
	{
		property: 'footerTemplate',
		title: 'Footer',
		actions: [ { title: 'Reset', handler: 'settings.reset' } ],
		default: 'playing-button:"sound-index /" sound-count sounds\n'
			+ '<div class="fcsp-col"></div>\n'
			+ 'p:{\n'
			+ '		post-link\n'
			+ '		Open [ image-link sound-link ]\n'
			+ '		Download [ dl-image-button dl-sound-button ]\n'
			+ '}\n'
			+ `<div class="${ns}-expander" data-direction="se"></div>\n`,
		description: 'Template for the footer contents',
		displayGroup: 'Theme',
		displayMethod: 'textarea',
		attrs: 'style="height:9em;"',
		themeField: true
	},
	{
		property: 'chanXTemplate',
		title: '4chan X Header',
		default: 'p:{\n\tpost-link:"sound-name"\n\tprev-button\n\tplay-button\n\tnext-button\n\tsound-current-time / sound-duration\n}',
		actions: [ { title: 'Reset', handler: 'settings.reset' } ],
		displayGroup: 'Theme',
		displayMethod: 'textarea',
		attrs: 'style="height:9em;"',
		themeField: true
	},
	{
		property: 'customCSS',
		title: 'Custom CSS',
		default: '',
		displayGroup: 'Theme',
		displayMethod: 'textarea',
		attrs: 'style="height:9em"',
		themeField: true
	}
];
