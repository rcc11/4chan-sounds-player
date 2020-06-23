`<div class="${ns}-heading">Encode / Decode URL</div>
<div class="${ns}-row">
	<input type="text" class="${ns}-decoded-input ${ns}-col" placeholder="https://">
	<input type="text" class="${ns}-encoded-input ${ns}-col" placeholder="https%3A%2F%2F">
</div>

<div class="${ns}-heading">
	Create Sound Image
</div>
<div class="${ns}-create-sound-form">
	${Player.display.ifNotDismissed('createSoundDetails', 
	`<div class="${ns}-row" data-dismiss-id="createSoundDetails">
		<div class="${ns}-col" style="margin-bottom: .5rem">
			Select an image and sound, or drag & drop them here.
			The sound will be uploaded to the selected file host and the url will be added to the image filename.
			The image can be a webm file, and if it contains audio it can also be used as the sound.
			Doing so will split the file into a video file to be posted and audio file to be uploaded.
			<a href="javascript:;" class="${ns}-dismiss-link" data-dismiss="createSoundDetails">Dismiss</a>
		</div>
	</div>`)}
	<div class="${ns}-row">
		Host
	</div>
	<div class="${ns}-row">
		<div class="${ns}-col">
			<select class="${ns}-create-sound-host">
				${Player.tools.fileHosts.map(host => `
					<option value="${host.id}" ${host.default ? 'selected' : ''}>${host.name}</option>
				`).join('')}
			</select>
		</div>
	</div>
	<div class="${ns}-row">
		Data
	</div>
	<div class="${ns}-row">
		<div class="${ns}-col">
			<div class="${ns}-file-overlay placeholder">
				<span class="placeholder">No Image Selected</span>
				<span class="text"></span>
				<input class="${ns}-create-sound-img" type="file" accept="image/*,.webm">
			</div>
		</div>
		<div class="${ns}-col">
			<div class="${ns}-file-overlay placeholder">
				<span class="placeholder">No Sound Selected</span>
				<span class="text"></span>
				<label class="${ns}-webm-sound-label overfile" style="display: none;">Use webm<input type="checkbox" class="${ns}-webm-sound"></label>
				<input class="${ns}-create-sound-snd" type="file" accept="audio/*,video/*">
			</div>
		</div>
	</div>
	<div class="${ns}-row">
		<div class="${ns}-col">
			<input type="text" class="${ns}-create-sound-name" placeholder="Name">
		</div>
	</div>
	<!--<div class="${ns}-row">
		Sound
	</div>
	<div class="${ns}-row">
		<div class="${ns}-col">
			<label class="${ns}-webm-sound-label" style="display: none;"><input type="checkbox" class="${ns}-webm-sound">Use webm</label>
			<input class="${ns}-create-sound-snd" type="file" accept="audio/*,video/*">
		</div>
	</div>
	<div class="${ns}-row">
		Name
	</div>
	<div class="${ns}-row ${ns}-create-sound-options">
		<input type="text" class="${ns}-create-sound-name">
	</div>-->
	<div class="${ns}-row" style="margin-top: .5rem">
		<div class="${ns}-col-auto" style="margin-right: .5rem">
			<button class="${ns}-create-button">Create</button>
		</div>
	</div>
</div>
<div class="${ns}-create-sound-status" style="display: none"></div>`
