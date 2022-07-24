(data.sounds || Player.sounds).map(sound => !Player.playlist.matchesSearch(sound) ? '' : `
	<div
		class="${ns}-list-item ${ns}-row ${sound.playing ? 'playing' : ''} ${ns}-align-center ${ns}-hover-trigger"
		@click="playlist.handleSelect"
		@dragstart.passive="playlist.handleDragStart"
		@dragenter.prevent="playlist.handleDragEnter"
		@dragend.prevent="playlist.handleDragEnd"
		@dragover.prevent=""
		@drop.prevent=""
		@contextmenu.stop.prevent='playlist.handleItemMenu($event, "${sound.id}")'
		@mouseenter="playlist.updateHoverImage"
		@mouseleave="playlist.removeHoverImage"
		@mousemove.passive="playlist.positionHoverImage"
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