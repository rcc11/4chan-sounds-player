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

	tpl += settingsConfig.filter(setting => setting.showInSettings).map(function addSetting(setting) {
		const desc = setting.description;
		let out = `<div class="${setting.isSubSetting ? `${ns}-col` : `${ns}-heading`} ${desc ? `${ns}-has-description` : ''}" ${desc ? `title="${desc.replace(/"/g, '&quot;')}"` : ''}>
			${setting.title}
			${(setting.actions || []).map(action => `<a href="javascript:;" class="${ns}-heading-action" data-handler="${action.handler}" data-property="${setting.property}">${action.title}</a>`)}
		</div>`;

		if (setting.settings) {
			out += `<div class="${ns}-row ${ns}-sub-settings">`
				+ setting.settings.map(subSetting => {
					return addSetting({
						...setting,
						actions: null,
						settings: null,
						description: null,
						...subSetting,
						isSubSetting: true
					})
				}).join('')
			+ `</div>`;

			return out;
		}

		let value = _get(Player.config, setting.property, setting.default);
		let clss = setting.class ? `class="${setting.class}"` : '';
		let attrs = setting.attrs || '';

		if (setting.format) {
			value = _get(Player, setting.format)(value);
		}

		let type = typeof value;

		setting.isSubSetting && (out += `<div class="${ns}-col">`);

		if (type === 'boolean') {
			out += `<input type="checkbox" ${clss} ${attrs} data-property="${setting.property}" ${value ? 'checked' : ''} style="margin-bottom: .25rem"></input>`;
		} else if (setting.showInSettings === 'textarea' || type === 'object') {
			if (setting.split) {
				value = value.join(setting.split);
			} else if (type === 'object') {
				value = JSON.stringify(value, null, 4);
			}
			out += `<textarea ${clss} ${attrs} data-property="${setting.property}">${value}</textarea>`;
		} else if (setting.options) {
			out += `<select ${clss} ${attrs} data-property="${setting.property}" style="margin-bottom: .25rem">`
				+ Object.keys(setting.options).map(k => `<option value="${k}" ${value === k ? 'selected' : ''}>${setting.options[k]}</option>`).join('')
			+ '</select>';
		} else {
			out += `<input type="text" ${clss} ${attrs} data-property="${setting.property}" value="${value}"></input>`;
		}

		setting.isSubSetting && (out += `</div><div class="${ns}-col" style="min-width: 100%"></div>`);
		return out;
	}).join('');

	return tpl;
}