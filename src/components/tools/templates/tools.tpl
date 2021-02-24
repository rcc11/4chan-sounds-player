`<div class="${ns}-heading">Encode / Decode URL</div>
<div class="${ns}-row">
	<div class="${ns}-col">
		<input type="text" class="${ns}-decoded-input w-100" @keyup="tools.handleDecoded" placeholder="https://">
	</div>
	<div class="${ns}-col">
		<input type="text" class="${ns}-encoded-input w-100" @keyup="tools.handleEncoded" placeholder="https%3A%2F%2F">
	</div>
</div>

<div class="${ns}-heading">
	Create Sound Image
</div>
<div class="${ns}-create-sound-form" @drop="tools.handleCreateSoundDrop:prevent:stop">
	<div class="${ns}-row" style="margin-bottom: .5rem">
		${Player.display.ifNotDismissed('createSoundDetails', 'Show Help',
		`<div class="${ns}-col" data-dismiss-id="createSoundDetails">
			Select an image and sound to combine as a sound image.
			The sound will be uploaded to the selected file host and the url will be added to the image filename.<br/>
			${Player.tools.hasFFmpeg ? 'Selecting a webm with audio as the image will split it into a video only webm to be posted and ogg audio file to be uploaded.' : ''}
			<br/>
			Multiple sound files, or a comma-separated list of sound URLs, can be given for a single image.
			If you do have multiple sounds the name will also be a considered comma-separated list.<br/>
			<a href="#" @click='display.dismiss("createSoundDetails"):prevent'>Dismiss</a>
		</div>`)}
	</div>

	<div class="${ns}-row">
		<span>Host - <a @click='settings.toggle("Hosts"):prevent' href="#">Config</a></span>
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

	<div class="${ns}-row" style="margin-top: .25rem">
		Data
	</div>
	<div class="${ns}-row">
		<div class="${ns}-col">
			<input type="text" class="${ns}-create-sound-name w-100" placeholder="Name/s">
		</div>
	</div>

	<div class="${ns}-row">
		<div class="${ns}-col">
			<div class="${ns}-file-input placeholder">
				<div class="${ns}-file-overlay w-100">
					<span class="placeholder-text">Select/Drop Image</span>
					<span class="text"></span>
					<input
						class="${ns}-create-sound-img"
						@change='tools.handleImageSelect;tools.handleFileSelect("evt.target")'
						type="file"
						accept="image/*,.webm"
					/>
				</div>
			</div>
		</div>

		<div class="${ns}-col">
			<div class="${ns}-file-input placeholder" ${Player.tools.useSoundURL ? 'display: none;' : ''}>
				<div class="${ns}-file-overlay w-100">
					<span class="placeholder-text">Select/Drop Sound/s</span>
					<span class="text"></span>
					<div class="overfile ${ns}-input-append">
						${!Player.tools.hasFFmpeg ? '' : `
							<label class="${ns}-use-video-label" style="display: none;">
								Use video
								<input type="checkbox" class="${ns}-use-video" @click="tools.handleWebmSoundChange">
							</label>`}
						<a href="#" @click='tools.toggleSoundInput("url"):prevent' title="Enter a URL of a previously uploaded file.">
							${Icons.link}
						</a>
					</div>
					<input
						type="file"
						class="${ns}-create-sound-snd"
						@change='tools.handleFileSelect("evt.target")'
						accept="audio/*,video/*"
						multiple
					/>
				</div>
				<div class="${ns}-file-list"></div>
			</div>
			<div class="${ns}-row ${ns}-align-center" style="position: relative; ${Player.tools.useSoundURL ? '' : 'display: none;'}">
				<a href="#" class="${ns}-input-append" @click='tools.toggleSoundInput("file"):prevent' title="Select a file to upload.">
					${Icons.fileEarmarkMusic}
				</a>
				<input
					type="text"
					class="${ns}-create-sound-snd-url w-100"
					placeholder="Sound URL/s"
				/>
			</div>
		</div>
	</div>

	<div class="${ns}-row" style="margin-top: .5rem">
		<div class="${ns}-col-auto">
			<button class="${ns}-create-button" @click="tools.handleCreate:prevent">Create</button>
		</div>
	</div>
</div>

<div class="${ns}-create-sound-status" ${Player.tools.createStatusText ? '' : 'style="display: none"'}>
	${Player.tools.createStatusText}
</div>`
