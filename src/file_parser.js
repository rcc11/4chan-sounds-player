module.exports = {
	parseFiles,
	parsePost
}

function parseFiles (target) {
	target.querySelectorAll('.post').forEach(parsePost);
};

function parsePost(post) {
	try {
		const parentParent = post.parentElement.parentElement;
		if (parentParent.id === 'qp' || parentParent.classList.contains('inline') || post.parentElement.classList.contains('noFile')) {
			return;
		}

		let fileName = null;

		if (!is4chan) {
			const fileLink = post.querySelector('.post_file_filename');
			fileName = fileLink && fileLink.title;
		} else if (isChanX) {
			[
				post.querySelector('.fileText .file-info .fnfull'),
				post.querySelector('.fileText .file-info > a')
			].some(function (node) {
				return node && (fileName = node.textContent);
			});
		} else {
			[
				post.querySelector('.fileText'),
				post.querySelector('.fileText > a')
			].some(function (node) {
				return node && (fileName = node.title || node.tagName === 'A' && node.textContent);
			});
		}

		if (!fileName) {
			return;
		}

		fileName = fileName.replace(/\-/, '/');

		const match = fileName.match(/^(.*)[\[\(\{](?:audio|sound)[ \=\:\|\$](.*?)[\]\)\}]/i);

		if (!match) {
			return;
		}

		const id = post.id.slice(is4chan ? 1 : 0);
		const name = match[1] || id;
		const fileThumb = post.querySelector(is4chan ? '.fileThumb' : '.thread_image_link');
		const fullSrc = fileThumb && fileThumb.href;
		const thumbSrc = fileThumb && fileThumb.querySelector('img').src;
		let link = match[2];

		if (link.includes('%')) {
			try {
				link = decodeURIComponent(link);
			} catch (error) {
				return;
			}
		}

		if (link.match(/^(https?\:)?\/\//) === null) {
			link = (location.protocol + '//' + link);
		}

		try {
			link = new URL(link);
		} catch (error) {
			return;
		}

		for (let item of Player.config.allow) {
			if (link.hostname.toLowerCase() === item || link.hostname.toLowerCase().endsWith('.' + item)) {
				return Player.add(name, id, link.href, thumbSrc, fullSrc);
			}
		}
	} catch (err) {
		_logError('There was an issue parsing the files. Please check the console for details.');
		console.log('[4chan sounds player]', post)
		console.error(err);
	}
};
