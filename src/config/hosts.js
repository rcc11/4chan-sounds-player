module.exports = [
	{
		property: 'defaultUploadHost',
		default: 'catbox',
		parse: 'settings.setDefaultHost'
	},
	{
		property: 'uploadHosts',
		title: 'Hosts',
		actions: [
			{ title: 'Add', handler: 'settings.addUploadHost' },
			{ title: 'Restore Defaults', handler: 'settings.restoreDefaultHosts' },
		],
		default: 'sound-name h:{menu-button}',
		displayGroup: 'Hosts',
		displayMethod: 'settings.renderHosts',
		parse: 'settings.parseHosts',
		looseCompare: true,
		dismissTextId: 'uplodHostSettings',
		dismissRestoreText: 'Show Help',
		text: 'Properties'
			+ '<br><strong>Name</strong>: A unique identifier.'
			+ '<br><strong>URL</strong>: The URL to post the file to.'
			+ '<br><strong>Response Path/Match</strong>: A key path or regular expression to locate the uploaded filename in the response.'
			+ '<br><strong>File URL Format</strong>: The URL format for uploaded sounds. %s is replaced with the result of response path/match if given or the full response.'
			+ '<br><strong>Data</strong>: The form data for the upload (as JSON). Specify the file using $file.',
		mix: true,
		default:  {
			catbox: {
				default: true,
				url: 'https://catbox.moe/user/api.php',
				data: { reqtype: 'fileupload', fileToUpload: '$file', userhash: null }
			},
			pomf: {
				url: 'https://pomf.cat/upload.php',
				data: { 'files[]': '$file' },
				responsePath: 'files.0.url'
			}
		}
	}
];
