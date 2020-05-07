Player.sounds.map(sound =>
	`<li class="${ns}-list-item ${sound.playing ? 'playing' : ''}" data-id="${sound.id}">
		${sound.title}
	</li>`
).join('')