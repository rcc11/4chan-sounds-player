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
		<div class="${ns}-settings-tab-group ${ns}-col-auto">
			<a href="#" class="${ns}-settings-reset-all ${ns}-settings-tab" title="Reset all settings to their default values." title="Reset all to default.">${Icons.reboot}</a>
			<a href="#" class="${ns}-settings-export ${ns}-settings-tab" title="Export. Shift click to export all settings. Otherwise only modified settings are included in the export.">${Icons.boxArrowRight}</a>
			<a href="#" class="${ns}-settings-import ${ns}-settings-tab" title="Import. Settings not included in the import will be left as their current value.">${Icons.boxArrowInLeft}</a>
			<a href="${Player.settings.changelog}" class="${ns}-settings-tab" target="_blank" title="v${VERSION}">${Icons.github}</a>
		</div>
		<div class="${ns}-settings-tab-group ${ns}-col-auto">
			${Object.keys(groups).map(name => 
				`<a href="javascript:;" class="${ns}-settings-tab ${Player.settings.view !== name ? '' : 'active'}" data-group="${name}">${name}</a>`
			).join(' | ')}
		</div>
	</div>`;

	Object.keys(groups).forEach(name => {
		tpl += `<div class="${ns}-settings-group ${Player.settings.view !== name ? '' : 'active'}" data-group="${name}">`;

		groups[name].forEach(function addSetting(setting) {
			// Filter settings with a null display method;
			if (setting.displayMethod === null) {
				return;
			}

			tpl += `
			<div class="${ns}-row ${ns}-align-${setting.isSubSetting ? 'start' : 'center'} ${setting.isSubSetting ? `${ns}-sub-settings` : ''}">
				<div class="${ns}-col ${!setting.isSubSetting ? `${ns}-heading` : `${ns}-space-between`}">
					<span>
						${setting.title}
						${setting.description ? `<i class="${ns}-info-circle" data-content="${setting.description}">${Icons.infoCircle}</i>` : ''}
					</span>
					${!setting.actions || !setting.actions.length ? '' : `<div style="display: inline-block; margin: 0 .25rem">
						${(setting.actions || []).map(action => `<a href="#" class="${ns}-heading-action" data-handler="${action.handler}" data-property="${setting.property}">${action.title}</a>`).join(' ')}
					</div>`}
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

					let value = _.get(Player.config, setting.property, setting.default),
						attrs = (setting.attrs || '') + (setting.class ? ` class="${setting.class}"` : '') + ` data-property="${setting.property}"`,
						displayMethod = setting.displayMethod,
						displayMethodFunction = typeof displayMethod === 'function' ? displayMethod : _.get(Player, displayMethod);

					if (setting.format) {
						value = Player.getHandler(setting.format)(value);
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