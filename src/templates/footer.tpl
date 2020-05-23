Player.config.footerTemplate
	.replace(/%p/g, Player.currentIndex || 0)
	.replace(/%t/g, Player.sounds.length)
	.replace(/postlink(:"([^"]+)")?/g, function (full, _, text) {
		return Player.playing
			? `<a href="#${(is4chan ? 'p' : '') + Player.playing.id}">${text || 'Post'}</a>`
			: '';
	})
	.replace(/imagelink(:"([^"]+)")?/g, function (full, _, text) {
		return Player.playing
			? `<a href="${Player.playing.image}" target="_blank">${text || 'Image'}</a>`
			: '';
	})
	.replace(/soundlink(:"([^"]+)")?/g, function (full, _, text) {
		return Player.playing
			? `<a href="${Player.playing.src}" target="_blank">${text || 'Sound'}</a>`
			: '';
	})
+ `<div class="${ns}-expander"></div>`