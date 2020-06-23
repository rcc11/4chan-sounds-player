module.exports = {
	fileHosts: [
		{
			id: 'catbox',
			default: true,
			name: 'catbox.moe',
			url: 'https://catbox.moe/user/api.php',
			data: { reqtype: 'fileupload', fileToUpload: '$file', userhash: '' }
		},
		{
			id: 'pomf',
			name: 'pomf.cat',
			url: 'https://pomf.cat/upload.php',
			data: { 'files[]': '$file' },
			responsePath: 'response.files[0].url',
			soundUrl: 'a.pomf.cat/%s'
		}
	],

	delegatedEvents: {
		click: {
			[`.${ns}-create-button`]: 'tools._handleCreate',
			[`.${ns}-create-sound-post-link`]: 'tools._addCreatedToQR',
			[`.${ns}-create-sound-add-link`]: 'tools._addCreatedToPlayer'
		},
		change: {
			[`.${ns}-create-sound-img`]: 'tools._handleImageSelect',
			[`.${ns}-create-sound-form input[type=file]`]: e => Player.tools._handleFileSelect(e.eventTarget),
			[`.${ns}-webm-sound`]: 'tools._handleWebmSoundChange'
		},
		drop: {
			[`.${ns}-create-sound-form`]: 'tools._handleCreateSoundDrop'
		},
		keyup: {
			[`.${ns}-encoded-input`]: 'tools._handleEncoded',
			[`.${ns}-decoded-input`]: 'tools._handleDecoded'
		}
	},

	initialize: function () {
		Player.on('rendered', () => {
			Player.tools.status = Player.$(`.${ns}-create-sound-status`);
			Player.tools.imgInput = Player.$(`.${ns}-create-sound-img`);
			Player.tools.sndInput = Player.$(`.${ns}-create-sound-snd`);
		});
	},

	toggle: function (e) {
		e && e.preventDefault();
		if (Player.config.viewStyle === 'tools') {
			Player.playlist.restore();
		} else {
			Player.display.setViewStyle('tools');
		}
	},

	/**
	 * Encode the decoded input.
	 */
	_handleDecoded: function (e) {
		Player.$(`.${ns}-encoded-input`).value = encodeURIComponent(e.eventTarget.value);
	},

	/**
	 * Decode the encoded input.
	 */
	_handleEncoded: function (e) {
		Player.$(`.${ns}-decoded-input`).value = decodeURIComponent(e.eventTarget.value);
	},

	/**
	 * Show/hide the "Use webm" checkbox when an image is selected.
	 */
	_handleImageSelect: function (e) {
		const input = e && e.eventTarget || Player.tools.imgInput;
		const image = input.files[0];
		const isVideo = image.type === 'video/webm';

		// Show the Use Webm label if the image is a webm file
		Player.$(`.${ns}-webm-sound-label`).style.display = isVideo ? 'inherit' : 'none';

		// If the image isn't a webm make sure Use Webm is deselected (click to fire change event)
		const webmCheckbox = Player.$(`.${ns}-webm-sound`);
		webmCheckbox.checked && !isVideo && webmCheckbox.click();

		// Show the image name as the placeholder for the name input since it's the default
		Player.$(`.${ns}-create-sound-name`).setAttribute('placeholder', image.name.replace(/\.[^/.]+$/, ''));
	},

	_handleFileSelect: function (input, file) {
		const container = input.parentNode;
		const fileText = container.querySelector('span');
		file || (file = input.files[0]);
		container.classList[file ? 'remove' : 'add']('placeholder');
		fileText.innerHTML = file ? file.name : container.getAttribute('placeholder');
	},

	/**
	 * Show/hide the sound input when "Use webm" is changed.
	 */
	_handleWebmSoundChange: function (e) {
		const sound = Player.tools.sndInput;
		const image = Player.tools.imgInput;
		Player.tools._handleFileSelect(sound, e.eventTarget.checked && image.files[0]);
	},

	/**
	 * Handle files being dropped on the create sound section.
	 */
	_handleCreateSoundDrop: function (e) {
		e.preventDefault();
		e.stopPropagation();
		[ ...e.dataTransfer.files ].forEach(file => {
			const isImage = file.type.startsWith('image') || file.type === 'video/webm';
			const isSound = file.type.startsWith('audio') || file.type.startsWith('video');
			if (isImage || isSound) {
				const dataTransfer = new DataTransfer();
				dataTransfer.items.add(file);
				const input = isImage ? Player.tools.imgInput : Player.tools.sndInput;
				input.files = dataTransfer.files;
				Player.tools._handleFileSelect(input, file);
			}
			isImage && Player.tools._handleImageSelect();
		});
		return false;
	},

	/**
	 * Handle the create button.
	 * Extracts video/audio if required, uploads the sound, and creates an image file names with [sound=url].
	 */
	_handleCreate: async function (e) {
		e && e.preventDefault();
		const status = Player.tools.status;
		// Revoke the URL for an existing created image.
		Player.tools._createdImageURL && URL.revokeObjectURL(Player.tools._createdImageURL);
		Player.tools._createdImage = null;

		status.innerHTML = 'Creating sound image';

		Player.$(`.${ns}-create-button`).disabled = true;
		status.style.display = 'inherit';

		// Get the host, image and sound (checking if the sound is from a webm "image")
		const host = Player.$(`.${ns}-create-sound-host`).value;
		let image = Player.tools.imgInput.files[0];
		let sound = !Player.$(`.${ns}-webm-sound`).checked || image.type !== 'video/webm'
			? Player.tools.sndInput.files[0]
			: image;
		const name = Player.$(`.${ns}-create-sound-name`).value || image.name.replace(/\.[^/.]+$/, '');

		// If the image is a webm then extract just the video.
		if (image.type === 'video/webm') {
			try {
				image = await Player.tools.extract(image, 'video');
			} catch (err) {
				return _finish('Video extraction failed.', err);
			}
		}

		// If the sound is a video extract the audio from it.
		if (sound.type.startsWith('video')) {
			try {
				sound = await Player.tools.extract(sound, 'audio');
			} catch (err) {
				return _finish('Sound extraction failed.', err);
			}
		}

		// Upload the sound.
		let soundURL;
		try {
			soundURL = await Player.tools.postFile(sound, host);
		} catch (err) {
			return _finish('Upload failed.', err);
		}

		// Create a new file that includes [sound=url] in the name.
		const ext = image.name.match(/\.([^/.]+)$/)[1];
		const soundImage = new File([ image ], `${name}[sound=${encodeURIComponent(soundURL)}].${ext}`, { type: image.type });

		// Keep track of the create image and a url to it.
		Player.tools._createdImage = soundImage;
		Player.tools._createdImageURL = URL.createObjectURL(soundImage);

		_finish();

		function _finish(msg, err) {
			Player.$(`.${ns}-create-button`).disabled = false;
			if (err) {
				status.innerHTML += '<br>Failed!';
				return Player.logError(msg, err);
			}
			// Complete! with some action links
			status.innerHTML += `<br>Complete!<br>`
				+ (is4chan ? `<a href="#" class="${ns}-create-sound-post-link">Post</a> - ` : '')
				+ ` <a href="#" class="${ns}-create-sound-add-link">Add</a> - `
				+ ` <a href="${Player.tools._createdImageURL}" download="${Player.tools._createdImage.name}">Download</a>`;
		}
	},

	/**
	 * Extract just the audio or video from a file.
	 */
	extract: async function (file, type) {
		const status = Player.tools.status;
		const name = file.name.replace(/\.[^/.]+$/, '') + (type === 'audio' ? '.ogg' : '.webm');
		status.innerHTML += '<br>Extracting ' + type;

		const result = ffmpeg({
			MEMFS: [ { name: '_' + file.name, data: await new Response(file).arrayBuffer() }],
			arguments: type === 'audio'
				? [ '-i', '_' + file.name, '-vn', '-c', 'copy', name ]
				: [ '-i', '_' + file.name, '-an', '-c', 'copy', name ]
		});

		return new File([ result.MEMFS[0].data ], name, { type: type === 'audio' ? 'audio/ogg' : 'video/webm' });
	},

	/**
	 * Upload the sound file and return a link to it.
	 */
	postFile: async function (file, hostId) {
		const status = Player.tools.status;
		const host = Player.tools.fileHosts.find(host => host.id === hostId);

		if (!host) {
			throw new Error('Unknown host ' + hostId);
		}

		const formData = new FormData();
		Object.keys(host.data).forEach(key => {
			formData.append(key, host.data[key] === '$file' ? file : host.data[key]);
		});

		const statusText = status.innerHTML;
		status.innerHTML += '<br>Uploading sound';

		return new Promise((resolve, reject) => {
			GM.xmlHttpRequest({
				method: 'POST',
				url: host.url,
				data: formData,
				responseType: host.responsePath ? 'json' : 'text',
				onload: async response => {
					if (response.status < 200 || response.status >= 300) {
						return reject(response);
					}
					const responseVal = host.responsePath
						? _get(response.response, host.responsePath)
						: host.responseMatch
							? (response.responseText.match(new RegExp(host.responseMatch)) || [])[0]
							: response.responseText;
					const uploadedUrl = host.soundUrl ? host.soundUrl.replace('%s', responseVal) : responseVal;
					status.innerHTML = statusText + `<br>Uploaded to <a href="${uploadedUrl}">${uploadedUrl}</a>`;
					resolve(uploadedUrl);
				},
				upload: {
					onprogress: response => {
						const total = response.total > 0 ? response.total : file.size;
						status.innerHTML = statusText + '<br>Uploading sound - ' + Math.floor(response.loaded / total * 100) + '%';
					}
				},
				onerror: reject
			});
		});
	},

	/**
	 * Add the created sound image to the player.
	 */
	_addCreatedToPlayer: function (e) {
		e.preventDefault();
		Player.playlist.addFromFiles([ Player.tools._createdImage ]);
	},

	/**
	 * Open the QR window and add the created sound image to it.
	 */
	_addCreatedToQR: function (e) {
		if (!is4chan) {
			return;
		}
		e.preventDefault();
		// Open the quick reply window.
		const qrLink = document.querySelector(isChanX ? '.qr-link' : '.open-qr-link');

		const dataTransfer = new DataTransfer();
		dataTransfer.items.add(Player.tools._createdImage);

		// 4chan X, drop the file on the qr window.
		if (isChanX) {
			qrLink.click();
			const event = new CustomEvent('drop', { view: window, bubbles: true, cancelable: true });
			event.dataTransfer = dataTransfer;
			document.querySelector('#qr').dispatchEvent(event);
		
		// Native, set the file input value. Check for a quick reply 
		} else if (qrLink) {
			qrLink.click();
			document.querySelector('#qrFile').files = dataTransfer.files;
		} else {
			document.querySelector('#togglePostFormLink a').click();
			document.querySelector('#postFile').files = dataTransfer.files;
			document.querySelector('.postForm').scrollIntoView();
		}
	},
};
