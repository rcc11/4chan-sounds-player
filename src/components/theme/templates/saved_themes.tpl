`<div class="${ns}-row ${ns}-saved-themes">
	<div class="${ns}-row ${ns}-align-start ${ns}-sub-settings" data-theme="Default" style="order: ${-1}">
		<div class="${ns}-col ${ns}-space-between">Default</div>
		<div class="${ns}-col">
			<a href="#" class="${ns}-heading-action" @click.prevent='theme.switch("Default")' data-property="savedTheme">${Player.config.selectedTheme === 'Default' ? Icons.checkSquare : Icons.square}</a>
		</div>
	</div>
	${Player.config.savedThemesOrder.map((name, i) => `
		<div class="${ns}-row ${ns}-align-start ${ns}-sub-settings" data-theme="${name}" style="order: ${i}">
			<div class="${ns}-col ${ns}-space-between">${name}</div>
			<div class="${ns}-col">
				<a href="#" class="${ns}-heading-action" @click.prevent='theme.switch("${name}")'>${Player.config.selectedTheme === name ? Icons.checkSquare : Icons.square}</a>
				<a href="#" class="${ns}-heading-action ${ns}-move-theme-up ${i === 0 ? 'disabled' : '' }" @click.prevent="theme.moveUp" >${Icons.arrowUp}</a>
				<a href="#" class="${ns}-heading-action ${ns}-move-theme-down ${i === Player.config.savedThemesOrder.length - 1 ? 'disabled' : '' }" @click.prevent="theme.moveDown">${Icons.arrowDown}</a>
				<a href="#" class="${ns}-heading-action ${ns}-remove-theme" @click.prevent="theme.remove">${Icons.trash}</a>
			</div>
		</div>
	`).join('')}
</div>`
