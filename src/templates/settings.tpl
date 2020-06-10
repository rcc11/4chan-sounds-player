{
	const settingsConfig = require('settings');

	let tpl = `
		<div class="${ns}-heading">Version</div>
		<a href="https://github.com/rcc11/4chan-sounds-player/releases/tag/${VERSION}" target="_blank">${VERSION}</a>

		<div class="${ns}-heading">Encode / Decode URL</div>
		<div class="${ns}-row">
			<input type="text" class="${ns}-decoded-input ${ns}-col" placeholder="https://">
			<input type="text" class="${ns}-encoded-input ${ns}-col" placeholder="https%3A%2F%2F">
		</div>
	`;

	settingsConfig.forEach(function addSetting(setting) {
		// Filter settings that aren't flagged to be displayed.
		if (!setting.showInSettings && !(setting.settings || []).find(s => s.showInSettings)) {
			return;
		}
		const desc = setting.description;

		tpl += `
		<div class="${ns}-row ${setting.isSubSetting ? `${ns}-sub-settings` : ''}">
			<div class="${ns}-col ${!setting.isSubSetting ? `${ns}-heading` : ''} ${desc ? `${ns}-has-description` : ''}" ${desc ? `title="${desc.replace(/"/g, '&quot;')}"` : ''}>
				${setting.title}
				${(setting.actions || []).map(action => `<a href="javascript:;" class="${ns}-heading-action" data-handler="${action.handler}" data-property="${setting.property}">${action.title}</a>`)}
			</div>`;

			if (setting.settings) {
				setting.settings.forEach(subSetting => addSetting({
					...setting,
					actions: null,
					settings: null,
					description: null,
					...subSetting,
					isSubSetting: true
				}));
			} else {

				let value = _get(Player.config, setting.property, setting.default),
					attrs = (setting.attrs || '') + (setting.class ? ` class="${setting.class}"` : '') + ` data-property="${setting.property}"`;

				if (setting.format) {
					value = _get(Player, setting.format)(value);
				}
				let type = typeof value;

				if (setting.split) {
					value = value.join(setting.split);
				} else if (type === 'object') {
					value = JSON.stringify(value, null, 4);
				}

				tpl += `
				<div class="${ns}-col">
				${
					type === 'boolean'
						? `<input type="checkbox" ${attrs} ${value ? 'checked' : ''}></input>`

					: setting.showInSettings === 'textarea' || type === 'object'
						? `<textarea ${attrs}>${value}</textarea>`

					: setting.options
						? `<select ${attrs}>
							${Object.keys(setting.options).map(k => `<option value="${k}" ${value === k ? 'selected' : ''}>
								${setting.options[k]}
							</option>`).join('')}
						</select>`

					: `<input type="text" ${attrs} value="${value}"></input>`
				}
				</div>`;
			}
		tpl += '</div>';
	});

	return tpl;
}