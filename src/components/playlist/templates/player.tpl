`<a class="${ns}-image-link" target="_blank">
	<div class="fullscreen-details"></div>
	<div class="image-color-overlay"></div>
	<img class="${ns}-background-image"></img>
	<img id="fcspImage" class="${ns}-image" src="data:image/svg+xml;base64,${btoa(Icons.fcSounds)}"></img>
	<video class="${ns}-video" @play='controls.sync' @pause='controls.sync' loop="true"></video>
</a>
${Player.controls.template({
	audio: Player.audio,
	audioId: Player.audio.dataset.id,
	actions: Player.controls.actions
})}
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