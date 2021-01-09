// Migrations must return { [prop]: [ previous, updated ], ... }
module.exports = [
	{
		version: '3.0.0',
		name: 'hosts-filename-length',
		async run() {
			const defaultHosts = Player.settings.findDefault('uploadHosts').default;
			Object.keys(defaultHosts).forEach(host => {
				Player.config.uploadHosts[host].filenameLength = defaultHosts[host].filenameLength;
			});
			return {};
		}
	}
];
