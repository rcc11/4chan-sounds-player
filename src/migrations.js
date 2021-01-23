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
	},
	{
		version: '3.4.0',
		name: 'sound-name-title-swap',
		async run() {
			const config = Player.config;
			const changes = {};
			const templates = [ 'headerTemplate', 'rowTemplate', 'footerTemplate', 'chanXTemplate', 'customCSS' ];
			templates.forEach(prop => {
				/sound-name/.test(config[prop]) && (changes[prop] = [
					config[prop],
					config[prop] = config[prop].replace(/sound-name/g, 'sound-title')
				]);
			});
			return changes;
		}
	}
];
