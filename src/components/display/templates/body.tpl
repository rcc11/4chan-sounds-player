`<div id="${ns}-container" data-view-style="${Player.config.viewStyle}" @drop='playlist.addFromDrop:prevent:stop' style="top: 30px; left: 0px; width: 360px; height: 360px; display: none;">
	<div class="${ns}-header ${ns}-row ${ns}-align-center ${ns}-hover-trigger" @pointdragstart="position.initMove" @pointdrag="position.doMove:unbound" @pointdragend="position.stopMove">
		${Player.header.template(data)}
	</div>

	<div class="${ns}-player ${!Player.config.hoverImages ? `${ns}-hide-hover-image` : ''}" @fullscreenchange="display._handleFullScreenChange">
		${Player.playlist.template(data)}
	</div>
	<div class="${ns}-settings ${ns}-panel">
		${Player.settings.template(data)}
	</div>
	<div class="${ns}-threads ${ns}-panel">
		${Player.threads.template(data)}
	</div>
	<div class="${ns}-tools ${ns}-panel">
		${Player.tools.template(data)}
	</div>

	<div class="${ns}-footer ${ns}-row ${ns}-align-center ${ns}-hover-trigger">
		${Player.footer.template(data)}
	</div>
	<input class="${ns}-add-local-file-input" type="file" @change='playlist.addFromFiles("evt.currentTarget.files"):prevent' style="display: none" accept="image/*,.webm" multiple>
</div>`