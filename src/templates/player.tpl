`<div class="${ns}-media">
	<a class="${ns}-image-link" target="_blank">
		<img class="${ns}-image" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUyIiBoZWlnaHQ9IjI1NyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Zz48dGV4dCBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zdHlsZT0iaXRhbGljIiBmb250LWZhbWlseT0iSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNTAiIHk9IjE5NyIgZmlsbC1vcGFjaXR5PSIwLjA1IiBmaWxsPSIjMDAwMDAwIj40c3A8L3RleHQ+PC9nPjwvc3ZnPg=="></img>
		<video class="${ns}-video"></video>
	</a>
	<div class="${ns}-controls ${ns}-row">
		${Player.templates.controls(data)}
	</div>
</div>
<input class="${ns}-playlist-search" type="input" placeholder="Search" style="min-width: 100%; box-sizing: border-box; ${!Player.config.showPlaylistSearch ? 'display: none;' : ''}">
<div class="${ns}-list-container style="height: 100px">
	${Player.templates.list(data)}
</div>
<img class="${ns}-hover-image">`