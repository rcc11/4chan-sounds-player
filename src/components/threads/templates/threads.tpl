`<div class="${ns}-heading lined">
	Active Threads
	${!Player.threads.loading ? `- <a class="${ns}-heading-action" @click.prevent="threads.fetch" href="#">Update</a>` : ''}
</div>

<div style="margin: 0 .25rem; display: ${Player.threads.loading ? 'block' : 'none'}">Loading</div>

<div style="margin: 0 .25rem; display: ${Player.threads.loading ? 'none' : 'block'}">
	<div class="${ns}-heading">
		Filter
	</div>
	<input
		type="text"
		class="${ns}-threads-filter"
		@keyup='threads.filter($event.target.value)'
		value="${Player.threads.filterValue || ''}"
	/>

	<div class="${ns}-heading">
		Boards -
		<a class="${ns}-all-boards-link ${ns}-heading-action" @click.prevent="threads.toggleBoardList" href="#">
			${Player.threads.showAllBoards ? 'Selected Only' : 'Show All'}
		</a>
	</div>
	<div class="${ns}-thread-board-list">
		${Player.threads.boardsTemplate(data)}
	</div>

	${!Player.threads.hasParser
		? ''
		: `<div class="${ns}-heading" style="text-align: center">
			${Player.config.threadsViewStyle !== 'table'
				? `<a class="${ns}-heading-action" @click.prevent='set("threadsViewStyle","table")' href="#">Table</a>`
				: `<span>Table</span>`}
			|
			${Player.config.threadsViewStyle !== 'board'
				? `<a class="${ns}-heading-action" @click.prevent='set("threadsViewStyle","board")' href="#">Board</a>`
				: `<span>Board</span>`}
		</div>`
	}
	${
		!Player.threads.hasParser || Player.config.threadsViewStyle === 'table'
		? `<table>
				<tr>
					<th>Thread</th>
					<th>Subject</th>
					<th>Replies/Images</th>
					<th>Started</th>
					<th>Updated</th>
				<tr>
				<tbody class="${ns}-threads-body"></tbody>
			</table>`
		: `<div class="${ns}-thread-list"></div>`
	}
</div>`
