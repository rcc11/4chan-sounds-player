`<div class="${ns}-theme-save-options ${ns}-dialog fields-collapsed dialog" data-allow-click="true" style="top: 0px; left: 0px;">
	<div class="${ns}-row ${ns}-align-center">
		<div class="${ns}-col">
			<input type="text" class="${ns}-save-theme-name" @keyup="theme.toggleSaveButtonText:prevent" placeholder="Name">
		</div>
		<div class="${ns}-col">
			<a class="${ns}-save-theme" @click="theme.save:prevent" href="#">Create</a>
		</div>
	</div>
	<a class="${ns}-row" @click="theme.toggleSaveFields:prevent" href="#" style="margin: .25rem 0">
		<span style="margin-right: .25rem">Included Settings</span>
		${Icons.chevronDown}
		${Icons.chevronUp}
	</a>
	${(function saveFieldOptions(settings, parent) {
		return settings.map(s => {
			const id = s.property && `theme_field-${s.property.replace(/\./g, '_')}`;
			return s.settings
				? saveFieldOptions(s.settings, s)
				: { ...(parent || {}), ...s }.allowInTheme || s.themeField
					? `<div><input type="checkbox" id="${id}" value="${s.property}" ${s.themeField ? 'checked' : ''}><label for="${id}">${parent ? `${parent.themeFieldTitle || parent.title}: ` : ''}${s.title}</label></div>`
					: '';
		}).join('');
	})(data.settingsConfig)}
</div>`