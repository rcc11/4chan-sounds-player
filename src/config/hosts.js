module.exports = [
	{
		property: 'defaultUploadHost',
		default: 'catbox',
		parse: 'settings.hosts.setDefault'
	},
	{
		property: 'uploadHosts',
		title: 'Hosts',
		actions: [
			{ title: 'Add', handler: 'settings.hosts.add:prevent' },
			{ title: 'Restore Defaults', handler: 'settings.hosts.restoreDefaults:prevent' }
		],
		displayGroup: 'Hosts',
		displayMethod: 'settings.hosts.template',
		parse: 'settings.hosts.parse',
		looseCompare: true,
		wideDesc: true,
		description: 'Each host needs a unique name and URL that points to an upload endpoint. '
			+ '<br><br>The form data is a JSON representation of the data sent with the upload, with the file being indicated as "$file". '
			+ 'The form data and headers allow for any other information to be sent, such as a user token.'
			+ '<br><br>A response path or match can optionally be provided to get a link to the uploaded file from the response. '
			+ 'Use "Response Path" for JSON responses to set where a link or filename can be found in the response. '
			+ 'For all other responses "Response Match" takes a regular expression (without slashes) that is applied to the result, with the first capture group being the link or filename. '
			+ 'File URL format can be set if you only have part of the link, such as the filename. The response, or response path/match result, will be inserted in place of %s.',
		mix: true,
		default: {
			catbox: {
				default: true,
				url: 'https://catbox.moe/user/api.php',
				data: { reqtype: 'fileupload', fileToUpload: '$file', userhash: null },
				filenameLength: 29
			},
			pomf: {
				url: 'https://pomf.cat/upload.php',
				data: { 'files[]': '$file' },
				responsePath: 'files.0.url',
				soundUrl: 'a.pomf.cat/%s',
				filenameLength: 23
			},
			zz: {
				url: 'https://zz.ht/api/upload',
				responsePath: 'files.0.url',
				data: {
					'files[]': '$file'
				},
				headers: {
					token: null
				},
				filenameLength: 19
			},
			lewd: {
				url: 'https://lewd.se/upload',
				data: { file: '$file' },
				headers: { token: null, shortUrl: true },
				responsePath: 'data.link',
				filenameLength: 30
			}
		}
	}
];
