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
		version: '3.3.0',
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
	},
	{
		version: '3.4.0',
		name: 'disable-inline-player-for-existing-users',
		async run() {
			Player.config.playExpandedImages = false;
			Player.config.playHoveredImages = false;
			return {
				playExpandedImages: [ true, false ],
				playHoveredImages: [ true, false ]
			};
		}
	},
	{
		version: '3.4.7',
		name: 'zz-ht-to-zz-fo',
		async run() {
			const original = [ ...Player.config.allow ];
			Player.config.allow.push('zz.fo');
			return {
				allow: [ original, Player.config.allow ]
			}
		}
	}
];
