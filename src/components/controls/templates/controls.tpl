`<div class="${ns}-col-auto">
	<div class="${ns}-media-control ${ns}-previous-button ${ns}-hover-fill" data-hide-id="previous">
		${Icons.skipStart} ${Icons.skipStartFill}
	</div>
	<div class="${ns}-media-control ${ns}-play-button ${ns}-hover-fill ${!Player.audio || Player.audio.paused ? `${ns}-play` : ''}">
		${Icons.play} ${Icons.pause} ${Icons.playFill} ${Icons.pauseFill}
	</div>
	<div class="${ns}-media-control ${ns}-next-button ${ns}-hover-fill" data-hide-id="next">
		${Icons.skipEnd} ${Icons.skipEndFill}
	</div>
</div>
<div class="${ns}-col" data-hide-id="seek-bar">
	<div class="${ns}-seek-bar ${ns}-progress-bar">
		<div class="${ns}-full-bar">
			<div class="${ns}-loaded-bar"></div>
			<div class="${ns}-current-bar"></div>
		</div>
	</div>
</div>
<div class="${ns}-col-auto" data-hide-id="time">
	<span>
		<span class="${ns}-current-time">0:00</span>
		<span class="${ns}-text-muted" data-hide-id="duration"> / <span class="${ns}-duration">0:00</span></span>
	</span>
</div>
<div class="${ns}-col-auto" data-hide-id="mute">
	<div class="${ns}-media-control ${ns}-volume-button ${ns}-hover-fill up" data-hide-id="volume-button">
		${Icons.volumeMute} ${Icons.volumeMuteFill}
		${Icons.volumeUp} ${Icons.volumeUpFill}
	</div>
	<div class="${ns}-volume-bar ${ns}-progress-bar" data-hide-id="volume-bar">
		<div class="${ns}-full-bar">
			<div class="${ns}-current-bar" style="width: ${Player.audio.volume * 100}%"></div>
		</div>
	</div>
</div>
<div class="${ns}-col-auto" data-hide-id="fullscreen">
	<div class="${ns}-media-control ${ns}-fullscreen-button">
		${Icons.fullscreen} ${Icons.fullscreenExit}
	</div>
</div>`