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

		let filename = null;

		if (!is4chan) {
			const fileLink = post.querySelector('.post_file_filename');
			filename = fileLink && fileLink.title;
		} else if (isChanX) {
			[
				post.querySelector('.fileText .file-info .fnfull'),
				post.querySelector('.fileText .file-info > a')
			].some(function (node) {
				return node && (filename = node.textContent);
			});
		} else {
			[
				post.querySelector('.fileText'),
				post.querySelector('.fileText > a')
			].some(function (node) {
				return node && (filename = node.title || node.tagName === 'A' && node.textContent);
			});
		}

		if (!filename) {
			return;
		}

		filename = filename.replace(/\-/, '/');

		const postID = post.id.slice(is4chan ? 1 : 0);
		const fileThumb = post.querySelector(is4chan ? '.fileThumb' : '.thread_image_link');
		const image = fileThumb && fileThumb.href;
		const thumbImg = fileThumb && fileThumb.querySelector('img')
		const thumb = thumbImg && thumbImg.src;
		const imageMD5 = thumbImg && thumbImg.getAttribute('data-md5');

		const matches = [];
		let match;
		while ((match = filenameRE.exec(filename)) !== null) {
			matches.push(match);
		}

		const defaultName = matches[0] && matches[0][1] || postID;

		matches.forEach(function (match, i) {
			let src = match[2];
			let id = postID + ':' + i;
			const title = match[1].trim() || defaultName + (matches.length > 1 ? ` (${i + 1})` : '');

			try {
				if (src.includes('%')) {
					src = decodeURIComponent(src);
				}

				if (src.match(protocolRE) === null) {
					src = (location.protocol + '//' + src);
				}
			} catch (error) {
				return;
			}
			return Player.add({ title, id, src, thumb, image, post: postID, imageMD5, filename }, skipRender);
		});
	} catch (err) {
		_logError('There was an issue parsing the files. Please check the console for details.');
		console.log('[4chan sounds player]', post)
		console.error(err);
	}
};
