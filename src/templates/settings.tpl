
settingsConfig.filter(setting => setting.showInSettings).map(setting => {
	let out = `<div class="${ns}-setting-header" ${setting.title ? `title="${setting.desc}"` : ''}>${setting.title}</div>`;
	if (typeof setting.default === 'boolean') {
		out += `<input type="checkbox" data-property="${setting.property}" ${_get(data, setting.property, false) ? 'checked' : ''}></input>`;
	} else if (Array.isArray(setting.default)) {
		out += `<textarea data-property="${setting.property}">${_get(data, setting.property, '').join(setting.split)}</textarea>`;
	} else if (setting.options) {
		out += `<select data-property="${setting.property}">`
			+ setting.options.map(option => `<option value="${option[0]}" ${_get(data, setting.property) === option[0] ? 'selected' : ''}>${option[1]}</option>`)
		+ '</select>';
	} else {
		out += `<input type="text" data-property="${setting.property}" value="${_get(data, setting.property, '')}"></input>`;
	}
	return out;
}).join('')