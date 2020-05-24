{
	const settingsConfig = require('settings');

	return settingsConfig.filter(setting => setting.showInSettings).map(function addSetting(setting) {
		const desc = setting.description;
		let out = `<div class="${setting.isSubSetting ? `${ns}-col` : `${ns}-setting-header`} ${desc ? `${ns}-has-description` : ''}" ${desc ? `title="${desc}"` : ''}>
			${setting.title}
			${(setting.actions || []).map(action => `<a href="javascript;" class="${ns}-setting-action" data-handler="${action.handler}">${action.title}</a>`)}
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

		if (setting.format) {
			value = _get(Player, setting.format)(value);
		}

		let type = typeof value;

		setting.isSubSetting && (out += `<div class="${ns}-col">`);

		if (type === 'boolean') {
			out += `<input type="checkbox" ${clss} data-property="${setting.property}" ${value ? 'checked' : ''} style="margin-bottom: .25rem"></input>`;
		} else if (setting.showInSettings === 'textarea' || type === 'object') {
			if (setting.split) {
				value = value.join(setting.split);
			} else if (type === 'object') {
				value = JSON.stringify(value, null, 4);
			}
			out += `<textarea ${clss} data-property="${setting.property}">${value}</textarea>`;
		} else if (setting.options) {
			out += `<select ${clss} data-property="${setting.property}" style="margin-bottom: .25rem">`
				+ Object.keys(setting.options).map(k => `<option value="${k}" ${value === k ? 'selected' : ''}>${setting.options[k]}</option>`).join('')
			+ '</select>';
		} else {
			out += `<input type="text" ${clss} data-property="${setting.property}" value="${value}"></input>`;
		}

		setting.isSubSetting && (out += `</div><div class="${ns}-col" style="min-width: 100%"></div>`);
		return out;
	}).join('')
}