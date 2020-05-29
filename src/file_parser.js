const protocolRE = /^(https?\:)?\/\//;
const filenameRE = /(.*?)[\[\(\{](?:audio|sound)[ \=\:\|\$](.*?)[\]\)\}]/g;

module.exports = {
	parseFiles,
	parsePost
}

function parseFiles (target, postRender) {
	target.querySelectorAll('.post').forEach(post => parsePost(post, postRender));
	if (postRender && Player.container) {
		Player.playlist.render();
	}
};

function parsePost(post, skipRender) {
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

		const postID = post.id.slice(is4chan ? 1 : 0);
		const fileThumb = post.querySelector(is4chan ? '.fileThumb' : '.thread_image_link');
		const fullSrc = fileThumb && fileThumb.href;
		const thumbImg = fileThumb && fileThumb.querySelector('img')
		const thumbSrc = thumbImg && thumbImg.src;
		const md5 = thumbImg && thumbImg.getAttribute('data-md5');

		const matches = [];
		let match;
		while ((match = filenameRE.exec(fileName)) !== null) {
			matches.push(match);
		}

		const defaultName = matches[0] && matches[0][1] || postID;

		matches.forEach(function (match, i) {
			let link = match[2];
			let id = postID + ':' + i;
			const name = match[1].trim() || defaultName + (matches.length > 1 ? ` (${i + 1})` : '');

			try {
				if (link.includes('%')) {
					link = decodeURIComponent(link);
				}

				if (link.match(protocolRE) === null) {
					link = (location.protocol + '//' + link);
				}
			} catch (error) {
				return;
			}
			return Player.add(name, id, link, thumbSrc, fullSrc, postID, md5, skipRender);
		});
	} catch (err) {
		_logError('There was an issue parsing the files. Please check the console for details.');
		console.log('[4chan sounds player]', post)
		console.error(err);
	}
};
