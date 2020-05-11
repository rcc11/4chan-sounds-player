Player.sounds.map(sound =>
	`<li class="${ns}-list-item ${sound.playing ? 'playing' : ''}" data-id="${sound.id}">
		<i class="${ns}-item-menu-button fa fa-angle-down">▼</i>
		${sound.title}
	</li>`
).join('')