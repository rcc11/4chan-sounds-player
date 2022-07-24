`<div class="${ns}-menu ${ns}-dialog dialog" id="menu" tabindex="0" data-type="post" style="position: fixed;">
	${[ 'Default' ].concat(Player.config.savedThemesOrder).map(name => `
		<a class="${ns}-row nowrap ${ns}-align-center entry" href="#" @click.prevent='theme.switch("${name}");playlist.restore'>
			<span ${Player.config.selectedTheme === name ? 'style="font-weight: 700;"' : ''}>${name}</span>
		</a>
	`).join('')}
</div>`
