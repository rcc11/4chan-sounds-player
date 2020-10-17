`<div id="${ns}-container" data-view-style="${Player.config.viewStyle}" style="top: 30px; left: 0px; width: 360px; display: none;">
	<div class="${ns}-header ${ns}-row">
		${Player.templates.header(data)}
	</div>
	<div class="${ns}-view-container">
		<div class="${ns}-player ${!Player.config.hoverImages ? `${ns}-hide-hover-image` : ''}">
			${Player.templates.player(data)}
		</div>
		<div class="${ns}-settings ${ns}-panel" style="height: 400px">
			${Player.templates.settings(data)}
		</div>
		<div class="${ns}-threads ${ns}-panel" style="height: 400px">
			${Player.templates.threads(data)}
		</div>
		<div class="${ns}-tools ${ns}-panel" style="height: 400px">
			${Player.templates.tools(data)}
		</div>
	</div>
	<div class="${ns}-footer">
		${Player.templates.footer(data)}
	</div>
	<input class="${ns}-add-local-file-input" type="file" style="display: none" accept="image/*,.webm" multiple>
</div>`