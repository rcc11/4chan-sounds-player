`<div class="${ns}-menu dialog" id="menu" tabindex="0" data-type="post" style="position: fixed;">
	${Player.config.viewStyle === 'playlist' ? '' : `<a class="${ns}-config-button entry" href="javascript:;">Player</a>`}
	${Player.config.viewStyle === 'settings' ? '' : `<a class="${ns}-config-button entry" href="javascript:;">Settings</a>`}
	${Player.config.viewStyle === 'threads' ? ''  : `<a class="${ns}-threads-button entry" href="javascript:;">Threads</a>`}
	${Player.config.viewStyle === 'tools' ? ''    : `<a class="${ns}-tools-button entry" href="javascript:;">Tools</a>`}
</div>`
