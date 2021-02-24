module.exports = [
	{
		property: 'savedThemes',
		title: 'Saved Themes',
		actions: [
			{ title: 'Restore Defaults', handler: 'theme.restoreDefaults:prevent' },
			{ title: 'Save Current', handler: 'theme.showSaveOptions:prevent:stop' }
		],
		displayGroup: 'Theme',
		displayMethod: 'theme.savedThemesTemplate',
		mix: true,
		default: require('../components/theme/themes.js')
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
		actions: [ { title: 'Reset', handler: 'settings.reset("headerTemplate"):prevent' } ],
		default: 'repeat-button shuffle-button hover-images-button playlist-button\nsound-title-marquee\nview-menu-button add-button theme-menu-button close-button',
		displayGroup: 'Theme',
		displayMethod: 'textarea',
		themeField: true
	},
	{
		property: 'rowTemplate',
		title: 'Row',
		actions: [ { title: 'Reset', handler: 'settings.reset("rowTemplate"):prevent' } ],
		default: 'sound-title h:{menu-button}',
		displayGroup: 'Theme',
		displayMethod: 'textarea',
		themeField: true
	},
	{
		property: 'footerTemplate',
		title: 'Footer',
		actions: [ { title: 'Reset', handler: 'settings.reset("footerTemplate"):prevent' } ],
		default: 'playing-button:"sound-index /&nbsp;" sound-count sounds\n'
			+ '<div class="fcsp-col"></div>\n'
			+ 'p:{\n'
			+ '		post-link\n'
			+ '		Open [ image-link sound-link ]\n'
			+ '		Download [ dl-image-button dl-sound-button ]\n'
			+ '}\n'
			+ `<div class="${ns}-expander" data-direction="se"></div>\n`,
		displayGroup: 'Theme',
		displayMethod: 'textarea',
		attrs: 'style="height:9em;"',
		themeField: true
	},
	{
		property: 'chanXTemplate',
		title: '4chan X Header',
		default: 'p:{\n\tpost-link:"sound-title"\n\tprev-button\n\tplay-button\n\tnext-button\n\tsound-current-time / sound-duration\n}',
		actions: [ { title: 'Reset', handler: 'settings.reset("chanXTemplate"):prevent' } ],
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
