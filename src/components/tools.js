const ffmpegVersionUrl = 'https://raw.githubusercontent.com/rcc11/4chan-sounds-player/master/dist/4chan-sounds-player-with-ffmpeg.user.js';
const promoteFFmpegVersion = false;

module.exports = {
	hasFFmpeg: typeof ffmpeg === 'function',
	createStatusText: '',

	delegatedEvents: {
		click: {
			[`.${ns}-create-button`]: 'tools._handleCreate',
			[`.${ns}-create-sound-post-link`]: 'tools._addCreatedToQR',
			[`.${ns}-create-sound-add-link`]: 'tools._addCreatedToPlayer'
		},
		change: {
			[`.${ns}-create-sound-img`]: 'tools._handleImageSelect',
			[`.${ns}-create-sound-form input[type=file]`]: e => Player.tools._handleFileSelect(e.eventTarget),
			[`.${ns}-use-video`]: 'tools._handleWebmSoundChange'
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
		Player.on('config:uploadHosts', Player.tools.render);
		Player.on('config:defaultUploadHost', function (newValue) {
			Player.$(`.${ns}-create-sound-host`).value = newValue;
		});
		Player.on('rendered', Player.tools.afterRender);
	},

	render: function () {
		Player.$(`.${ns}-tools`).innerHTML = Player.templates.tools();
		Player.tools.afterRender();
	},

	afterRender: function () {
		Player.tools.status = Player.$(`.${ns}-create-sound-status`);
		Player.tools.imgInput = Player.$(`.${ns}-create-sound-img`);
		Player.tools.sndInput = Player.$(`.${ns}-create-sound-snd`);
	},

	toggle: function (e) {
		e && e.preventDefault();
		if (Player.config.viewStyle === 'tools') {
			Player.playlist.restore();
		} else {
			Player.display.setViewStyle('tools');
		}
	},

	updateCreateStatus: function (text) {
		Player.tools.status.style.display = text ? 'inherit' : 'none';
		Player.tools.status.innerHTML = Player.tools.createStatusText = text;
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
	_handleImageSelect: async function (e) {
		const input = e && e.eventTarget || Player.tools.imgInput;
		const image = input.files[0];
		const isVideo = image.type === 'video/webm';
		let placeholder = image.name.replace(/\.[^/.]+$/, '');

		if (Player.tools.hasFFmpeg) {
			// Show the Use Webm label if the image is a webm file
			Player.$(`.${ns}-use-video-label`).style.display = isVideo ? 'inherit' : 'none';

			const webmCheckbox = Player.$(`.${ns}-use-video`);
			// If the image is a video and Copy Video is selected then update the sound input as well
			webmCheckbox.checked && isVideo && Player.tools._handleFileSelect(Player.tools.sndInput, image);
			// If the image isn't a webm make sure Copy Video is deselected (click to fire change event)
			webmCheckbox.checked && !isVideo && webmCheckbox.click();
		} else if (await Player.tools.hasAudio) {
			Player.logError('Audio not allowed for the image webm.', null, 'warning');
		}

		// Show the image name as the placeholder for the name input since it's the default
		Player.$(`.${ns}-create-sound-name`).setAttribute('placeholder', placeholder);
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
		const targetInput = e.target.nodeName === 'INPUT' && e.target.getAttribute('type') === 'file' && e.target;
		[ ...e.dataTransfer.files ].forEach(file => {
			const isVideo = file.type.startsWith('video');
			const isImage = file.type.startsWith('image') || file.type === 'video/webm';
			const isSound = file.type.startsWith('audio');
			if (isVideo || isImage || isSound) {
				const dataTransfer = new DataTransfer();
				dataTransfer.items.add(file);
				const input = file.type === 'video/webm' && targetInput
					? targetInput
					: isImage
						? Player.tools.imgInput
						: Player.tools.sndInput;
				input.files = dataTransfer.files;
				Player.tools._handleFileSelect(input, file);
				input === Player.tools.imgInput && Player.tools._handleImageSelect();
			}
		});
		return false;
	},

	/**
	 * Handle the create button.
	 * Extracts video/audio if required, uploads the sound, and creates an image file names with [sound=url].
	 */
	_handleCreate: async function (e) {
		e && e.preventDefault();
		// Revoke the URL for an existing created image.
		Player.tools._createdImageURL && URL.revokeObjectURL(Player.tools._createdImageURL);
		Player.tools._createdImage = null;

		Player.tools.updateCreateStatus('Creating sound image');

		Player.$(`.${ns}-create-button`).disabled = true;

		// Get the host, image and sound (checking if the sound is from a webm "image")
		const host = Player.$(`.${ns}-create-sound-host`).value;
		let image = Player.tools.imgInput.files[0];
		let sound = !(Player.$(`.${ns}-use-video`) || {}).checked || !image.type.startsWith('video')
			? Player.tools.sndInput.files[0]
			: image;
		const name = Player.$(`.${ns}-create-sound-name`).value || image.name.replace(/\.[^/.]+$/, '');
		const isAudioWebmImage = image.type.startsWith('video') && await Player.tools.hasAudio(image);

		if (!image) {
			return _finish('Missing file.', new PlayerError('Select an image or webm.', 'warning'));
		}
		if (!sound) {
			return _finish('Missing file.', new PlayerError('Select a sound.', 'warning'));
		}
		if (isAudioWebmImage && !Player.tools.hasFFmpeg) {
			Player.tools.updateCreateStatus(Player.tools.createStatusText
				+ '<br>' + (promoteFFmpegVersion ? 'This version of the player does not enable webm splitting.' : 'Audio not allowed for the image webm.')
				+ '<br>Remove the audio from the webm and try again.'
				+ (promoteFFmpegVersion ? '<br>Alternatively install the <a href="${ffmpegVersionUrl}">ffmpeg version</a> to extract video/audio automatically.' : ''));
			return _finish('Cannot extract video', new PlayerError('Audio not allowed for the image webm.', null, 'error'));
		}
		try {
			// If the image is a webm with audio then extract just the video.
			if (isAudioWebmImage) {
				image = await Player.tools.extract(image, 'video');
			}

			// If the sound is a video extract the audio from it.
			if (sound.type.startsWith('video')) {
				if (!await Player.tools.hasAudio(sound)) {
					return _finish('No audio', new PlayerError('The selected video has no audio.', 'warning'));
				}
				if (!Player.tools.hasFFmpeg) {
					sound = await Player.tools.extract(sound, 'audio');
				}
			}
		} catch (err) {
			return _finish('Media extraction failed.', err);
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
				Player.tools.updateCreateStatus(Player.tools.createStatusText + '<br>Failed!');
				return Player.logError(msg, err);
			}
			// Complete! with some action links
				Player.tools.updateCreateStatus(Player.tools.createStatusText
					+ `<br>Complete!<br>`
					+ (is4chan ? `<a href="#" class="${ns}-create-sound-post-link">Post</a> - ` : '')
					+ ` <a href="#" class="${ns}-create-sound-add-link">Add</a> - `
					+ ` <a href="${Player.tools._createdImageURL}" download="${Player.tools._createdImage.name}">Download</a>`
				);
		}
	},

	hasAudio: function (file) {
		return new Promise((resolve, reject) => {
			const url = URL.createObjectURL(file);
			const video = document.createElement('video');
			video.addEventListener('loadeddata', () => {
				URL.revokeObjectURL(url);
				resolve(video.mozHasAudio || !!video.webkitAudioDecodedByteCount);
			});
			video.addEventListener('error', reject);
			video.src = url;
		});
	},

	/**
	 * Extract just the audio or video from a file.
	 */
	extract: async function (file, type) {
		Player.tools.updateCreateStatus(Player.tools.createStatusText + '<br>Extracting ' + type);
		if (typeof ffmpeg !== 'function') {
			return file;
		}
		const name = file.name.replace(/\.[^/.]+$/, '') + (type === 'audio' ? '.ogg' : '.webm');

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
		const host = Player.config.uploadHosts[hostId];

		if (!host || host.invalid) {
			throw new PlayerError('Invalid upload host: ' + hostId, 'error');
		}

		const formData = new FormData();
		Object.keys(host.data).forEach(key => {
			if (host.data[key] !== null) {
				formData.append(key, host.data[key] === '$file' ? file : host.data[key]);
			}
		});

		const statusText = Player.tools.createStatusText;
		Player.tools.updateCreateStatus(Player.tools.createStatusText + '<br>Uploading sound');

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
					Player.tools.updateCreateStatus(statusText + `<br>Uploaded to <a href="${uploadedUrl}" target="_blank">${uploadedUrl}</a>`);
					resolve(uploadedUrl);
				},
				upload: {
					onprogress: response => {
						const total = response.total > 0 ? response.total : file.size;
						Player.tools.updateCreateStatus(statusText + '<br>Uploading sound - ' + Math.floor(response.loaded / total * 100) + '%');
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
