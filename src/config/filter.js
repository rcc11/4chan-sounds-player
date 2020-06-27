module.exports = [
	{
		property: 'allow',
		title: 'Allowed Hosts',
		description: 'Which domains sources are allowed to be loaded from.',
		default: [
			'4cdn.org',
			'catbox.moe',
			'dmca.gripe',
			'lewd.se',
			'pomf.cat',
			'zz.ht'
		],
		actions: [ { title: 'Reset', handler: 'settings.reset' } ],
		displayGroup: 'Filter',
		split: '\n'
	},
	{
		property: 'filters',
		default: [ '# Image MD5 or sound URL' ],
		title: 'Filters',
		description: 'List of URLs or image MD5s to filter, one per line.\nLines starting with a # will be ignored.',
		actions: [ { title: 'Reset', handler: 'settings.reset' } ],
		displayGroup: 'Filter',
		split: '\n'
	}
];
