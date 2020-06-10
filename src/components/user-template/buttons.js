module.exports = [
	{
		property: 'repeat',
		tplName: 'repeat',
		class: `${ns}-repeat-button`,
		values: {
			all: { attrs: [ 'title="Repeat All"' ], text: '[RA]', icon: 'fa-repeat' },
			one: { attrs: [ 'title="Repeat One"' ], text: '[R1]', icon: 'fa-repeat fa-repeat-one' },
			none: { attrs: [ 'title="No Repeat"' ], text: '[R0]', icon: 'fa-repeat disabled' }
		}
	},
	{
		property: 'shuffle',
		tplName: 'shuffle',
		class: `${ns}-shuffle-button`,
		values: {
			true: { attrs: [ 'title="Shuffled"' ], text: '[S]', icon: 'fa-random' },
			false: { attrs: [ 'title="Ordered"' ], text: '[O]', icon: 'fa-random disabled' }
		}
	},
	{
		property: 'viewStyle',
		tplName: 'playlist',
		class: `${ns}-viewStyle-button`,
		values: {
			playlist: { attrs: [ 'title="Hide Playlist"' ], text: '[+]', icon: 'fa-compress' },
			image: { attrs: [ 'title="Show Playlist"' ], text: '[-]', icon: 'fa-expand' }
		}
	},
	{
		property: 'hoverImages',
		tplName: 'hover-images',
		class: `${ns}-hoverImages-button`,
		values: {
			true: { attrs: [ 'title="Hover Images Enabled"' ], text: '[H]', icon: 'fa-picture-o' },
			false: { attrs: [ 'title="Hover Images Disabled"' ], text: '[-]', icon: 'fa-picture-o disabled' }
		}
	},
	{
		tplName: 'add',
		class: `${ns}-add-button`,
		icon: 'fa-plus',
		text: '+',
		attrs: [ 'title="Add local files"' ]
	},
	{
		tplName: 'reload',
		class: `${ns}-reload-button`,
		icon: 'fa-refresh',
		text: '[R]',
		attrs: [ 'title="Reload the playlist"' ]
	},
	{
		tplName: 'settings',
		class: `${ns}-config-button`,
		icon: 'fa-wrench',
		text: '[S]',
		attrs: [ 'title="Settings"' ]
	},
	{
		tplName: 'threads',
		class: `${ns}-threads-button`,
		icon: 'fa-search',
		text: '[T]',
		attrs: [ 'title="Threads"' ]
	},
	{
		tplName: 'close',
		class: `${ns}-close-button`,
		icon: 'fa-times',
		text: 'X',
		attrs: [ 'title="Hide the player"' ]
	},
	{
		tplName: 'playing',
		requireSound: true,
		class: `${ns}-playing-jump-link`,
		text: 'Playing',
		attrs: [ 'title="Scroll the playlist currently playing sound."' ]
	},
	{
		tplName: 'post',
		requireSound: true,
		icon: 'fa-comment-o',
		text: 'Post',
		attrs: data => [
			`href=${'#' + (is4chan ? 'p' : '') + data.sound.post}`,
			'title="Jump to the post for the current sound"'
		]
	},
	{
		tplName: 'image',
		requireSound: true,
		icon: 'fa-image',
		text: 'i',
		attrs: data => [
			`href=${data.sound.image}`,
			'title="Open the image in a new tab"',
			'target="_blank"'
		]
	},
	{
		tplName: 'sound',
		requireSound: true,
		href: data => data.sound.src,
		icon: 'fa-volume-up',
		text: 's',
		attrs: data => [
			`href=${data.sound.src}`,
			'title="Open the sound in a new tab"',
			'target="blank"'
		]
	},
	{
		tplName: 'dl-image',
		requireSound: true,
		class: `${ns}-download-link`,
		icon: 'fa-file-image-o',
		text: 'i',
		attrs: data => [
			'title="Download the image with the original filename"',
			`data-src="${data.sound.image}"`,
			`data-name="${data.sound.filename}"`
		]
	},
	{
		tplName: 'dl-sound',
		requireSound: true,
		class: `${ns}-download-link`,
		icon: 'fa-file-sound-o',
		text: 's',
		attrs: data => [
			'title="Download the sound"',
			`data-src="${data.sound.src}"`
		]
	},
	{
		tplName: 'menu',
		requireSound: true,
		class: `${ns}-item-menu-button`,
		icon: 'fa-angle-down',
		text: '▼',
		attrs: data => [ `data-id=${data.sound.id}` ]
	}
];
