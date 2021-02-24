`<div class="${ns}-row ${ns}-saved-themes">
	<div class="${ns}-row ${ns}-align-start ${ns}-sub-settings" data-theme="Default" style="order: ${-1}">
		<div class="${ns}-col ${ns}-space-between">Default</div>
		<div class="${ns}-col">
			<a href="#" class="${ns}-heading-action" @click='theme.switch("Default"):prevent' data-property="savedTheme">${Player.config.selectedTheme === 'Default' ? Icons.checkSquare : Icons.square}</a>
		</div>
	</div>
	${Player.config.savedThemesOrder.map((name, i) => `
		<div class="${ns}-row ${ns}-align-start ${ns}-sub-settings" data-theme="${name}" style="order: ${i}">
			<div class="${ns}-col ${ns}-space-between">${name}</div>
			<div class="${ns}-col">
				<a href="#" class="${ns}-heading-action" @click='theme.switch("${name}"):prevent'>${Player.config.selectedTheme === name ? Icons.checkSquare : Icons.square}</a>
				<a href="#" class="${ns}-heading-action ${ns}-move-theme-up ${i === 0 ? 'disabled' : '' }" @click="theme.moveUp:prevent" >${Icons.arrowUp}</a>
				<a href="#" class="${ns}-heading-action ${ns}-move-theme-down ${i === Player.config.savedThemesOrder.length - 1 ? 'disabled' : '' }" @click="theme.moveDown:prevent">${Icons.arrowDown}</a>
				<a href="#" class="${ns}-heading-action ${ns}-remove-theme" @click="theme.remove:prevent">${Icons.trash}</a>
			</div>
		</div>
	`).join('')}
</div>`
