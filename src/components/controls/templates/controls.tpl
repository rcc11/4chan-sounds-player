`<div class="${ns}-controls ${ns}-row ${data.inline ? `${ns}-inline-controls` : '' }" data-audio="${data.audioId}">
	<div class="${ns}-col-auto">
		${data.inline && !data.multiple ? '' : `
			<div class="${ns}-media-control ${ns}-previous-button ${ns}-hover-fill ${data.inline && Player.config.expandedRepeat !== 'all' ? 'disabled' : ''}" @click.disabled='${data.actions.previous}' data-hide-id="previous">
				${Icons.skipStart} ${Icons.skipStartFill}
			</div>
		`}
		<div class="${ns}-media-control ${ns}-play-button ${ns}-hover-fill ${!data.audio || data.audio.paused ? `${ns}-play` : ''}" @click='${data.actions.playPause}' data-audio="${data.audioId}">
			${Icons.play} ${Icons.pause} ${Icons.playFill} ${Icons.pauseFill}
		</div>
		${data.inline && !data.multiple ? '' : `
			<div class="${ns}-media-control ${ns}-next-button ${ns}-hover-fill" @click.disabled='${data.actions.next}' data-hide-id="next">
				${Icons.skipEnd} ${Icons.skipEndFill}
			</div>
		`}
	</div>
	<div class="${ns}-col" data-hide-id="seek-bar">
		<div class="${ns}-seek-bar ${ns}-progress-bar" @pointdrag.prevent='${data.actions.seek}'>
			<div class="${ns}-full-bar">
				<div class="${ns}-loaded-bar"></div>
				<div class="${ns}-current-bar"></div>
			</div>
		</div>
	</div>
	<div class="${ns}-col-auto" data-hide-id="time">
		<span>
			<span class="${ns}-current-time" data-audio="${data.audioId}">0:00</span>
			<span class="${ns}-text-muted" data-hide-id="duration">
				/ <span class="${ns}-duration" data-audio="${data.audioId}">0:00</span>
			</span>
		</span>
	</div>
	<div class="${ns}-col-auto" data-hide-id="volume">
		<div class="${ns}-media-control ${ns}-volume-button ${ns}-hover-fill up" @click='${data.actions.mute}' data-hide-id="volume-button" data-audio="${data.audioId}">
			${Icons.volumeMute} ${Icons.volumeMuteFill}
			${Icons.volumeUp} ${Icons.volumeUpFill}
		</div>
		<div class="${ns}-volume-bar ${ns}-progress-bar" @pointdrag.prevent='${data.actions.volume}' data-hide-id="volume-bar">
			<div class="${ns}-full-bar">
				<div class="${ns}-current-bar" style="width: ${Player.audio.volume * 100}%"></div>
			</div>
		</div>
	</div>
	${data.inline ? '' : `
		<div class="${ns}-col-auto" data-hide-id="fullscreen">
			<div class="${ns}-media-control ${ns}-fullscreen-button" @click='${data.actions.fullscreen}'>
				${Icons.fullscreen} ${Icons.fullscreenExit}
			</div>
		</div>
	`}
</div>`