{
	const settingsConfig = require('config');
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
		| <a href="${Player.settings.changelog}" class="${ns}-col-auto ${ns}-settings-tab" target="_blank">v${VERSION}</a>
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
			<div class="${ns}-row ${ns}-align-center ${setting.isSubSetting ? `${ns}-sub-settings` : ''}">
				<div class="${ns}-col ${!setting.isSubSetting ? `${ns}-heading` : `${ns}-space-between`} ${desc ? `${ns}-has-description` : ''}" ${desc ? `title="${desc.replace(/"/g, '&quot;')}"` : ''}>
					${setting.title}
					<div style="display: inline-block; margin-right: .25rem">
						${(setting.actions || []).map(action => `<a href="#" class="${ns}-heading-action" data-handler="${action.handler}" data-property="${setting.property}">${action.title}</a>`).join(' ')}
					</div>
				</div>`;
				if (setting.text) {
					tpl += setting.dismissTextId
						? `<div class="${ns}-col" style="min-width: 100%">`
								+ Player.display.ifNotDismissed(
									setting.dismissTextId,
									setting.dismissRestoreText,
									`<div data-dismiss-id="${setting.dismissTextId}">`
										+ setting.text
										+ `<a href="javascript:;" class="${ns}-dismiss-link" data-dismiss="${setting.dismissTextId}" style="display:block; margin-top:.25rem">Dismiss</a>`
									+ `</div>`
								)
							+ `</div>`
						: setting.text;
				};

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
						attrs = (setting.attrs || '') + (setting.class ? ` class="${setting.class}"` : '') + ` data-property="${setting.property}"`,
						displayMethod = setting.displayMethod,
						displayMethodFunction = typeof displayMethod === 'function' ? displayMethod : _get(Player, displayMethod);

					if (setting.format) {
						value = _get(Player, setting.format)(value);
					}
					let type = typeof value;

					if (setting.split) {
						value = value.join(setting.split);
					} else if (type === 'object') {
						value = JSON.stringify(value, null, 4);
					}

					tpl += typeof displayMethodFunction === 'function'
							? displayMethodFunction(value, attrs)

						: type === 'boolean'
							? `<div class="${ns}-col"><input type="checkbox" ${attrs} ${value ? 'checked' : ''}></div>`

						: displayMethod === 'textarea' || type === 'object'
							? `<div class="${ns}-row ${ns}-col"><textarea ${attrs}>${value}</textarea></div>`

						: setting.options
							? `<div class="${ns}-col">
								<select ${attrs}>
									${Object.keys(setting.options).map(k => `<option value="${k}" ${value === k ? 'selected' : ''}>
										${setting.options[k]}
									</option>`).join('')}
								</select>
							</div>`

						: `<div class="${ns}-col"><input type="text" ${attrs} value="${value}"></div>`;
				}
			tpl += '</div>';
		});

		tpl += '</div>';
	});

	return tpl;
}