Player.config.footerTemplate
	.replace(/%v/g, VERSION)
	.replace(/%p/g, Player.playing ? Player.sounds.indexOf(Player.playing) + 1 : 0)
	.replace(/%t/g, Player.sounds.length)
	.replace(/playing:"([^"]*)"/g, Player.playing ? '$1' : '')
	.replace(/(playing|post|image|sound|dlimage|dlsound)link(?:\:"([^"]+)")?/g, function (full, type, userText) {
		if (!Player.playing || type === 'post' && !Player.playing.post) {
			return '';
		}
		const attrs = {
			playing: `href="javascript:;" class="${ns}-playing-jump-link" title="Scroll the playlist currently playing sound."`,
			post: `href="${'#' + (is4chan ? 'p' : '') + Player.playing.post}" title="Jump to the post for the current sound"`,
			image: `href="${Player.playing.image}" target="_blank" title="Open the image in a new tab"`,
			sound: `href="${Player.playing.src}" target="_blank" title="Open the sound in a new tab"`,
			dlimage: `href="javascript:;" class="${ns}-download-link" data-src="${Player.playing.image}" data-name="${Player.playing.filename}" title="Download the image with the original filename"`,
			dlsound: `href="javascript:;" class="${ns}-download-link" data-src="${Player.playing.src}" title="Download the sound"`
		}[type];
		const text = userText
			|| { dlimage: 'Download Image', dlsound: 'Download Sound' }[type]
			|| type[0].toUpperCase() + type.slice(1);
		return `<a ${attrs || ''}>${text}</a>`;
	})
+ `<div class="${ns}-expander"></div>`