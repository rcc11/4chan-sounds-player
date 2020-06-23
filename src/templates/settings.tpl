{
	const settingsConfig = require('settings');
	const groups = settingsConfig.reduce((groups, setting) => {
		if (setting.displayGroup) {
			groups[setting.displayGroup] || (groups[setting.displayGroup] = []);
			groups[setting.displayGroup].push(setting);
		}
		return groups;
	}, {});

	let tpl = `<div class="${ns}-settings-tabs ${ns}-row">
		${Object.keys(groups).map(name => 
			`<a href="javascript:;" class="${ns}-col-auto ${ns}-settings-tab ${Player.settings.view !== name ? '' : 'active'}" data-group="${name}">${name}</a>`
		).join(' | ')}
		| <a href="https://github.com/rcc11/4chan-sounds-player/releases" class="${ns}-col-auto ${ns}-settings-tab" target="_blank">v${VERSION}</a>
	</div>`;

	Object.keys(groups).forEach(name => {
		tpl += `<div class="${ns}-settings-group ${Player.settings.view !== name ? '' : 'active'}" data-group="${name}">`;

		groups[name].forEach(function addSetting(setting) {
			// Filter settings with a null display method;
			if (setting.displayMethod === null) {
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
						${type === 'boolean'
							? `<input type="checkbox" ${attrs} ${value ? 'checked' : ''}></input>`

						: setting.displayMethod === 'textarea' || type === 'object'
							? `<textarea ${attrs}>${value}</textarea>`

						: setting.options
							? `<select ${attrs}>
								${Object.keys(setting.options).map(k => `<option value="${k}" ${value === k ? 'selected' : ''}>
									${setting.options[k]}
								</option>`).join('')}
							</select>`

						: `<input type="text" ${attrs} value="${value}"></input>`}
					</div>`;
				}
			tpl += '</div>';
		});

		tpl += '</div>';
	});

	return tpl;
}