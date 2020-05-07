
settingsConfig.filter(setting => setting.showInSettings).map(setting =>
	`<div class="${ns}-setting-header" ${ setting.title ? `title="${setting.desc}"` : ''}>${setting.title}</div>`
	+ (
		typeof setting.default === 'boolean'
			? `<input type="checkbox" data-property="${setting.property}" ${_get(data, setting.property, false) ? 'checked' : ''}></input>`
		: Array.isArray(setting.default)
			? `<textarea data-property="${setting.property}">${_get(data, setting.property, '').join(setting.split)}</textarea>`
		: `<input type="text" data-property="${setting.property}" value="${_get(data, setting.property, '')}"></input>`
	)
).join('')