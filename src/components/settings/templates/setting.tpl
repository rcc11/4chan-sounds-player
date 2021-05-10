data.displayMethod === null ? '' : `
<div class="${ns}-row ${ns}-align-start ${ns}-setting ${data.isSubSetting ? `${ns}-sub-settings` : ''}" data-property="${data.property}">
	<div class="${ns}-col ${ns}-heading">
		<span>
			${data.title}
			${data.description ? `<i class="${ns}-info-circle ${ns}-popover" data-content="${_.escAttr(data.description)}">${Icons.infoCircle}</i>` : ''}
		</span>
		${!data.actions || !data.actions.length ? '' : `<div style="display: inline-block; margin: 0 .25rem">
			${(data.actions || []).map(action => `
				<a href="#" class="${ns}-heading-action" @click='${action.handler}'>${action.title}</a>
			`).join(' ')}
		</div>`}
	</div>

	${data.dismissTextId
		? `<div class="${ns}-col" style="min-width: 100%">
			${Player.display.ifNotDismissed(
				data.dismissTextId,
				data.dismissRestoreText,
				`<div data-dismiss-id="${data.dismissTextId}">
					${data.text}
					<a href="#" @click='display.dismiss("${data.dismissTextId}"):prevent' style="display:block; margin-top:.25rem">
						Dismiss
					</a>
				</div>`
			)}
		</div>`
	: data.text
		? data.text
	: ''}

	${(() => {
		// Recusively call for sub settings.
		if (data.settings) {
			return data.settings.map(subSetting => Player.settings.settingTemplate({
				...data,
				actions: null,
				settings: null,
				description: null,
				...subSetting,
				isSubSetting: true
			})).join('')
		}

		value = _.get(Player.config, data.property, data.default);
		attrs = (typeof data.attrs === 'function' ? data.attrs() : data.attrs || '')
			+ (data.class ? ` class="${data.class}"` : '')
			+ ` data-property="${data.property}"`;

		if (data.format) {
			value = Player.getHandler(data.format)(value);
		}
		let type = typeof value;
		if (type === 'object') {
			value = JSON.stringify(value, null, 4)
		}

		inputTemplate = typeof data.displayMethod === 'function' && data.displayMethod
			|| _.get(Player, data.displayMethod)
			|| data.displayMethod && Player.settings.inputTemplates[data.displayMethod]
			|| type === 'boolean' && Player.settings.inputTemplates.checkbox
			|| type === 'object' && Player.settings.inputTemplates.textarea
			|| data.options && Player.settings.inputTemplates.select
			|| Player.settings.inputTemplates.input;
		
		return inputTemplate({ value, attrs, setting: data });
	})()}
</div>`