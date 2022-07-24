`<div class="${ns}-heading lined">
	Create Sound Image
</div>
<div class="m-2">
	<div class="${ns}-create-sound-form" @drop.stop.prevent="tools.handleCreateSoundDrop">
		<div class="${ns}-row mb-4">
			${Player.display.ifNotDismissed('createSoundDetails', 'Show Help',
			`<div class="${ns}-col" data-dismiss-id="createSoundDetails">
				Select an image and sound to combine as a sound image.
				The sound will be uploaded to the selected file host and the url will be added to the image filename.<br/>
				<br/>
				Multiple sound files, or a comma-separated list of sound URLs, can be given for a single image.
				If you do have multiple sounds the name will also be a considered comma-separated list.<br/>
				<a href="#" @click.prevent='display.dismiss("createSoundDetails")'>Dismiss</a>
			</div>`)}
		</div>

		<div class="${ns}-row">
			<span>Host - <a @click.prevent='settings.toggle("Hosts")' href="#">Config</a></span>
		</div>
		<div class="${ns}-row">
			<div class="${ns}-col ${ns}-create-hosts-container">
				${Player.tools.createHostsTemplate()}
			</div>
		</div>

		<div class="${ns}-row mt-2">
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
							@change='tools.handleImageSelect;tools.handleFileSelect($event.target)'
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
							<a href="#" @click.prevent='tools.toggleSoundInput("url")' title="Enter a URL of a previously uploaded file.">
								${Icons.link}
							</a>
						</div>
						<input
							type="file"
							class="${ns}-create-sound-snd"
							@change='tools.handleFileSelect($event.target)'
							accept="audio/*,video/*"
							multiple
						/>
					</div>
					<div class="${ns}-file-list"></div>
				</div>
				<div class="${ns}-row ${ns}-align-center" style="position: relative; ${Player.tools.useSoundURL ? '' : 'display: none;'}">
					<a href="#" class="${ns}-input-append" @click.prevent='tools.toggleSoundInput("file")' title="Select a file to upload.">
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

		<div class="${ns}-row mt-4">
			<div class="${ns}-col-auto">
				<button class="${ns}-create-button" @click.prevent="tools.handleCreate">Create</button>
			</div>
		</div>
	</div>

	<div class="${ns}-create-sound-status" ${Player.tools._createdImage ? '' : 'style="display: none"'}>
		${Player.tools._createdImage ? Player.tools.createCompleteTemplate() : ''}
	</div>
</div>`