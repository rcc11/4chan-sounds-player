`<a class="${ns}-image-link" target="_blank">
	<img class="${ns}-background-image"></img>
	<img id="fcspImage" class="${ns}-image" src="data:image/svg+xml;base64,${btoa(Icons.fcSounds)}"></img>
	<video class="${ns}-video" @play="controls.syncVideo" @pause="controls.syncVideo"></video>
</a>
<div class="${ns}-controls ${ns}-row">
	${Player.controls.template(data)}
</div>
<input
	type="input"
	class="${ns}-playlist-search"
	@keyup="playlist._handleSearch"
	style="min-width: 100%; box-sizing: border-box; ${!Player.config.showPlaylistSearch ? 'display: none;' : ''}"
	placeholder="Search"
/>
<div class="${ns}-list-container">
	${Player.playlist.listTemplate(data)}
</div>
<img class="${ns}-hover-image">`