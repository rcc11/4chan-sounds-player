const progressBarsTemplate = require('./templates/download-progress.tpl');

const get = (src, opts) => {
	let xhr;
	// Wrap so aborting rejects.
	let p = new Promise((resolve, reject) => {
		xhr = GM.xmlHttpRequest({
			method: 'GET',
			url: src,
			responseType: 'blob',
			onload: response => resolve(response.response),
			onerror: response => reject(response),
			onabort: response => {
				response.aborted = true;
				reject(response);
			},
			...(opts || {})
		});
	});
	if (opts && opts.catch) {
		p = p.catch(opts.catch);
	}
	p.abort = xhr.abort;
	return p;
};

/**
 * This component is mixed into tools so these function are under `Player.tools`.
 */
const downloadTool = module.exports = {
	downloadTemplate: require('./templates/download.tpl'),
	_downloading: null,

	/**
	 * Update the view when the hosts are updated.
	 */
	initialize() {
		Player.on('rendered', downloadTool.afterRender);
	},

	/**
	 * Store references to various elements.
	 */
	afterRender() {
		downloadTool.resetDownloadButtons();
	},

	async _handleDownloadCancel() {
		if (Player.tools._downloading) {
			Player.tools._downloadAllCanceled = true;
			Player.tools._downloading.forEach(dls => dls.forEach(dl => dl && dl.abort()));
		}
	},

	async _handleDownload(e) {
		Player.tools._downloadAllCanceled = false;
		e.currentTarget.style.display = 'none';
		Player.$(`.${ns}-download-all-cancel`).style.display = null;

		await Player.tools.downloadThread({
			includeImages: Player.$('.download-all-images').checked,
			includeSounds: Player.$('.download-all-audio').checked,
			ignoreDownloaded: Player.$('.download-all-ignore-downloaded').checked,
			maxSounds: +Player.$('.download-all-max-sounds').value || 0,
			concurrency: Math.max(1, +Player.$('.download-all-concurrency').value || 1),
			compression: Math.max(0, Math.min(+Player.$('.download-all-compression').value || 0, 9)),
			status: Player.$(`.${ns}-download-all-status`)
		}).catch(() => { /* it's logged */ });

		Player.tools.resetDownloadButtons();
	},

	resetDownloadButtons() {
		Player.$(`.${ns}-download-all-start`).style.display = Player.tools._downloading ? 'none' : null;
		Player.$(`.${ns}-download-all-cancel`).style.display = Player.tools._downloading ? null : 'none';
		Player.$(`.${ns}-download-all-save`).style.display = Player.tools.threadDownloadBlob ? null : 'none';
		Player.$(`.${ns}-download-all-clear`).style.display = Player.tools.threadDownloadBlob ? null : 'none';
		Player.$(`.${ns}-ignore-downloaded`).style.display = Player.sounds.some(s => s.downloaded) ? null : 'none';
	},

	/**
	 * Trigger a download for a file using GM.xmlHttpRequest to avoid cors issues.
	 *
	 * @param {String} src URL of the field to download.
	 * @param {String} name Name to save the file as.
	 */
	async download(src, name) {
		try {
			const blob = await get(src);
			const a = _.element(`<a href="${URL.createObjectURL(blob)}" download="${_.escAttr(name)}" rel="noopener" target="_blank"></a>`);
			a.click();
			URL.revokeObjectURL(a.href);
		} catch (err) {
			Player.logError('There was an error downloading.', err, 'warning');
		}
	},

	/**
	 * Download the images and/or sounds in the thread as zip file.
	 *
	 * @param {Boolean} includeImages Whether images should be included in the download.
	 * @param {Boolean} includeSounds Whether audio files should be included in the download.
	 * @param {Boolean} ignoreDownloaded Whether sounds previously downloaded should be omitted from the download.
	 * @param {Boolean} maxSounds The maximum number of sounds to download.
	 * @param {Boolean} concurrency How many sounds can be download at the same time.
	 * @param {Boolean} compression Compression level.
	 * @param {Element} [status] Element in which to display the ongoing status of the download.
	 */
	async downloadThread({ includeImages, includeSounds, ignoreDownloaded, maxSounds, concurrency, compression, status }) {
		const zip = new JSZip();

		!(maxSounds > 0) && (maxSounds = Infinity);
		const toDownload = Player.sounds.filter(s => s.post && (!ignoreDownloaded || !s.downloaded)).slice(0, maxSounds);
		const count = toDownload.length;

		status && (status.style.display = 'block');

		if (!count || !includeImages && !includeSounds) {
			return status && (status.innerHTML = 'Nothing to download.');
		}

		Player.tools._downloading = [];
		status && (status.innerHTML = `Downloading ${count} sound images.<br><br>
			This may take a while. You can leave it running in the background, but if you background the tab your browser will slow it down.
			You'll be prompted to download the zip file once complete.<br><br>`);

		const elementsArr = new Array(concurrency).fill(0).map(() => {
			// Show currently downloading files with progress bars.
			const el = status && _.element(progressBarsTemplate({ includeSounds, includeImages }), status);
			const dlRef = [];
			Player.tools._downloading.push(dlRef);
			// Allow each download to be canceled individually. In case there's a huge download you don't want to include.
			el && (el.querySelector(`.${ns}-cancel-download`).onclick = () => dlRef.forEach(dl => dl && dl.abort()));
			return {
				dlRef,
				el,
				status: el && el.querySelector(`.${ns}-current-status`),
				image: el && el.querySelector(`.${ns}-image-bar`),
				sound: el && el.querySelector(`.${ns}-sound-bar`)
			};
		});

		let running = 0;

		// Download arg builder. Update progress bars, and catch errors to log and continue.
		const getArgs = (data, sound, type) => ({
			responseType: 'arraybuffer',
			onprogress: data[type] && (rsp => data[type].style.width = ((rsp.loaded / rsp.total) * 100) + '%'),
			catch: err => {
				if (err.aborted) {
					return 'aborted';
				}
				if (!err.aborted && !Player.tools._downloadAllCanceled) {
					console.error('[4chan sounds player] Download failed', err);
					status && _.element(`<p>Failed to download ${sound.title} ${type}!</p>`, elementsArr[0].el, 'beforebegin');
				}
			}
		});

		await Promise.all(elementsArr.map(async function downloadNext(data) {
			const sound = toDownload.shift();
			// Fall out if all downlads were canceled.
			if (!sound || Player.tools._downloadAllCanceled) {
				data.el && status.removeChild(data.el);
				return;
			}
			const i = ++running;
			// Show the name and reset the progress bars.
			if (data.el) {
				data.status.textContent = `${i} / ${count}: ${sound.title}`;
				data.image.style.width = data.sound.style.width = '0';
			}

			// Create a folder per post if images and sounds are being downloaded.
			const prefix = includeImages && includeSounds ? sound.post + '/' : '';
			// Download image and sound as selected.
			const [ imageRsp, soundRsp ] = await Promise.all([
				data.dlRef[0] = includeImages && get(sound.image, getArgs(data, sound, 'image')),
				data.dlRef[1] = includeSounds && get(sound.src, getArgs(data, sound, 'sound'))
			]);

			// No post-handling if the whole download was canceled.
			if (!Player.tools._downloadAllCanceled) {
				if (imageRsp === 'aborted' || soundRsp === 'aborted') {
					// Show which sounds were individually aborted.
					status && _.element(`<p>Skipped ${sound.title}.</p>`, elementsArr[0].el, 'beforebegin');
				} else {
					// Add the downloaded files to the zip.
					imageRsp && zip.file(`${prefix}${sound.filename}`, imageRsp);
					soundRsp && zip.file(`${prefix}${encodeURIComponent(sound.src)}`, soundRsp);
					// Flag the sound as downloaded.
					sound.downloaded = true;
				}
			}
			// Move on to the next sound.
			await downloadNext(data);
		}));

		// Show where we canceled at, if we did cancel.
		Player.tools._downloadAllCanceled && _.element(`<span>Canceled at ${running} / ${count}.`, status);
		// Generate the zip file.
		const zipProgress = status && _.element('<div>Generating zip file...</div>', status);
		try {
			const zipOptions = {
				type: 'blob',
				compression: compression ? 'DEFLATE' : 'STORE',
				compressionOptions: {
					level: compression
				}
			};
			Player.tools.threadDownloadBlob = await zip.generateAsync(zipOptions, metadata => {
				status && (zipProgress.textContent = `Generating zip file (${metadata.percent.toFixed(2)}%)...`);
			});

			// Update the display and prompt to download.
			status && _.element('<span>Complete!', status);
			Player.tools.saveThreadDownload();
		} catch (err) {
			console.error('[4chan sounds player] Failed to generate zip', err);
			status && (zipProgress.textContent = 'Failed to generate zip file!');
		}
		Player.tools._downloading = null;
		Player.tools.resetDownloadButtons();
	},

	saveThreadDownload() {
		const threadNum = Thread || '-';
		const a = _.element(`<a href="${URL.createObjectURL(Player.tools.threadDownloadBlob)}" download="sounds-thread-${Board}-${threadNum}" rel="noopener" target="_blank"></a>`);
		a.click();
		URL.revokeObjectURL(a.href);
	},

	clearDownloadBlob() {
		delete Player.tools.threadDownloadBlob;
		Player.tools.resetDownloadButtons();
	}
};
