(data.sounds || Player.sounds).map(sound =>
	`<div class="${ns}-list-item ${ns}-row ${sound.playing ? 'playing' : ''}" data-id="${sound.id}" ${!Player.playlist.matchesSearch(sound) ? 'style="display: none"' : ''} draggable="true">
		${Player.userTemplate.build({
			template: Player.config.rowTemplate,
			sound,
			outerClass: `${ns}-col-auto`
		})}
	</div>`
).join('')