`<div id="${ns}-container" data-view-style="${Player.config.viewStyle}" style="top: 30px; left: 0px; width: 350px; display: none;">
	<div class="${ns}-header ${ns}-row">
		${Player.templates.header(data)}
	</div>
	<div class="${ns}-view-container">
		<div class="${ns}-player">
			${Player.templates.player(data)}
		</div>
		<div class="${ns}-settings" style="height: 400px">
			${Player.templates.settings(data)}
		</div>
		<div class="${ns}-threads" style="height: 400px">
			${Player.templates.threads(data)}
		</div>
	</div>
	<div class="${ns}-footer">
		${Player.templates.footer(data)}
	</div>
	<input class="${ns}-file-input" type="file" style="display: none" accept="image/*,.webm" multiple>
</div>`