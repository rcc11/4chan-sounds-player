const get = (src, opts) => {
	let xhr;
	const p = new Promise((resolve, reject) => {
		xhr = GM.xmlHttpRequest({
			method: 'GET',
			url: src,
			responseType: 'blob',
			onload: response => resolve(response.response),
			onerror: response => reject(response),
			onabort: response => reject(response),
			...opts
		});
	});
	p.abort = xhr.abort;
	return p;
};

/**
 * This component is mixed into tools so these function are under `Player.tools`.
 */
module.exports = {
	downloadTemplate: require('./templates/download.tpl'),

	async _handleCancel(e) {
		Player.tools._downloadAllCanceled = true;
		console.log(Player.tools._imageFetch, Player.tools._soundFetch);
		Player.tools._imageFetch && Player.tools._imageFetch.abort();
		Player.tools._soundFetch && Player.tools._soundFetch.abort();
		Player.tools.resetDownloadButtons();
	},

	async _handleDownload(e) {
		Player.tools._downloadAllCanceled = false;
		e.currentTarget.style.display = 'none';
		Player.$(`.${ns}-download-all-cancel`).style.display = null;
		await Player.tools.downloadThread(
			Player.$(`.${ns}-download-all-images`).checked,
			Player.$(`.${ns}-download-all-audio`).checked,
			Player.$(`.${ns}-download-all-ignore-downloaded`).checked,
			Player.$(`.${ns}-download-all-status`)
		).catch(() => { /* it's logged */ });
		Player.tools.resetDownloadButtons();
	},

	resetDownloadButtons() {
		Player.$(`.${ns}-download-all-start`).style.display = null;
		Player.$(`.${ns}-download-all-cancel`).style.display = 'none';
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
	 * @param {Boolean} ignoreDownload Whether sounds previously downloaded should be omitted from the download.
	 * @param {Element} [status] Element in which to display the ongoing status of the download.
	 */
	async downloadThread(includeImages, includeSounds, ignoreDownload, status) {
		const zip = new JSZip();

		const toDownload = Player.sounds.filter(s => s.post && (!ignoreDownload || !s.downloaded));
		const count = toDownload.length;

		status && (status.style.display = 'block');

		if (!count || !includeImages && !includeSounds) {
			return status && (status.innerHTML = 'Nothing to download.');
		}

		status && (status.innerHTML = `Downloading ${count} sound images.`
			+ '<br/><br/>This may take a while. You can leave it running in the background. '
			+ 'You\'ll be prompted to download the zip file once complete.');

		// Show currently downloading files with progress bars.
		const currentStatus = status && _.element('<div style="margin-top: .5rem"></div>', status);
		const progressBars = status && _.element(`<div>
			<div class="fcsp-row fcsp-align-center" ${includeImages ? '' : 'style="display: none;"'}>
				<div class="fcsp-col-auto" style="margin-right: .5rem;">${Icons.image}</div>
				<div class="fcsp-col"><div class="fcsp-full-bar"><div class="fcsp-image-bar"></div></div></div>
			</div>
			<div class="fcsp-row fcsp-align-center" ${includeSounds ? '' : 'style="display: none;"'}>
				<div class="fcsp-col-auto" style="margin-right: .5rem;">${Icons.soundwave}</div>
				<div class="fcsp-col"><div class="fcsp-full-bar"><div class="fcsp-sound-bar"></div></div></div>
			</div>
		</div>`, status);
		const imageProgressBar = status && progressBars.querySelector(`.${ns}-image-bar`);
		const soundProgressBar = status && progressBars.querySelector(`.${ns}-sound-bar`);

		for (let i = 0; i < toDownload.length && !Player.tools._downloadAllCanceled; i++) {
			const sound = toDownload[i];
			status && (currentStatus.innerHTML = `${i + 1} / ${count}: ${sound.title}`);
			imageProgressBar.style.width = soundProgressBar.style.width = '0';

			try {
				// Create a folder per post if images and sounds are being downloaded.
				const prefix = includeImages && includeSounds ? sound.post + '/' : '';
				// Reset the progress bars.
				const onprogress = bar => status && (rsp => bar.style.width = ((rsp.loaded / rsp.total) * 100) + '%');
				// Download image and sound as selected.
				const imgFetch = Player.tools._imageFetch = includeImages && get(sound.image, { onprogress: onprogress(imageProgressBar) });
				const sndFetch = Player.tools._soundFetch = includeSounds && get(sound.src, { onprogress: onprogress(soundProgressBar) });
				const [ imageBlob, soundBlob ] = await Promise.all([ imgFetch, sndFetch ]);
				// Add the downloaded files to the zip.
				imageBlob && zip.file(`${prefix}${sound.filename}`, imageBlob);
				soundBlob && zip.file(`${prefix}${encodeURIComponent(sound.src)}`, soundBlob);
				// Flag the sound as downloaded.
				sound.downloaded = true;
			} catch (err) {
				console.error('[4chan sounds player] Download failed', err);
				!Player.tools._downloadAllCanceled && status && _.element(`<p>Failed to download ${sound.title}!</p>`, currentStatus, 'beforebegin');
			}
		}

		// Remove per-post log items
		status && status.removeChild(currentStatus);
		status && status.removeChild(progressBars);

		// Generate the zip file
		status && _.element(`<div style="margin-top: .5rem">
			${!Player.tools._downloadAllCanceled ? '' : `Canceled at ${i} / ${count}.`}
			Generating zip file...
		</div>`, status);
		Player.tools.threadDownloadBlob = await zip.generateAsync({ type: 'blob' });

		// Show a download so if the download prompt is accidently closed you don't have to redo the whole process.
		_.element('<span>Complete! <a href="#" @click="tools.saveThreadDownload:prevent">Save</a></span>', status);
		Player.$(`.${ns}-ignore-downloaded`).style.display = 'block';
		Player.tools.saveThreadDownload();
	},

	saveThreadDownload() {
		const threadNum = (location.href.match(/\/thread\/(\d+)/) || [ null, '-' ])[1];
		const a = _.element(`<a href="${URL.createObjectURL(Player.tools.threadDownloadBlob)}" download="sounds-thread-${Board}-${threadNum}" rel="noopener" target="_blank"></a>`);
		a.click();
		URL.revokeObjectURL(a.href);
	}
};
