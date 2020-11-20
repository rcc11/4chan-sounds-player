`<div class="${ns}-col-auto">
	<div class="${ns}-media-control ${ns}-previous-button ${ns}-hover-fill">
		${Icons.skipStart} ${Icons.skipStartFill}
	</div>
	<div class="${ns}-media-control ${ns}-play-button ${ns}-hover-fill ${!Player.audio || Player.audio.paused ? `${ns}-play` : ''}">
		${Icons.play} ${Icons.pause} ${Icons.playFill} ${Icons.pauseFill}
	</div>
	<div class="${ns}-media-control ${ns}-next-button ${ns}-hover-fill">
		${Icons.skipEnd} ${Icons.skipEndFill}
	</div>
</div>
<div class="${ns}-col">
	<div class="${ns}-seek-bar ${ns}-progress-bar">
		<div class="${ns}-full-bar">
			<div class="${ns}-loaded-bar"></div>
			<div class="${ns}-current-bar"></div>
		</div>
	</div>
</div>
<div class="${ns}-col-auto">
	<span>
		<span class="${ns}-current-time">0:00</span>
		<span class="${ns}-text-muted"> / <span class="${ns}-duration">0:00</span></span>
	</span>
</div>
<div class="${ns}-col-auto">
	<div class="${ns}-volume-bar ${ns}-progress-bar">
		<div class="${ns}-full-bar">
			<div class="${ns}-current-bar" style="width: ${Player.audio.volume * 100}%"></div>
		</div>
	</div>
</div>
<div class="${ns}-col-auto">
	<div class="${ns}-media-control ${ns}-fullscreen-button">
		${Icons.fullscreen} ${Icons.fullscreenExit}
	</div>
</div>`