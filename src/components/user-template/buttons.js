const { postIdPrefix } = require('../../selectors');

module.exports = [
	{
		property: 'repeat',
		tplName: 'repeat',
		action: 'playlist.toggleRepeat',
		actionMods: '.prevent',
		values: {
			all: { attrs: [ 'title="Repeat All"' ], icon: Icons.arrowRepeat },
			one: { attrs: [ 'title="Repeat One"' ], icon: Icons.arrowClockwise },
			none: { attrs: [ 'title="No Repeat"' ], class: 'muted', icon: Icons.arrowRepeat }
		}
	},
	{
		property: 'shuffle',
		tplName: 'shuffle',
		action: 'playlist.toggleShuffle',
		actionMods: '.prevent',
		values: {
			true: { attrs: [ 'title="Shuffled"' ], icon: Icons.shuffle },
			false: { attrs: [ 'title="Ordered"' ], class: 'muted', icon: Icons.shuffle }
		}
	},
	{
		property: 'viewStyle',
		tplName: 'playlist',
		action: 'playlist.toggleView',
		values: {
			default: { attrs: [ 'title="Player"' ], class: 'muted', icon: () => (Player.playlist._lastView === 'playlist' ? Icons.arrowsExpand : Icons.arrowsCollapse) },
			playlist: { attrs: [ 'title="Hide Playlist"' ], icon: Icons.arrowsExpand },
			image: { attrs: [ 'title="Show Playlist"' ], icon: Icons.arrowsCollapse }
		}
	},
	{
		property: 'hoverImages',
		tplName: 'hover-images',
		action: 'playlist.toggleHoverImages',
		values: {
			true: { attrs: [ 'title="Hover Images Enabled"' ], icon: Icons.image },
			false: { attrs: [ 'title="Hover Images Disabled"' ], class: 'muted', icon: Icons.image }
		}
	},
	{
		tplName: 'add',
		action: 'playlist.selectLocalFiles',
		actionMods: '.prevent',
		icon: Icons.plus,
		attrs: [ 'title="Add local files"' ]
	},
	{
		tplName: 'reload',
		action: 'posts.refresh',
		actionMods: '.prevent',
		icon: Icons.reboot,
		attrs: [ 'title="Reload the playlist"' ]
	},
	{
		property: 'viewStyle',
		tplName: 'settings',
		action: 'settings.toggle()',
		actionMods: '.prevent',
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
		action: 'threads.toggle',
		actionMods: '.prevent',
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
		action: 'tools.toggle',
		actionMods: '.prevent',
		icon: Icons.tools,
		attrs: [ 'title="Tools"' ],
		values: {
			default: { class: 'muted' },
			tools: { }
		}
	},
	{
		tplName: 'close',
		action: 'hide',
		actionMods: '.prevent',
		icon: Icons.close,
		attrs: [ 'title="Hide the player"' ]
	},
	{
		tplName: 'playing',
		requireSound: true,
		action: 'playlist.scrollToPlaying("center")',
		actionMods: '.prevent',
		icon: Icons.musicNoteList,
		attrs: [ 'title="Scroll the playlist to the currently playing sound."' ]
	},
	{
		tplName: 'post',
		requireSound: true,
		icon: Icons.chatRightQuote,
		showIf: data => data.sound.post,
		attrs: data => [
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
		icon: Icons.soundwave,
		attrs: data => [
			`href=${data.sound.src}`,
			'title="Open the sound in a new tab"',
			'target="_blank"'
		]
	},
	{
		tplName: /dl-(image|sound)/,
		requireSound: true,
		action: data => {
			const src = data.sound[data.tplNameMatch[1] === 'image' ? 'image' : 'src'];
			const name = data.sound[data.tplNameMatch[1] === 'image' ? 'filename' : 'name'] || '';
			return `tools.download("${_.escAttr(src, true)}", "${_.escAttr(name, true)}")`;
		},
		actionMods: '.prevent',
		icon: data => data.tplNameMatch[1] === 'image'
			? Icons.fileEarmarkImage
			: Icons.fileEarmarkMusic,
		attrs: data => [
			`title="${data.tplNameMatch[1] === 'image' ? 'Download the image with the original filename' : 'Download the sound'}"`
		]
	},
	{
		tplName: /filter-(image|sound)/,
		requireSound: true,
		action: data => `playlist.addFilter("${data.tplNameMatch[1] === 'image' ? data.sound.imageMD5 : data.sound.src.replace(/^(https?:)?\/\//, '')}")`,
		actionMods: '.prevent',
		icon: Icons.filter,
		showIf: data => data.tplNameMatch[1] === 'sound' || data.sound.imageMD5,
		attrs: data => [
			`title="Add the ${data.tplNameMatch[1] === 'image' ? 'image MD5' : 'sound URL'} to the filters."`,
		]
	},
	{
		tplName: 'remove',
		requireSound: true,
		action: data => `remove("${data.sound.id}")`,
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
		action: data => `playlist.handleItemMenu($event, "${data.sound.id}")`,
		actionMods: '.prevent.stop',
		icon: Icons.chevronDown
	},
	{
		tplName: 'view-menu',
		action: 'display.showMenu($event.currentTarget, "views")',
		actionMods: '.prevent.stop',
		icon: Icons.chevronDown,
		attrs: [ 'title="Switch View"' ]
	},
	{
		tplName: 'theme-menu',
		action: 'display.showMenu($event.currentTarget, "themes")',
		actionMods: '.prevent.stop',
		icon: Icons.layoutTextWindow,
		attrs: [ 'title="Switch Theme"' ]
	},
	{
		tplName: 'untz',
		action: 'display.untz',
		icon: Icons.speaker,
		attrs: [ 'title="UNTZ"' ]
	}
];
