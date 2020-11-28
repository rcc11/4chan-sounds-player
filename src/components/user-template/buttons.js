const { postIdPrefix } = require('../../selectors');

module.exports = [
	{
		property: 'repeat',
		tplName: 'repeat',
		class: `${ns}-repeat-button`,
		values: {
			all: { attrs: [ 'title="Repeat All"' ], icon: Icons.arrowRepeat },
			one: { attrs: [ 'title="Repeat One"' ], icon: Icons.arrowClockwise },
			none: { attrs: [ 'title="No Repeat"' ], class: 'muted', icon: Icons.arrowRepeat }
		}
	},
	{
		property: 'shuffle',
		tplName: 'shuffle',
		class: `${ns}-shuffle-button`,
		values: {
			true: { attrs: [ 'title="Shuffled"' ], icon: Icons.shuffle },
			false: { attrs: [ 'title="Ordered"' ], class: 'muted', icon: Icons.shuffle }
		}
	},
	{
		property: 'viewStyle',
		tplName: 'playlist',
		class: `${ns}-viewStyle-button`,
		values: {
			default: { attrs: [ 'title="Player"' ], class: 'muted', icon: () => (Player.playlist._lastView === 'playlist' ? Icons.arrowsExpand : Icons.arrowsCollapse) },
			playlist: { attrs: [ 'title="Hide Playlist"' ], icon: Icons.arrowsExpand },
			image: { attrs: [ 'title="Show Playlist"' ], icon: Icons.arrowsCollapse }
		}
	},
	{
		property: 'hoverImages',
		tplName: 'hover-images',
		class: `${ns}-hoverImages-button`,
		values: {
			true: { attrs: [ 'title="Hover Images Enabled"' ], icon: Icons.image },
			false: { attrs: [ 'title="Hover Images Disabled"' ], class: 'muted', icon: Icons.image }
		}
	},
	{
		tplName: 'add',
		class: `${ns}-add-button`,
		icon: Icons.plus,
		attrs: [ 'title="Add local files"' ]
	},
	{
		tplName: 'reload',
		class: `${ns}-reload-button`,
		icon: Icons.reboot,
		attrs: [ 'title="Reload the playlist"' ]
	},
	{
		property: 'viewStyle',
		tplName: 'settings',
		class: `${ns}-config-button`,
		icon: Icons.gear,
		attrs: [ 'title="Settings"' ],
		values: {
			default: { class: 'muted' },
			settings: { }
		}
	},
	{
		property: 'viewStyle',
		tplName: 'threads',
		class: `${ns}-threads-button`,
		icon: Icons.search,
		attrs: [ 'title="Threads"' ],
		values: {
			default: { class: 'muted' },
			threads: { }
		}
	},
	{
		property: 'viewStyle',
		tplName: 'tools',
		class: `${ns}-tools-button`,
		icon: Icons.tools,
		attrs: [ 'title="Tools"' ],
		values: {
			default: { class: 'muted' },
			tools: { }
		}
	},
	{
		tplName: 'close',
		class: `${ns}-close-button`,
		icon: Icons.close,
		attrs: [ 'title="Hide the player"' ]
	},
	{
		tplName: 'playing',
		requireSound: true,
		class: `${ns}-playing-jump-link`,
		icon: Icons.musicNoteList,
		attrs: [ 'title="Scroll the playlist currently playing sound."' ]
	},
	{
		tplName: 'post',
		requireSound: true,
		icon: Icons.chatRightQuote,
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
		icon: Icons.image,
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
		icon: Icons.soundwave,
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
		icon: Icons.fileEarmarkImage,
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
		icon: Icons.fileEarmarkMusic,
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
		icon: Icons.filter,
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
		icon: Icons.filter,
		attrs: data => [
			'title="Add the sound URL to the filters."',
			`data-filter="${data.sound.src.replace(/^(https?:)?\/\//, '')}"`
		]
	},
	{
		tplName: 'remove',
		requireSound: true,
		class: `${ns}-remove-link`,
		icon: Icons.trash,
		attrs: data => [
			'title="Filter the image."',
			`data-id="${data.sound.id}"`
		]
	},
	{
		tplName: 'menu',
		requireSound: true,
		class: `${ns}-item-menu-button`,
		icon: Icons.chevronDown,
		attrs: data => [ `data-id=${data.sound.id}` ]
	},
	{
		tplName: 'view-menu',
		class: `${ns}-view-menu-button`,
		icon: Icons.chevronDown,
		attrs: [ 'href="javascript:;"' ]
	}
];
