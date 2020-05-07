`<div id="${ns}-container" class="${ns}-${data.playlist ? 'playlist' : 'extended'}-view" style="top: 100px; left: 100px; width: 350px; display: none;">
	<div class="${ns}-title" style="display: flex; flex-wrap: wrap; justify-content: between;">
		${Player.templates.header({ data })}
	</div>
	<div class="${ns}-player">
		<a class="${ns}-image-link" style="height: 128px" target="_blank">
			<img class="${ns}-image"></img>
			<video class="${ns}-video"></video>
		</a>
		<div class="${ns}-controls">
			<div class="${ns}-play-pause %{ns}-${!Player.audio || Player.audio.paused ? 'play' : 'pause'}>"></div>
			<div class="${ns}-seekbar"></div>
			<div class="${ns}-duration"></div>
			<div class="${ns}-volume"></div>
		</div>
		<audio class="${ns}-audio" controls="true"></audio>
		<div class="${ns}-list-container" style="height: 100px">
			<ul class="${ns}-list">
				${Player.templates.list({ data })}
			</ul>
		</div>
		<div class="${ns}-footer">
			<span class="${ns}-count">0</span> sounds
			<div class="${ns}-expander"></div>
		</div>
	</div>
	<div class="${ns}-settings">
		${Player.templates.settings({ data })}
	</div>
</div>`