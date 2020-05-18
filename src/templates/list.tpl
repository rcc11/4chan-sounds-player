Player.sounds.map(sound =>
	`<div class="${ns}-list-item ${ns}-row ${sound.playing ? 'playing' : ''}" data-id="${sound.id}" draggable="true">
		<div class="${ns}-col ${ns}-truncate-text">
			<span title="${sound.title}">${sound.title}</span>
		</div>
		<div class="${ns}-col-auto ${ns}-item-menu-button">
			<i class="fa fa-angle-down">▼</i>
		</div>
	</div>`
).join('')