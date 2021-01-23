[ 'Default' ].concat(Player.config.savedThemesOrder).map(name => `
	<div class="${ns}-row ${ns}-select-themes">
		<div class="${ns}-col"><span style="padding-left: .5rem">- ${name}</span></div>
		<div class="${ns}-col" data-name="${name}">
			<input
				type="text"
				class="${ns}-key-input"
				value="${Player.hotkeys.stringifyKey(Player.config.hotkey_bindings.switchTheme.find(def => def.themeName === name) || { key: '' })}"
				data-property="hotkey_bindings.switchTheme"
			/>
		</div>
	</div>
`).join('')
