`<div id="${ns}-container" data-view-style="${Player.config.viewStyle}" style="top: 30px; left: 0px; width: 360px; height: 360px; display: none;">
	<div class="${ns}-header ${ns}-row ${ns}-align-center">
		${Player.templates.header(data)}
	</div>

	<div class="${ns}-player ${!Player.config.hoverImages ? `${ns}-hide-hover-image` : ''}">
		${Player.templates.player(data)}
	</div>
	<div class="${ns}-settings ${ns}-panel">
		${Player.templates.settings(data)}
	</div>
	<div class="${ns}-threads ${ns}-panel">
		${Player.templates.threads(data)}
	</div>
	<div class="${ns}-tools ${ns}-panel">
		${Player.templates.tools(data)}
	</div>

	<div class="${ns}-footer ${ns}-row ${ns}-align-center">
		${Player.templates.footer(data)}
	</div>
	<input class="${ns}-add-local-file-input" type="file" style="display: none" accept="image/*,.webm" multiple>
</div>`