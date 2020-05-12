`<div class="${ns}-col-auto" style="margin-left: 0.25rem;">`
	+ Object.keys(Player.header.options).map(key => {
		let option = Player.header.options[key][Player.config[key]] || Player.header.options[key][Object.keys(Player.header.options[key])[0]];
		return `<a class="${ns}-${key}-button fa ${option.class}" title="${option.title}" href="javascript;">
			${option.text}
		</a>`
	}).join('') + `
</div><div class="${ns}-col" style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">
	${Player.playing ? Player.playing.title : '4chan Sounds'}
</div>
<div class=".${ns}-col-auto" style="margin-right: 0.25rem;">
	<a class="${ns}-config-button fa fa-wrench" title="Settings" href="javascript;">Settings</a>
	<a class="${ns}-close-button fa fa-times" href="javascript;">X</a>
</div>`