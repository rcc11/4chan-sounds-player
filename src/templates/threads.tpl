`<div class="${ns}-heading ${ns}-has-description" title="Search for threads with a sound OP">
	Active Threads
	${!Player.threads.loading ? `- <a class="${ns}-fetch-threads-link ${ns}-heading-action" href="#">Update</a>` : ''}
</div>
<div style="display: ${Player.threads.loading ? 'block' : 'none'}">Loading</div>
<div style="display: ${Player.threads.loading ? 'none' : 'block'}">
	<div class="${ns}-heading ${ns}-has-description" title="Only includes threads containing the search.">
		Filter
	</div>
	<input type="text" class="${ns}-threads-filter" value="${Player.threads.filterValue || ''}"></input>
	<div class="${ns}-heading">
		Boards - <a class="${ns}-all-boards-link ${ns}-heading-action" href="#">${Player.threads.showAllBoards ? 'Selected Only' : 'Show All'}</a>
	</div>
	<div class="${ns}-thread-board-list">
		${Player.templates.threadBoards(data)}
	</div>
	${!Player.threads.hasParser
		? ''
		: `<div class="${ns}-heading" style="text-align: center">
			${Player.config.threadsViewStyle !== 'table'
				? `<a class="${ns}-threads-view-style ${ns}-heading-action" style="margin: 0" data-style="table" href="#">Table</a>`
				: `<span>Table</span>`}
			|
			${Player.config.threadsViewStyle !== 'board'
				? `<a class="${ns}-threads-view-style ${ns}-heading-action" style="margin: 0" data-style="board" href="#">Board</a>`
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
