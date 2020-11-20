module.exports = [
	{
		property: 'headerTemplate',
		title: 'Header',
		actions: [ { title: 'Reset', handler: 'settings.reset' } ],
		default: 'repeat-button shuffle-button hover-images-button playlist-button\nsound-name-marquee\nview-menu-button add-button reload-button close-button',
		displayGroup: 'Templates',
		displayMethod: 'textarea'
	},
	{
		property: 'rowTemplate',
		title: 'Row',
		actions: [ { title: 'Reset', handler: 'settings.reset' } ],
		default: 'sound-name h:{menu-button}',
		displayGroup: 'Templates',
		displayMethod: 'textarea'
	},
	{
		property: 'footerTemplate',
		title: 'Footer',
		actions: [ { title: 'Reset', handler: 'settings.reset' } ],
		default: 'playing-button:"sound-index /" sound-count sounds\n'
			+ 'p:{\n'
			+ '	<div style="float: right; margin-right: .5rem">\n'
			+ '		post-link\n'
			+ '		Open [ image-link sound-link ]\n'
			+ '		Download [ dl-image-button dl-sound-button ]\n'
			+ '	</div>\n'
			+ '}',
		description: 'Template for the footer contents',
		displayGroup: 'Templates',
		displayMethod: 'textarea',
		attrs: 'style="height:9em;"'
	},
	{
		property: 'chanXTemplate',
		title: '4chan X Header',
		default: 'p:{\n\tpost-link:"sound-name"\n\tprev-button\n\tplay-button\n\tnext-button\n\tsound-current-time / sound-duration\n}',
		actions: [ { title: 'Reset', handler: 'settings.reset' } ],
		displayGroup: 'Templates',
		displayMethod: 'textarea',
		attrs: 'style="height:9em;"'
	}
];
