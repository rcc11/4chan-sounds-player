(Player.threads.boardList || []).map(board => {
	let checked = Player.threads.selectedBoards.includes(board.board);
	return !checked && !Player.threads.showAllBoards
		? ''
		: `<label>
			<input type="checkbox" value="${board.board}" ${checked ? 'checked' : ''}>
			/${board.board}/
		</label>`
}).join('')