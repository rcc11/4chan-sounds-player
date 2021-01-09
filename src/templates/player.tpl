`<a class="${ns}-image-link" target="_blank">
	<img class="${ns}-image" src="data:image/svg+xml;base64,${btoa(Icons.fcSounds)}"></img>
	<video class="${ns}-video"></video>
</a>
<div class="${ns}-controls ${ns}-row">
	${Player.templates.controls(data)}
</div>
<input class="${ns}-playlist-search" type="input" placeholder="Search" style="min-width: 100%; box-sizing: border-box; ${!Player.config.showPlaylistSearch ? 'display: none;' : ''}">
<div class="${ns}-list-container">
	${Player.templates.list(data)}
</div>
<img class="${ns}-hover-image">`