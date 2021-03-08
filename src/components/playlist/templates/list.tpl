(data.sounds || Player.sounds).map(sound =>
	`<div
		class="${ns}-list-item ${ns}-row ${sound.playing ? 'playing' : ''} ${ns}-align-center"
		@click="playlist.handleSelect"
		@dragstart="playlist.handleDragStart:passive"
		@dragenter="playlist.handleDragEnter:prevent"
		@dragend="playlist.handleDragEnd:prevent"
		@dragover=":prevent"
		@drop=":prevent"
		@contextmenu='playlist.handleItemMenu("evt", "${sound.id}"):prevent:stop'
		@mouseenter="playlist.updateHoverImage"
		@mouseleave="playlist.removeHoverImage"
		@mousemove="playlist.positionHoverImage:passive"
		data-id="${sound.id}"
		${!Player.playlist.matchesSearch(sound) ? 'style="display: none"' : ''}
		draggable="true"
	>
		${Player.userTemplate.build({
			template: Player.config.rowTemplate,
			location: 'item-' + sound.id,
			sound,
			outerClass: `${ns}-col-auto`
		})}
	</div>`
).join('')