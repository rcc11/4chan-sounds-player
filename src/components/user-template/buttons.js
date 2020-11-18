const { postIdPrefix } = require('../../selectors');

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
		tplName: 'tools',
		class: `${ns}-tools-button`,
		icon: 'fa-gears',
		text: '[T]',
		attrs: [ 'title="Tools"' ]
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
		showIf: data => data.sound.post,
		attrs: data => [
			`class="${ns}-truncate-text"`,
			`href=${'#' + postIdPrefix + data.sound.post}`,
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
			'target="_blank"'
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
			`data-src="${data.sound.src}"`,
			`data-name="${data.sound.title}"`
		]
	},
	{
		tplName: 'filter-image',
		requireSound: true,
		class: `${ns}-filter-link`,
		icon: 'fa-filter',
		text: 'i',
		showIf: data => data.sound.imageMD5,
		attrs: data => [
			'title="Add the image MD5 to the filters."',
			`data-filter="${data.sound.imageMD5}"`
		]
	},
	{
		tplName: 'filter-sound',
		requireSound: true,
		class: `${ns}-filter-link`,
		icon: 'fa-filter',
		text: 's',
		attrs: data => [
			'title="Add the sound URL to the filters."',
			`data-filter="${data.sound.src.replace(/^(https?:)?\/\//, '')}"`
		]
	},
	{
		tplName: 'remove',
		requireSound: true,
		class: `${ns}-remove-link`,
		icon: 'fa-trash-o',
		text: 'r',
		attrs: data => [
			'title="Filter the image."',
			`data-id="${data.sound.id}"`
		]
	},
	{
		tplName: 'menu',
		requireSound: true,
		class: `${ns}-item-menu-button`,
		icon: 'fa-angle-down',
		text: '▼',
		attrs: data => [ `data-id=${data.sound.id}` ]
	},
	{
		tplName: 'view-menu',
		class: `${ns}-view-menu-button`,
		icon: 'fa-angle-down',
		text: '▾',
		attrs: [ 'href="javascript:;"' ]
	}
];
