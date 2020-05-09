`<div id="${ns}-container" data-view-style="${data.viewStyle}" style="top: 100px; left: 100px; width: 350px; display: none;">
	<div class="${ns}-title ${ns}-row" style="justify-content: between;">
		${Player.templates.header({ data })}
	</div>
	<div class="${ns}-player">
		${Player.templates.player({ data })}
	</div>
	<div class="${ns}-settings">
		${Player.templates.settings({ data })}
	</div>
</div>`