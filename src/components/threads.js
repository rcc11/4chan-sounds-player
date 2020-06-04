const { parseFileName } = require('../file_parser');
const { get } = require('../api');

const boardsURL = 'https://a.4cdn.org/boards.json';
const catalogURL = 'https://a.4cdn.org/%s/catalog.json';

module.exports = {
	boardList: null,
	soundThreads: null,
	displayThreads: [],
	selectedBoards: [ 'a', 'v', 'k', 'jp', 'trash' ],
	showAllBoards: false,

	delegatedEvents: {
		click: {
			[`.${ns}-threads-button`]: 'threads.toggle',
			[`.${ns}-fetch-threads-link`]: 'threads.fetch',
			[`.${ns}-all-boards-link`]: 'threads.toggleBoardList'
		},
		keyup: {
			[`.${ns}-threads-filter`]: e => Player.threads.filter(e.eventTarget.value)
		},
		change: {
			[`.${ns}-threads input[type=checkbox]`]: 'threads.toggleBoard'
		}
	},

	initialize: function () {
		Player.on('show', Player.threads._initialFetch);
		Player.on('view', Player.threads._initialFetch);
	},

	/**
	 * Fetch the threads when the threads view is opened for the first time.
	 */
	_initialFetch: function () {
		if (Player.container && Player.config.viewStyle === 'threads' && Player.threads.boardList === null) {
			Player.threads.fetchBoards(true);
		}
	},

	render: function () {
		if (Player.container) {
			Player.$(`.${ns}-threads`).innerHTML = Player.templates.threads();
		}
	},

	/**
	 * Render just the threads.
	 */
	renderTable: function () {
		Player.$(`.${ns}-threads-body`).innerHTML = Player.templates.threadList();
	},

	/**
	 * Render just the board selection.
	 */
	renderBoards: function () {
		Player.$(`.${ns}-thread-board-list`).innerHTML = Player.templates.threadBoards();
	},

	/**
	 * Toggle the threads view.
	 */
	toggle: function (e) {
		e && e.preventDefault();
		if (Player.config.viewStyle === 'threads') {
			Player.playlist.restore();
		} else {
			Player.display.setViewStyle('threads');
		}
	},

	/**
	 * Switch between showing just the selected boards and all boards.
	 */
	toggleBoardList: function () {
		Player.threads.showAllBoards = !Player.threads.showAllBoards;
		Player.$(`.${ns}-all-boards-link`).innerHTML = Player.threads.showAllBoards ? 'Selected Only' : 'Show All';
		Player.threads.renderBoards();
	},

	/**
	 * Select/deselect a board.
	 */
	toggleBoard: function (e) {
		const board = e.eventTarget.value;
		const selected = e.eventTarget.checked;
		if (selected) {
			!Player.threads.selectedBoards.includes(board) && Player.threads.selectedBoards.push(board);
		} else {
			Player.threads.selectedBoards = Player.threads.selectedBoards.filter(b => b !== board);
		}
	},

	/**
	 * Fetch the board list from the 4chan API.
	 */
	fetchBoards: async function (fetchThreads) {
		Player.threads.loading = true;
		Player.threads.render();
		Player.threads.boardList = (await get(boardsURL)).boards;
		if (fetchThreads) {
			Player.threads.fetch();
		} else {
			Player.threads.loading = false;
			Player.threads.render();
		}
	},

	/**
	 * Fetch the catalog for each selected board and search for sounds in OPs.
	 */
	fetch: async function (e) {
		e && e.preventDefault();
		Player.threads.loading = true;
		Player.threads.render();
		if (!Player.threads.boardList) {
			try {
				await Player.threads.fetchBoards();
			} catch (err) {
				_logError('Failed to fetch the boards configuration.');
				console.error(err);
				return;
			}
		}
		const allThreads = [];
		try {
			await Promise.all(Player.threads.selectedBoards.map(async board => {
				const boardConf = Player.threads.boardList.find(boardConf => boardConf.board === board);
				if (!boardConf) {
					return;
				}
				const pages = boardConf && await get(catalogURL.replace('%s', board));
				(pages || []).forEach(({ page, threads }) => {
					allThreads.push(...threads.map(thread => Object.assign(thread, { board, page, ws_board: boardConf.ws_board })));
				});
			}));

			Player.threads.soundThreads = allThreads.filter(thread => {
				const sounds = parseFileName(thread.filename, `https://i.4cdn.org/${thread.board}/${thread.tim}${thread.ext}`, thread.no, `https://i.4cdn.org/${thread.board}/${thread.tim}s${thread.ext}`, thread.md5);
				return sounds.length;
			});
		} catch (err) {
			_logError('Failed to search for sounds threads.');
			console.error(err);
		}
		Player.threads.loading = false;
		Player.threads.filter(Player.$(`.${ns}-threads-filter`).value, true);
		Player.threads.render();
	},

	/**
	 * Apply the filter input to the already fetched threads.
	 */
	filter: function (search, skipRender) {
		Player.threads.filterValue = search || '';
		if (Player.threads.soundThreads === null) {
			return;
		}
		if (!search) {
			Player.threads.displayThreads = Player.threads.soundThreads;
		}
		Player.threads.displayThreads = Player.threads.soundThreads.filter(thread => {
			return thread.sub && thread.sub.includes(search) || thread.com && thread.com.includes(search);
		});
		!skipRender && Player.threads.renderTable();
	}
};
