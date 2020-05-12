settingsConfig.filter(setting => setting.showInSettings).map(function addSetting(setting) {
	let out = `<div class="${setting.isSubSetting ? `${ns}-col` : `${ns}-setting-header`}" ${setting.description ? `title="${setting.description}"` : ''}>
		${setting.title}
	</div>`;

	if (setting.settings) {
		out += `<div class="${ns}-row ${ns}-sub-settings">`
			+ setting.settings.map(subSetting => {
				return addSetting({ ...setting, settings: null, ...subSetting, isSubSetting: true })
			}).join('')
		+ `</div>`;

		return out;
	}

	let value = _get(data, setting.property, setting.default);
	let clss = setting.class ? `class="${setting.class}"` : '';

	if (setting.format) {
		value = _get(Player, setting.format)(value);
	}

	let type = typeof value;

	setting.isSubSetting && (out += `<div class="${ns}-col">`);

	if (type === 'boolean') {
		out += `<input type="checkbox" ${clss} data-property="${setting.property}" ${value ? 'checked' : ''}></input>`;
	} else if (setting.showInSettings === 'textarea' || type === 'object') {
		if (setting.split) {
			value = value.join(setting.split);
		} else if (type === 'object') {
			value = JSON.stringify(value, null, 4);
		}
		out += `<textarea ${clss} data-property="${setting.property}">${value}</textarea>`;
	} else if (setting.options) {
		out += `<select ${clss} data-property="${setting.property}">`
			+ setting.options.map(option => `<option value="${option[0]}" ${value === option[0] ? 'selected' : ''}>${option[1]}</option>`)
		+ '</select>';
	} else {
		out += `<input type="text" ${clss} data-property="${setting.property}" value="${value}"></input>`;
	}

	setting.isSubSetting && (out += `</div><div class="${ns}-col" style="min-width: 100%"></div>`);
	return out;
}).join('')