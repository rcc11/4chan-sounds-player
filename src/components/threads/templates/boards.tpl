(Player.threads.boardList || []).map(board => {
	let checked = Player.threads.selectedBoards.includes(board.board);
	return !checked && !Player.threads.showAllBoards ? '' : `
		<label>
			<input
				type="checkbox"
				@change='threads.toggleBoard("${board.board}", $event.currentTarget.checked)'
				value="${board.board}"
				${checked ? 'checked' : ''}
			/>
			/${board.board}/
		</label>`
}).join('')