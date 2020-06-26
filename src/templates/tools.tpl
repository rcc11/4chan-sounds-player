`<div class="${ns}-heading">Encode / Decode URL</div>
<div class="${ns}-row">
	<input type="text" class="${ns}-decoded-input ${ns}-col" placeholder="https://">
	<input type="text" class="${ns}-encoded-input ${ns}-col" placeholder="https%3A%2F%2F">
</div>

<div class="${ns}-heading">
	Create Sound Image
</div>
<div class="${ns}-create-sound-form">
	<div class="${ns}-row" style="margin-bottom: .5rem">
		${Player.display.ifNotDismissed('createSoundDetails', 'Show Help',
		`<div class="${ns}-col" data-dismiss-id="createSoundDetails">
			Select an image and sound to combine as a sound image.
			The sound will be uploaded to the selected file host and the url will be added to the image filename.
			${Player.tools.hasFFmpeg
				? 'Selecting a webm with audio as the image will split it into a video only webm to be posted and ogg audio file to be uploaded.'
				: 'For a webm with audio first split the webm into a separate video and audio file and select them both.'
			}
			<a href="javascript:;" class="${ns}-dismiss-link" data-dismiss="createSoundDetails">Dismiss</a>
		</div>`)}
	</div>
	<div class="${ns}-row">
		Host
	</div>
	<div class="${ns}-row">
		<div class="${ns}-col">
			<select class="${ns}-create-sound-host">
				${Object.keys(Player.config.uploadHosts).map((hostId, i) =>
					Player.config.uploadHosts[hostId] && !Player.config.uploadHosts[hostId].invalid
						? `<option value="${hostId}" ${Player.config.defaultUploadHost === hostId ? 'selected' : ''}>${hostId}</option>`
						: ''
				).join('')}
			</select>
		</div>
	</div>
	<div class="${ns}-row">
		Data
	</div>
	<div class="${ns}-row">
		<div class="${ns}-col">
			<div class="${ns}-file-overlay placeholder">
				<span class="placeholder">Select/Drop Image</span>
				<span class="text"></span>
				<input class="${ns}-create-sound-img" type="file" accept="image/*,.webm">
			</div>
		</div>
		<div class="${ns}-col">
			<div class="${ns}-file-overlay placeholder">
				<span class="placeholder">Select/Drop Sound</span>
				<span class="text"></span>
				${!Player.tools.hasFFmpeg && `<label class="${ns}-use-video-label overfile" style="display: none;">Copy video<input type="checkbox" class="${ns}-use-video"></label>` || ''}
				<input class="${ns}-create-sound-snd" type="file" accept="audio/*,video/*">
			</div>
		</div>
	</div>
	<div class="${ns}-row">
		<div class="${ns}-col">
			<input type="text" class="${ns}-create-sound-name" placeholder="Name">
		</div>
	</div>
	<div class="${ns}-row" style="margin-top: .5rem">
		<div class="${ns}-col-auto" style="margin-right: .5rem">
			<button class="${ns}-create-button">Create</button>
		</div>
	</div>
</div>
<div class="${ns}-create-sound-status" ${Player.tools.createStatusText ? '' : 'style="display: none"'}>
	${Player.tools.createStatusText}
</div>`
