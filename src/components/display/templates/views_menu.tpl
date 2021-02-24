`<div class="${ns}-menu ${ns}-dialog dialog" id="menu" tabindex="0" data-type="post" style="position: fixed;">
	${[ 'playlist', 'image' ].includes(Player.config.viewStyle) ? ''
		: `<a class="${ns}-row nowrap ${ns}-align-center entry" href="#" @click="playlist.restore:prevent"><div class="${ns}-col">Player</div><div class="${ns}-col-auto">${Icons.musicNoteList}</div></a>`}
	${Player.config.viewStyle === 'settings' ? ''
		: `<a class="${ns}-row nowrap ${ns}-align-center entry" href="#" @click="settings.toggle():prevent"><div class="${ns}-col">Settings</div><div class="${ns}-col-auto">${Icons.gear}</div></span></a>`}
	${Player.config.viewStyle === 'threads' ? ''
		: `<a class="${ns}-row nowrap ${ns}-align-center entry" href="#" @click="threads.toggle:prevent"><div class="${ns}-col">Threads</div><div class="${ns}-col-auto">${Icons.search}</div></span></a>`}
	${Player.config.viewStyle === 'tools' ? ''
		: `<a class="${ns}-row nowrap ${ns}-align-center entry" href="#" @click="tools.toggle:prevent"><div class="${ns}-col">Tools</div><div class="${ns}-col-auto">${Icons.tools}</div></span></a>`}
</div>`
