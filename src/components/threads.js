const { parseFileName } = require('../file_parser');
const { get } = require('../api');

const maxSavedBoards = 10;
const boardsURL = 'https://a.4cdn.org/boards.json';
const catalogURL = 'https://a.4cdn.org/%s/catalog.json';

module.exports = {
	boardList: null,
	soundThreads: null,
	displayThreads: {},
	selectedBoards: Board ? [ Board ] : [ 'a' ],
	showAllBoards: false,

	delegatedEvents: {
		click: {
			[`.${ns}-fetch-threads-link`]: 'threads.fetch',
			[`.${ns}-all-boards-link`]: 'threads.toggleBoardList',
			[`.${ns}-threads-view-style`]: 'threads.toggleView'
		},
		keyup: {
			[`.${ns}-threads-filter`]: e => Player.threads.filter(e.eventTarget.value)
		},
		change: {
			[`.${ns}-threads input[type=checkbox]`]: 'threads.toggleBoard'
		}
	},

	initialize: async function () {
		Player.threads.hasParser = is4chan && typeof Parser !== 'undefined';
		// If the native Parser hasn't been intialised chuck customSpoiler on it so we can call it for threads.
		// You shouldn't do things like this. We can fall back to the table view if it breaks though.
		if (Player.threads.hasParser && !Parser.customSpoiler) {
			Parser.customSpoiler = {};
		}

		Player.on('show', Player.threads._initialFetch);
		Player.on('view', Player.threads._initialFetch);
		Player.on('rendered', Player.threads.afterRender);
		Player.on('config:threadsViewStyle', Player.threads.render);
		try {
			const savedBoards = await GM.getValue('threads_board_selection');
			savedBoards && (Player.threads.selectedBoards = savedBoards.split(','));
		} catch (err) {
			// Leave it defaulted to the current board.
		}
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
			Player.threads.afterRender();
		}
	},

	/**
	 * Render the threads and apply the board styling after the view is rendered.
	 */
	afterRender: function () {
		const threadList = Player.$(`.${ns}-thread-list`);
		if (threadList) {
			const bodyStyle = document.defaultView.getComputedStyle(document.body);
			threadList.style.background = bodyStyle.backgroundColor;
			threadList.style.backgroundImage = bodyStyle.backgroundImage;
			threadList.style.backgroundRepeat = bodyStyle.backgroundRepeat;
			threadList.style.backgroundPosition = bodyStyle.backgroundPosition;
		}
		Player.threads.renderThreads();
	},

	/**
	 * Switch between board and table view.
	 */
	toggleView: function (e) {
		e.preventDefault();
		Player.set('threadsViewStyle', e.eventTarget.getAttribute('data-style'));
	},

	/**
	 * Render just the threads.
	 */
	renderThreads: function () {
		if (!Player.threads.hasParser || Player.config.threadsViewStyle === 'table') {
			Player.$(`.${ns}-threads-body`).innerHTML = Player.templates.threadList();
		} else {
			try {
				const list = Player.$(`.${ns}-thread-list`);
				list.innerHTML = '';
				for (let board in Player.threads.displayThreads) {
					// Create a board title
					const boardConf = Player.threads.boardList.find(boardConf => boardConf.board === board);
					const boardTitle = `/${boardConf.board}/ - ${boardConf.title}`;
					_.element(`<div class="boardBanner"><div class="boardTitle">${boardTitle}</div></div>`, list);

					// Add each thread for the board
					const threads = Player.threads.displayThreads[board];
					for (let i = 0; i < threads.length; i++) {
						list.appendChild(Parser.buildHTMLFromJSON.call(Parser, threads[i], threads[i].board, true, true));

						// Add a line under each thread
						_.element('<hr style="clear: both">', list);
					}
				}
			} catch (err) {
				Player.logError('Unable to display the threads board view.', err, 'warning');
				// If there was an error fall back to the table view.
				Player.set('threadsViewStyle', 'table');
				Player.renderThreads();
			}
		}
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
	toggleBoardList: function (e) {
		e.preventDefault();
		Player.threads.showAllBoards = !Player.threads.showAllBoards;
		Player.$(`.${ns}-all-boards-link`).innerHTML = Player.threads.showAllBoards ? 'Selected Only' : 'Show All';
		Player.threads.renderBoards();
	},

	/**
	 * Select/deselect a board.
	 */
	toggleBoard: async function (e) {
		const board = e.eventTarget.value;
		const selected = e.eventTarget.checked;
		if (selected) {
			!Player.threads.selectedBoards.includes(board) && Player.threads.selectedBoards.unshift(board);
		} else {
			Player.threads.selectedBoards = Player.threads.selectedBoards.filter(b => b !== board);
		}
		await GM.setValue('threads_board_selection', Player.threads.selectedBoards.slice(0, maxSavedBoards).join(','));
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
				return Player.logError('Failed fetching the boards list.', err);
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
				const sounds = parseFileName(thread.filename, `https://i.4cdn.org/${thread.board}/${thread.tim}${thread.ext}`, thread.no, `https://i.4cdn.org/${thread.board}/${thread.tim}s${thread.ext}`, thread.md5, true);
				return sounds.length;
			});
		} catch (err) {
			Player.logError('Failed searching for sounds threads.', err);
		}
		Player.threads.loading = false;
		Player.threads.filter(Player.$(`.${ns}-threads-filter`).value, true);
		Player.threads.render();
	},

	/**
	 * Apply the filter input to the already fetched threads.
	 */
	filter: function (search, skipRender) {
		search = search.toLowerCase();
		Player.threads.filterValue = search || '';
		if (Player.threads.soundThreads === null) {
			return;
		}
		Player.threads.displayThreads = Player.threads.soundThreads.reduce((threadsByBoard, thread) => {
			if (!search || thread.sub && thread.sub.toLowerCase().includes(search) || thread.com && thread.com.toLowerCase().includes(search)) {
				threadsByBoard[thread.board] || (threadsByBoard[thread.board] = []);
				threadsByBoard[thread.board].push(thread);
			}
			return threadsByBoard;
		}, {});
		!skipRender && Player.threads.renderThreads();
	}
};
