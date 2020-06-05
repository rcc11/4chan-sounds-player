const protocolRE = /^(https?:)?\/\//;
const filenameRE = /(.*?)[[({](?:audio|sound)[ =:|$](.*?)[\])}]/g;

let localCounter = 0;

module.exports = {
	parseFiles,
	parsePost,
	parseFileName
};

function parseFiles(target, postRender) {
	let addedSounds = false;
	let posts = target.classList.contains('post')
		? [ target ]
		: target.querySelectorAll('.post');

	posts.forEach(post => parsePost(post, postRender) && (addedSounds = true));

	if (addedSounds && postRender && Player.container) {
		Player.playlist.render();
	}
}

function parsePost(post, skipRender) {
	try {
		if (post.classList.contains('style-fetcher')) {
			return;
		}
		const parentParent = post.parentElement.parentElement;
		if (parentParent.id === 'qp' || post.parentElement.classList.contains('noFile')) {
			return;
		}

		// If there's a play button this post has already been parsed. Just wire up the link.
		let playLink = post.querySelector(`.${ns}-play-link`);
		if (playLink) {
			const id = playLink.getAttribute('data-id');
			playLink.onclick = () => Player.play(Player.sounds.find(sound => sound.id === id));
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
		const thumbImg = fileThumb && fileThumb.querySelector('img');
		const thumbSrc = thumbImg && thumbImg.src;
		const imageMD5 = thumbImg && thumbImg.getAttribute('data-md5');

		const sounds = parseFileName(filename, imageSrc, postID, thumbSrc, imageMD5);

		if (!sounds.length) {
			return;
		}

		// Create a play link
		const firstID = sounds[0].id;
		const text = is4chan ? 'play' : 'Play';
		const clss = `${ns}-play-link` + (is4chan ? '' : ' btnr');
		let playLinkParent;
		if (is4chan) {
			playLinkParent = post.querySelector('.fileText');
			playLinkParent.appendChild(document.createTextNode(' '));
		} else {
			playLinkParent = post.querySelector('.post_controls');
		}
		playLink = createElement(`<a href="javascript:;" class="${clss}" data-id="${firstID}">${text}</a>`, playLinkParent);
		playLink.onclick = () => Player.play(Player.sounds.find(sound => sound.id === firstID));

		// Don't add sounds from inline quotes of posts in the thread
		sounds.forEach(sound => Player.add(sound, skipRender));
		return sounds.length > 0;
	} catch (err) {
		_logError('There was an issue parsing the files. Please check the console for details.');
		console.log('[4chan sounds player]', post);
		console.error(err);
	}
}

function parseFileName(filename, image, post, thumb, imageMD5) {
	if (!filename) {
		return [];
	}
	filename = filename.replace(/-/, '/');
	const matches = [];
	let match;
	while ((match = filenameRE.exec(filename)) !== null) {
		matches.push(match);
	}
	const defaultName = matches[0] && matches[0][1] || post || 'Local Sound ' + localCounter;
	matches.length && !post && localCounter++;

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
