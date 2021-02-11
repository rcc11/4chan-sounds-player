const { postIdPrefix } = require('../../selectors');
const themesMenuTemplate = require('./templates/themes_menu.tpl');
const viewsMenuTemplate = require('./templates/views_menu.tpl');

module.exports = [
	{
		property: 'repeat',
		tplName: 'repeat',
		class: `${ns}-repeat-button`,
		values: {
			all: { attrs: [ 'title="Repeat All"' ], icon: Icons.arrowRepeat },
			one: { attrs: [ 'title="Repeat One"' ], icon: Icons.arrowClockwise },
			none: { attrs: [ 'title="No Repeat"' ], class: 'muted', icon: Icons.arrowRepeat }
		},
		action: e => {
			e.preventDefault();
			const values = [ 'all', 'one', 'none' ];
			const current = values.indexOf(Player.config.repeat);
			Player.set('repeat', values[(current + 4) % 3]);
		}
	},
	{
		property: 'shuffle',
		tplName: 'shuffle',
		class: `${ns}-shuffle-button`,
		values: {
			true: { attrs: [ 'title="Shuffled"' ], icon: Icons.shuffle },
			false: { attrs: [ 'title="Ordered"' ], class: 'muted', icon: Icons.shuffle }
		},
		action: e => {
			e.preventDefault();
			Player.set('shuffle', !Player.config.shuffle);
			Player.header.render();

			// Update the play order.
			if (!Player.config.shuffle) {
				Player.sounds.sort((a, b) => Player.compareIds(a.id, b.id));
			} else {
				const sounds = Player.sounds;
				for (let i = sounds.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[ sounds[i], sounds[j] ] = [ sounds[j], sounds[i] ];
				}
			}
			Player.trigger('order');
		}
	},
	{
		property: 'viewStyle',
		tplName: 'playlist',
		class: `${ns}-viewStyle-button`,
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
		class: `${ns}-hoverImages-button`,
		action: 'playlist.toggleHoverImages',
		values: {
			true: { attrs: [ 'title="Hover Images Enabled"' ], icon: Icons.image },
			false: { attrs: [ 'title="Hover Images Disabled"' ], class: 'muted', icon: Icons.image }
		}
	},
	{
		tplName: 'add',
		class: `${ns}-add-button`,
		action: _.noDefault(() => Player.$(`.${ns}-add-local-file-input`).click()),
		icon: Icons.plus,
		attrs: [ 'title="Add local files"' ]
	},
	{
		tplName: 'reload',
		class: `${ns}-reload-button`,
		action: _.noDefault('playlist.refresh'),
		icon: Icons.reboot,
		attrs: [ 'title="Reload the playlist"' ]
	},
	{
		property: 'viewStyle',
		tplName: 'settings',
		class: `${ns}-config-button`,
		action: _.noDefault(() => Player.settings.toggle()),
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
		action: 'threads.toggle',
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
		action: 'tools.toggle',
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
		action: 'hide',
		icon: Icons.close,
		attrs: [ 'title="Hide the player"' ]
	},
	{
		tplName: 'playing',
		requireSound: true,
		class: `${ns}-playing-jump-link`,
		action: () => Player.playlist.scrollToPlaying('center'),
		icon: Icons.musicNoteList,
		attrs: [ 'title="Scroll the playlist currently playing sound."' ]
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
		href: data => data.sound.src,
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
		class: `${ns}-download-link`,
		icon: data => data.tplNameMatch[1] === 'image'
			? Icons.fileEarmarkImage
			: Icons.fileEarmarkMusic,
		attrs: data => [
			`title="${data.tplNameMatch[1] === 'image' ? 'Download the image with the original filename' : 'Download the sound'}"`,
			`data-src="${data.sound[data.tplNameMatch[1] === 'image' ? 'image' : 'src']}"`,
			`data-src="${data.sound[data.tplNameMatch[1] === 'image' ? 'filename' : 'name']}"`
		],
		action: e => {
			const src = e.eventTarget.getAttribute('data-src');
			const name = e.eventTarget.getAttribute('data-name') || new URL(src).pathname.split('/').pop();

			GM.xmlHttpRequest({
				method: 'GET',
				url: src,
				responseType: 'blob',
				onload: response => {
					const a = _.element(`<a href="${URL.createObjectURL(response.response)}" download="${name}" rel="noopener" target="_blank"></a>`);
					a.click();
					URL.revokeObjectURL(a.href);
				},
				onerror: response => Player.logError('There was an error downloading.', response, 'warning')
			});
		}
	},
	{
		tplName: /filter-(image|sound)/,
		requireSound: true,
		class: `${ns}-filter-link`,
		icon: Icons.filter,
		showIf: data => data.tplNameMatch[1] === 'sound' || data.sound.imageMD5,
		attrs: data => [
			`title="Add the ${data.tplNameMatch[1] === 'image' ? 'image MD5' : 'sound URL'} to the filters."`,
			`data-filter="${data.tplNameMatch[1] === 'image' ? data.sound.imageMD5 : data.sound.src.replace(/^(https?:)?\/\//, '')}"`
		],
		action: e => {
			e.preventDefault();
			let filter = e.eventTarget.getAttribute('data-filter');
			filter && Player.set('filters', Player.config.filters.concat(filter));
		}
	},
	{
		tplName: 'remove',
		requireSound: true,
		class: `${ns}-remove-link`,
		icon: Icons.trash,
		attrs: data => [
			'title="Filter the image."',
			`data-id="${data.sound.id}"`
		],
		action: e => {
			const id = e.eventTarget.getAttribute('data-id');
			const sound = id && Player.sounds.find(sound => sound.id === '' + id);
			sound && Player.remove(sound);
		}
	},
	{
		tplName: 'menu',
		requireSound: true,
		class: `${ns}-item-menu-button`,
		action: 'playlist._handleItemMenu',
		icon: Icons.chevronDown,
		attrs: data => [ `data-id=${data.sound.id}` ]
	},
	{
		tplName: 'view-menu',
		class: `${ns}-view-menu-button`,
		icon: Icons.chevronDown,
		attrs: [ 'href="javascript:;"' ],
		action: e => {
			e.preventDefault();
			e.stopPropagation();
			const dialog = _.element(viewsMenuTemplate());
			Player.userTemplate._showMenu(e.eventTarget, dialog);
		}
	},
	{
		tplName: 'theme-menu',
		class: `${ns}-theme-menu-button`,
		icon: Icons.layoutTextWindow,
		attrs: [ 'href="#', 'title="Switch Theme"' ],
		action: e => {
			e.preventDefault();
			e.stopPropagation();
			const dialog = _.element(themesMenuTemplate());
			Player.userTemplate._showMenu(e.eventTarget, dialog);
		}
	}
];
