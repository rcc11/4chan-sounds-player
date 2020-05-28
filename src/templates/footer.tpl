Player.config.footerTemplate
	.replace(/%v/g, VERSION)
	.replace(/%p/g, Player.playing ? Player.sounds.indexOf(Player.playing) + 1 : 0)
	.replace(/%t/g, Player.sounds.length)
	.replace(/(playing|post|image|sound)link(?:\:"([^"]+)")?/g, function (full, type, text) {
		if (!Player.playing) {
			return '';
		}
		const href = {
			playing: 'javascript:;',
			post: '#' + (is4chan ? 'p' : '') + Player.playing.id,
			image: Player.playing.image,
			sound: Player.playing.src
		}[type];
		const attrs = {
			playing: `class="${ns}-playing-jump-link"`,
			image: 'target="_blank"',
			sound: 'target="_blank"'
		}[type];
		const defaultText = type[0].toUpperCase() + type.slice(1);
		return Player.playing
			? `<a href="${href}" ${attrs || ''}>${text || defaultText}</a>`
			: '';
	})
+ `<div class="${ns}-expander"></div>`