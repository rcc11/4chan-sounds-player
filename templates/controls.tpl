`<div class="${ns}-col-auto ${ns}-row" href="javascript;">
	<div class="${ns}-media-control ${ns}-previous-button">
		<div class="${ns}-previous-button-display"></div>
	</div>
	<div class="${ns}-media-control ${ns}-play-button">
		<div class="${ns}-play-button-display ${!Player.audio || Player.audio.paused ? `${ns}-play` : ''}"></div>
	</div>
	<div class="${ns}-media-control ${ns}-previous-button">
		<div class="${ns}-next-button-display"></div>
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
	<span class="${ns}-current-time">0:00</span><span class="${ns}-duration"> / 0:00</span>
</div>
<div class="${ns}-col-auto">
	<div class="${ns}-volume-bar ${ns}-progress-bar">
		<div class="${ns}-full-bar">
			<div class="${ns}-current-bar" style="width: ${Player.audio.volume * 100}%"></div>
		</div>
	</div>
</div>`