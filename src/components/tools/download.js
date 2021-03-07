const get = src => new Promise((resolve, reject) => {
	GM.xmlHttpRequest({
		method: 'GET',
		url: src,
		responseType: 'blob',
		onload: response => resolve(response.response),
		onerror: response => reject(response)
	});
});

/**
 * This component is mixed into tools so these function are under `Player.tools`.
 */
module.exports = {
	downloadTemplate: require('./templates/download.tpl'),

	async _handleDownload(e) {
		const btn = e.currentTarget;
		btn.disabled = true;
		await Player.tools.downloadThread(
			Player.$(`.${ns}-download-all-images`).checked,
			Player.$(`.${ns}-download-all-audio`).checked,
			Player.$(`.${ns}-download-all-ignore-downloaded`).checked,
			Player.$(`.${ns}-download-all-status`)
		);
		btn.disabled = false;
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
		const total = toDownload.length;

		status && (status.style.display = 'block');

		if (!total || !includeImages && !includeSounds) {
			return status && (status.innerHTML = 'Nothing to download.');
		}

		status && (status.innerHTML = `Downloading ${total} sound images.`
			+ '<br/><br/>This may take a while. You can leave it running in the background. '
			+ 'You\'ll be prompted to download the zip file once complete.');

		const currentStatus = status && _.element('<div style="margin-top: .5rem"></div>', status);
		for (let i = 0; i < toDownload.length; i++) {
			const sound = toDownload[i];
			status && (currentStatus.innerHTML = `${i + 1} / ${total}: ${sound.title}`);
			try {
				const [ imageBlob, soundBlob ] = await Promise.all([
					includeImages && get(sound.image),
					includeSounds && get(sound.src)
				]);
				const prefix = includeImages && includeSounds ? sound.post + '/' : '';
				zip.file(`${prefix}${sound.filename}`, imageBlob);
				soundBlob && zip.file(`${prefix}${encodeURIComponent(sound.src)}`, soundBlob);
				sound.downloaded = true;
			} catch (err) {
				console.log(err);
				status && _.elementBefore(`<p>Failed to download ${sound.title}!</p>`, currentStatus);
			}
		}
		status && status.removeChild(currentStatus);
		status && _.element('<div style="margin-top: .5rem">Complete!<br/><a href="#" @click="tools.saveThreadDownload:prevent">Save</a></div>', status);
		Player.tools.threadDownloadBlob = await zip.generateAsync({ type: 'blob' });
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
