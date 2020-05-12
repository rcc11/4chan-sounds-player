`<div id="${ns}-container" data-view-style="${Player.config.viewStyle}" style="top: 0px; left: 0px; width: 350px; display: none;">
	<div class="${ns}-title ${ns}-row" style="justify-content: between;">
		${Player.templates.header(data)}
	</div>
	<div class="${ns}-view-container">
		<div class="${ns}-player">
			${Player.templates.player(data)}
		</div>
		<div class="${ns}-settings" style="height: 400px">
			${Player.templates.settings(data)}
		</div>
	</div>
	<div class="${ns}-footer">
		<span class="${ns}-count">0</span> sounds
		<div class="${ns}-expander"></div>
	</div>
</div>`