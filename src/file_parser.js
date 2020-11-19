const selectors = require('./selectors');

const protocolRE = /^(https?:)?\/\//;
const filenameRE = /(.*?)[[({](?:audio|sound)[ =:|$](.*?)[\])}]/gi;

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
		: target.querySelectorAll(selectors.posts);

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
		let filenameLocations = selectors.filename;

		Object.keys(filenameLocations).some(function (selector) {
			const node = post.querySelector(selector);
			return node && (filename = node[filenameLocations[selector]]);
		});

		if (!filename) {
			return;
		}

		selectors.filenameParser && (filename = selectors.filenameParser(filename));

		const postID = post.id.slice(selectors.postIdPrefix.length);
		const fileThumb = post.querySelector(selectors.thumb).closest('a');
		const imageSrc = fileThumb && fileThumb.href;
		const thumbImg = fileThumb && fileThumb.querySelector('img');
		const thumbSrc = thumbImg && thumbImg.src;
		const imageMD5 = Site === 'Fuuka'
			? post.querySelector(':scope > a:nth-of-type(3)').href.split('/').pop()
			: thumbImg && thumbImg.getAttribute('data-md5');

		const sounds = parseFileName(filename, imageSrc, postID, thumbSrc, imageMD5);

		if (!sounds.length) {
			return;
		}

		// Create a play link
		const firstID = sounds[0].id;
		const linkInfo = selectors.playLink;
		const content = `<a href="javascript:;" class="${linkInfo.class}" data-id="${firstID}">${linkInfo.text}</a>`;

		const playLinkRelative = linkInfo.relative && post.querySelector(linkInfo.relative);

		linkInfo.prependText && _addPlayLinkText(linkInfo.prependText, linkInfo.before, playLinkRelative);
		playLink = linkInfo.before
			? _.elementBefore(content, playLinkRelative)
			: _.element(content, playLinkRelative);
		linkInfo.appendText && _addPlayLinkText(linkInfo.appendText, linkInfo.before, playLinkRelative);
		playLink.onclick = () => Player.play(Player.sounds.find(sound => sound.id === firstID));

		// Don't add sounds from inline quotes of posts in the thread
		sounds.forEach(sound => Player.add(sound, skipRender));
		return sounds.length > 0;
	} catch (err) {
		Player.logError('There was an issue parsing the files. Please check the console for details.', err);
		console.log('[4chan sounds player]', post);
	}
}

function _addPlayLinkText(text, before, relative) {
	const node = text && document.createTextNode(text);
	if (before) {
		relative.parentNode.insertBefore(node, relative);
	} else {
		relative.appendChild(node);
	}
}

function parseFileName(filename, image, post, thumb, imageMD5, bypassVerification) {
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

			if (!src.startsWith('blob:') && src.match(protocolRE) === null) {
				src = (location.protocol + '//' + src);
			}
		} catch (error) {
			return sounds;
		}

		const sound = { src, id, title, post, image, filename, thumb, imageMD5 };
		if (bypassVerification || Player.acceptedSound(sound)) {
			sounds.push(sound);
		}
		return sounds;
	}, []);
}
