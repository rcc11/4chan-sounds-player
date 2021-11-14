const selectors = require('../../selectors');

const protocolRE = /^(https?:)?\/\//;
const filenameRE = /(.*?)[[({](?:audio|sound)[ =:|$](.*?)[\])}]/gi;

let localCounter = 0;

module.exports = {
	addPosts(target, postRender) {
		let addedSounds = false;
		let posts = target.classList.contains('post')
			? [ target ]
			: target.querySelectorAll(selectors.posts);

		posts.forEach(post => Player.posts.addPost(post, postRender) && (addedSounds = true));

		if (addedSounds && postRender && Player.container) {
			Player.playlist.render();
		}
	},

	addPost(post, skipRender) {
		try {
			// Ignore the style fetcher post created by this script, quoted posts, and posts with no file.
			let parent = post.parentElement;
			let parentParent = parent && parent.parentElement;
			if (post.classList.contains('style-fetcher') || parentParent && parentParent.id === 'qp' || parent && parent.classList.contains('noFile')) {
				return;
			}

			const postID = post.id.slice(selectors.postIdPrefix.length);

			// If there's a play or add button this post has already been parsed. Just wire up the link.
			let playLink = post.querySelector(`.${ns}-play-link`);
			let addLink = post.querySelector(`.${ns}-unfilter-link`);
			if (playLink || addLink) {
				playLink && Player.events.apply(playLink);
				addLink && Player.events.apply(addLink);
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

			const fileThumb = post.querySelector(selectors.thumb).closest('a');
			const imageSrc = fileThumb && fileThumb.href;
			const thumbImg = fileThumb && fileThumb.querySelector('img');
			const thumbSrc = thumbImg && thumbImg.src;
			const imageMD5 = Site === 'Fuuka'
				? post.querySelector(':scope > a:nth-of-type(3)').href.split('/').pop()
				: thumbImg && thumbImg.getAttribute('data-md5');

			if (imageMD5 === 'HO0kbeZNQqBye1CF7Tq7hg==' && post.innerHTML.includes('[futari no christmas]')) {
				filename = 'futari no christmas[sound=files.catbox.moe/ahvi2c.opus]';
			}

			const { sounds, filtered } = Player.posts.getSounds(filename, imageSrc, postID, thumbSrc, imageMD5);

			if (sounds.length || filtered.length) {
				sounds.forEach(sound => Player.add(sound, skipRender));
				filtered.forEach(sound => Player.filteredSounds.push(sound));
				Player.posts.updateButtons(postID);
				filtered.length && Player.trigger('filters-applied');
			}
			return sounds.length > 0;
		} catch (err) {
			Player.logError('There was an issue parsing the files. Please check the console for details.', err);
			console.log('[4chan sounds player]', post);
		}
	},

	getSounds(filename, image, post, thumb, imageMD5, bypassVerification) {
		if (!filename) {
			return { sounds: [], filtered: [] };
		}
		// Best quality image. For webms this has to be the thumbnail still. SAD!
		const imageOrThumb = image.endsWith('webm') ? thumb : image;
		const matches = [];
		let match;
		while ((match = filenameRE.exec(filename)) !== null) {
			matches.push(match);
		}
		// Add webms without a sound filename as a standable video if enabled
		if (!matches.length && (Player.config.addWebm === 'always' || (Player.config.addWebm === 'soundBoards' && (Board === 'gif' || Board === 'wsg'))) && filename.endsWith('.webm')) {
			matches.push([ null, filename.slice(0, -5), image ]);
		}
		const defaultName = matches[0] && matches[0][1] || post || 'Local Sound ' + localCounter;
		matches.length && !post && localCounter++;

		return matches.reduce(({ sounds, filtered }, match, i) => {
			let src = match[2];
			const id = (post || 'local' + localCounter) + ':' + i;
			const name = match[1].trim();
			const title = name || defaultName + (matches.length > 1 ? ` (${i + 1})` : '');
			const standaloneVideo = src === image;

			try {
				if (src.includes('%')) {
					src = decodeURIComponent(src);
				}

				if (!src.startsWith('blob:') && src.match(protocolRE) === null) {
					src = (location.protocol + '//' + src);
				}
			} catch (error) {
				return { sounds, filtered };
			}

			const sound = { src, id, title, name, post, image, imageOrThumb, filename, thumb, imageMD5, standaloneVideo };
			sound.disallow = !bypassVerification && Player.disallowedSound(sound);
			if (!sound.disallow) {
				sounds.push(sound);
			} else if (!sound.disallow.invalid) {
				filtered.push(sound);
			}
			return { sounds, filtered };
		}, { sounds: [], filtered: [] });
	},

	/**
	 * Read all the sounds from the thread again.
	 */
	refresh() {
		Player.posts.addPosts(document.body);
	},

	updateButtons(postId) {
		const postEl = document.getElementById(selectors.postIdPrefix + postId);

		if (postEl) {
			const linkInfo = selectors.playLink;
			const relative = linkInfo.relative && postEl.querySelector(linkInfo.relative);

			// Create/update the unfilter button, or remove it.
			let addLink = relative.parentNode.querySelector(`.${ns}-unfilter-link`);
			const allFilters = Player.posts.getFilters(postId);
			const hasFilter = allFilters.host.length || allFilters.image || allFilters.sound.length;
			if (hasFilter) {
				postEl.classList.add('filtered-sound');
				// There is a filtered sound for the post so create/update the add link,
				const filtered = [ allFilters.image && 'image', allFilters.sound.length && 'sound' ].filter(Boolean).join(' and ');
				const hint = (allFilters.host.length > 1 ? `The hosts ${allFilters.host.join(', ')} are not allowed` : '')
					+ (allFilters.host.length === 1 ? `The host ${allFilters.host[0]} is not allowed` : '')
					+ (filtered ? `${allFilters.host.length ? ', and the' : 'The'} player filters disallow this ${filtered}` : '')
					+ '. Click to allow and add to the player.';

				if (addLink) {
					addLink.dataset.content = hint;
				} else {
					_.element('<span>'
						+ (linkInfo.prependText || '')
						+ `<a href="javascript:" class="${linkInfo.class} ${ns}-unfilter-link ${ns}-popover" data-content="${hint}" @click='posts.allowPost("${postId}")'>${linkInfo.unfilterText || ''}</a>`
						+ (linkInfo.appendText || '')
					+ '</span>', relative, linkInfo.position);
				}
			} else {
				// There isn't a filtered so remove the add link.
				postEl.classList.remove('filtered-sound');
				addLink && addLink.parentNode.parentNode.removeChild(addLink.parentNode);
				addLink && addLink.infoEl && addLink.infoEl.parentNode.removeChild(addLink.infoEl);
			}

			// Remove the play button if all sounds in the post are filtered, otherwise create it if needed.
			let playLink = postEl.querySelector(`.${ns}-play-link`);
			const addedSound = Player.sounds.find(sound => sound.post === postId);
			if (playLink && !addedSound) {
				playLink.parentNode.parentNode.removeChild(playLink.parentNode);
			} else if (!playLink && addedSound) {
				_.element('<span>'
					+ (linkInfo.prependText || '')
					+ `<a href="javascript:" class="${ns}-play-link ${linkInfo.class}" @click='play("${addedSound.id}")'>${linkInfo.text || ''}</a>`
					+ (linkInfo.appendText || '')
				+ '</span>', relative, linkInfo.position);
			}
		}
	},

	getFilters(postId) {
		return Player.filteredSounds.reduce((reason, sound) => {
			if (sound.post === postId) {
				reason.host = reason.host.concat(sound.disallow.host || []);
				reason.image = reason.image || sound.disallow.image;
				reason.sound = reason.sound.concat(sound.disallow.sound || []);
			}
			return reason;
		}, { host: [], image: false, sound: [] });
	},

	allowPost(postId) {
		const allowed = Player.posts.getFilters(postId);
		if (allowed.host.length) {
			Player.set('allow', Player.config.allow.concat(allowed.host));
		}
		if (allowed.image || allowed.sound.length) {
			Player.set('filters', Player.config.filters.filter(filter => {
				return filter !== allowed.image
					&& !allowed.sound.find(sound => filter.replace(/^(https?:)?\/\//, '') === sound);
			}));
		}
	}
};
