`<div class="${ns}-row ${ns}-saved-themes">
	<div class="${ns}-row ${ns}-align-start ${ns}-sub-settings" data-theme="Default" style="order: ${-1}">
		<div class="${ns}-col ${ns}-space-between">Default</div>
		<div class="${ns}-col">
			<a href="#" class="${ns}-heading-action ${ns}-apply-theme" data-handler="theme._apply" data-property="savedTheme">${Player.config.selectedTheme === 'Default' ? Icons.checkSquare : Icons.square}</a>
		</div>
	</div>
	${Player.config.savedThemesOrder.map((name, i) => `
		<div class="${ns}-row ${ns}-align-start ${ns}-sub-settings" data-theme="${name}" style="order: ${i}">
			<div class="${ns}-col ${ns}-space-between">${name}</div>
			<div class="${ns}-col">
				<a href="#" class="${ns}-heading-action ${ns}-apply-theme" data-theme="${name}">${Player.config.selectedTheme === name ? Icons.checkSquare : Icons.square}</a>
				<a href="#" class="${ns}-heading-action ${ns}-move-theme-up ${i === 0 ? 'disabled' : '' }" data-handler="theme._moveUp" data-property="savedTheme">${Icons.arrowUp}</a>
				<a href="#" class="${ns}-heading-action ${ns}-move-theme-down ${i === Player.config.savedThemesOrder.length - 1 ? 'disabled' : '' }" data-handler="theme._moveDown" data-property="savedTheme">${Icons.arrowDown}</a>
				<a href="#" class="${ns}-heading-action ${ns}-remove-theme" data-handler="theme._remove" data-property="savedTheme">${Icons.trash}</a>
			</div>
		</div>
	`).join('')}
</div>`
