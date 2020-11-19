`<div class="${ns}-menu dialog" id="menu" tabindex="0" data-type="post" style="position: fixed;">
	${['playlist', 'image' ].includes(Player.config.viewStyle) ? '' : `<a class="${ns}-player-button entry" href="javascript:;">${Icons.musicNoteList} Player</a>`}
	${Player.config.viewStyle === 'settings' ? '' : `<a class="${ns}-config-button entry" href="javascript:;">${Icons.gear} Settings</a>`}
	${Player.config.viewStyle === 'threads' ? ''  : `<a class="${ns}-threads-button entry" href="javascript:;">${Icons.search} Threads</a>`}
	${Player.config.viewStyle === 'tools' ? ''    : `<a class="${ns}-tools-button entry" href="javascript:;">${Icons.tools} Tools</a>`}
</div>`
