`<div class="${ns}-menu ${ns}-dialog dialog" id="menu" tabindex="0" data-type="post" style="position: fixed;">
	${[ 'Default' ].concat(Player.config.savedThemesOrder).map(name => `
		<a class="${ns}-apply-theme ${ns}-row nowrap ${ns}-align-center ${ns}-player-button entry" href="#" data-theme="${name}">
			<span ${Player.config.selectedTheme === name ? 'style="font-weight: 700;"' : ''}>${name}</span>
		</a>
	`).join('')}
</div>`
