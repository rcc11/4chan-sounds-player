(data.sounds || Player.sounds).map(sound =>
	`<div class="${ns}-list-item ${ns}-row ${sound.playing ? 'playing' : ''}" data-id="${sound.id}" draggable="true">
		${Player.userTemplate.build({
			template: Player.config.rowTemplate,
			sound,
			outerClass: `${ns}-col-auto`
		})}
		<img class="${ns}-hover-image">
	</div>`
).join('')