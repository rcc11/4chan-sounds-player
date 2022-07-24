(data.sounds || Player.sounds).map(sound => !Player.playlist.matchesSearch(sound) ? '' : `
	<div
		class="${ns}-list-item ${ns}-row ${sound.playing ? 'playing' : ''} ${ns}-align-center ${ns}-hover-trigger"
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
		${!Player.playlist.matchesSearch(sound) ? '__style="display: none"' : ''}
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