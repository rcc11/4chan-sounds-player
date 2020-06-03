const protocolRE = /^(https?\:)?\/\//;
const filenameRE = /(.*?)[\[\(\{](?:audio|sound)[ \=\:\|\$](.*?)[\]\)\}]/g;

let localCounter = 0;

module.exports = {
	parseFiles,
	parsePost,
	parseFileName
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


		const postID = post.id.slice(is4chan ? 1 : 0);
		const fileThumb = post.querySelector(is4chan ? '.fileThumb' : '.thread_image_link');
		const imageSrc = fileThumb && fileThumb.href;
		const thumbImg = fileThumb && fileThumb.querySelector('img')
		const thumbSrc = thumbImg && thumbImg.src;
		const imageMD5 = thumbImg && thumbImg.getAttribute('data-md5');

		const sounds = parseFileName(filename, imageSrc, postID, thumbSrc, imageMD5);

		sounds.forEach(sound => Player.add(sound, skipRender));
	} catch (err) {
		_logError('There was an issue parsing the files. Please check the console for details.');
		console.log('[4chan sounds player]', post)
		console.error(err);
	}
};

function parseFileName (filename, image, post, thumb, imageMD5) {
	!post && localCounter++;
	filename = filename.replace(/\-/, '/');
	const matches = [];
	let match;
	while ((match = filenameRE.exec(filename)) !== null) {
		matches.push(match);
	}
	const defaultName = matches[0] && matches[0][1] || post || 'Local Sound ' + localCounter;

	return matches.reduce((sounds, match, i) => {
		let src = match[2];
		const id = (post || 'local' + localCounter) + ':' + i;
		const title = match[1].trim() || defaultName + (matches.length > 1 ? ` (${i + 1})` : '');

		try {
			if (src.includes('%')) {
				src = decodeURIComponent(src);
			}

			if (src.match(protocolRE) === null) {
				src = (location.protocol + '//' + src);
			}
		} catch (error) {
			return sounds;
		}

		return sounds.concat({ src, id, title, post, image, filename, thumb, imageMD5 });
	}, []);
}
