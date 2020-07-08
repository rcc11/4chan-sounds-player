`<div class="${ns}-heading">Encode / Decode URL</div>
<div class="${ns}-row">
	<div class="${ns}-col"><input type="text" class="${ns}-decoded-input" placeholder="https://"></div>
<div class="${ns}-col"><input type="text" class="${ns}-encoded-input" placeholder="https%3A%2F%2F"></div>
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
			If you have an account for a host that you would like to use then make the required changes in the <a class="${ns}-host-setting-link" href="#">host config</a>.
			That typically means providing a user token in the data or headers.<br>
			${Player.tools.hasFFmpeg
				? 'Selecting a webm with audio as the image will split it into a video only webm to be posted and ogg audio file to be uploaded.'
				: 'For a webm with audio first split the webm into a separate video and audio file and select them both.'
			}
			<br>
			Multiple sound files, or a comma-separated list of sound URLs, can be given for a single image.
			If you do have multiple sounds the name will also be a considered comma-separated list.<br>
			<a href="javascript:;" class="${ns}-dismiss-link" data-dismiss="createSoundDetails">Dismiss</a>
		</div>`)}
	</div>
	<div class="${ns}-row">
		<div class="${ns}-col">
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
		</div>
		<div class="${ns}-col">
			<div class="${ns}-row">
				Options
			</div>
			<div class="${ns}-row">
				<div class="${ns}-col ${ns}-align-center">
					<label title="Remove the protocol from sound URLs to save space">
						<input class="${ns}-strip-protocol" type="checkbox" style="margin-left: 0" checked>Strip https://
					</label>
				</div>
			</div>
		</div>
	</div>
	<div class="${ns}-row" style="margin-top: .25rem">
		Data
	</div>
	<div class="${ns}-row">
		<div class="${ns}-col">
			<input type="text" class="${ns}-create-sound-name" placeholder="Name/s">
		</div>
	</div>
	<div class="${ns}-row">
		<div class="${ns}-col">
			<div class="${ns}-file-input placeholder">
				<div class="${ns}-file-overlay">
				<span class="placeholder-text">Select/Drop Image</span>
				<span class="text"></span>
				<input class="${ns}-create-sound-img" type="file" accept="image/*,.webm">
				</div>
			</div>
		</div>
		<div class="${ns}-col">
			<div class="${ns}-file-input placeholder" ${Player.tools.useSoundURL ? 'display: none;' : ''}>
				<div class="${ns}-file-overlay">
					<span class="placeholder-text">Select/Drop Sound/s</span>
					<span class="text"></span>
					<div class="overfile ${ns}-input-append">
						${Player.tools.hasFFmpeg && `<label class="${ns}-use-video-label" style="display: none;">Use video<input type="checkbox" class="${ns}-use-video"></label>` || ''}
						<a href="#" class="${ns}-toggle-sound-input fa fa-link" data-type="url" title="Enter a URL of a previously uploaded file.">U</a>
					</div>
					<input class="${ns}-create-sound-snd" type="file" accept="audio/*,video/*" multiple>
				</div>
				<div class="${ns}-file-list"></div>
			</div>
			<div class="${ns}-row ${ns}-align-center" style="position: relative; ${Player.tools.useSoundURL ? '' : 'display: none;'}">
				<a href="#" class="${ns}-toggle-sound-input ${ns}-input-append" data-type="file" title="Select a file to upload.">
					<span class="fa fa-file-sound-o" style="margin-right: .125rem">F</span>
				</a>
				<input type="text" class="${ns}-create-sound-snd-url" placeholder="Sound URL/s" style="min-width: 100%;">
			</div>
		</div>
	</div>
	<div class="${ns}-row" style="margin-top: .5rem">
		<div class="${ns}-col-auto">
			<button class="${ns}-create-button">Create</button>
		</div>
	</div>
</div>
<div class="${ns}-create-sound-status" ${Player.tools.createStatusText ? '' : 'style="display: none"'}>
	${Player.tools.createStatusText}
</div>`
