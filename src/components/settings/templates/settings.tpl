`<div class="${ns}-settings-tabs ${ns}-row">
	<div class="${ns}-settings-tab-group ${ns}-col-auto">
		<a href="#" class="${ns}-settings-reset-all ${ns}-settings-tab"
			@click.prevent='settings.load({},{"applyDefault":true,"ignore":["viewStyle"]})'
			title="Reset all settings to their default values.">
			${Icons.reboot}
		</a>
		<a href="#" class="${ns}-settings-export ${ns}-settings-tab"
			@click.prevent="settings.export"
			title="Export. Shift click to export all settings. Otherwise only modified settings are included in the export.">
			${Icons.boxArrowRight}
		</a>
		<a href="#" class="${ns}-settings-import ${ns}-settings-tab"
			@click.prevent="settings.import"
			title="Import. Settings not included in the import will be left as their current value.">
			${Icons.boxArrowInLeft}
		</a>
		<a href="${Player.settings.changelog}" class="${ns}-settings-tab" target="_blank" title="v${VERSION}">
			${Icons.github}
		</a>
	</div>
	<div class="${ns}-settings-tab-group ${ns}-col-auto">
		${Object.keys(Player.settings.groups).map(name => 
			`<a href="#" class="${ns}-settings-tab ${Player.settings.view !== name ? '' : 'active'}"
				@click.prevent='settings.showGroup("${name}")'
				data-group="${name}">
				${name}
			</a>`
		).join(' | ')}
	</div>
</div>
${Object.entries(Player.settings.groups).map(([ name, settings ]) => `
	<div class="${ns}-settings-group ${Player.settings.view !== name ? '' : 'active'}" data-group="${name}">
		${settings.map(Player.settings.settingTemplate).join('')}
	</div>
`).join('')}`