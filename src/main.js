(function() {
	'use strict';

	let isChanX;

	const ns = 'fc-sounds';

	function _logError(message, type = 'error') {
		console.error(message);
		document.dispatchEvent(new CustomEvent("CreateNotification", {
			bubbles: true,
			detail: {
				type: type,
				content: message,
				lifetime: 5
			}
		}));
	}

	function _set(object, path, value) {
		const props = path.split('.');
		const lastProp = props.pop(); 
		const setOn = props.reduce((obj, k) => obj[k] || (obj[k] = {}), object);
		setOn && (setOn[lastProp] = value);
		return object;
	}

	function _get(object, path, dflt) {
		const props = path.split('.');
		return props.reduce((obj, k) => obj && obj[k], object) || dflt;
	}

	function toDuration(number) {
		number = Math.floor(number || 0);
		let seconds = number % 60;
		const minutes = Math.floor(number / 60) % 60;
		const hours = Math.floor(number / 60 / 60);
		seconds < 10 && (seconds = '0' + seconds);
		return (hours ? hours + ':' : '') + minutes + ':' + seconds;
	}

	/*% settings.js %*/

	/*% player.js %*/

	document.addEventListener('DOMContentLoaded', async function() {
		await Player.initialize();

		parseFiles(document.body);

		const observer = new MutationObserver(function (mutations) {
			mutations.forEach(function (mutation) {
				if (mutation.type === 'childList') {
					mutation.addedNodes.forEach(function (node) {
						if (node.nodeType === Node.ELEMENT_NODE) {
							parseFiles(node);
						}
					});
				}
			});
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
	});

	document.addEventListener('4chanXInitFinished', function () {
		isChanX = true;
		Player.initChanX();
	});

	function parseFiles (target) {
		target.querySelectorAll('.post').forEach(function (post) {
			if (post.parentElement.parentElement.id === 'qp' || post.parentElement.classList.contains('noFile')) {
				return;
			}
			post.querySelectorAll('.file').forEach(function (file) {
				parseFile(file, post);
			});
		});
	};

	function parseFile(file, post) {
		try {
			if (!file.classList.contains('file')) {
				return;
			}

			const fileLink = isChanX
				? file.querySelector('.fileText .file-info > a')
				: file.querySelector('.fileText > a');

			if (!fileLink) {
				return;
			}

			if (!fileLink.href) {
				return;
			}

			let fileName = null;

			if (isChanX) {
				[
					file.querySelector('.fileText .file-info .fnfull'),
					file.querySelector('.fileText .file-info > a')
				].some(function (node) {
					return node && (fileName = node.textContent);
				});
			} else {
				[
					file.querySelector('.fileText'),
					file.querySelector('.fileText > a')
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

			const id = post.id.slice(1);
			const name = match[1] || id;
			const fileThumb = post.querySelector('.fileThumb');
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

			for (let item of Player.settings.allow) {
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
})();
