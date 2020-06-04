`<div class="${ns}-heading ${ns}-has-description" title="Search for threads with a sound OP">
	Active Threads
	${!Player.threads.loading ? `- <a class="${ns}-fetch-threads-link ${ns}-heading-action" href="javascript:;">Update</a>` : ''}
</div>
<div style="display: ${Player.threads.loading ? 'block' : 'none' }">Loading</div>
<div style="display: ${Player.threads.loading ? 'none' : 'block' }">
	<div class="${ns}-heading ${ns}-has-description" title="Only includes threads containing the search.">
		Filter
	</div>
	<input type="text" class="${ns}-threads-filter" value="${Player.threads.filterValue || ''}"></input>
	<div class="${ns}-heading">
		Boards - <a class="${ns}-all-boards-link ${ns}-heading-action" href="javascript:;">${Player.threads.showAllBoards ? 'Selected Only' : 'Show All' }</a>
	</div>
	<div class="${ns}-thread-board-list">
		${Player.templates.threadBoards(data)}
	</div>
	<table style="width: 100%">
		<tr>
			<th>Thread</th>
			<th>Subject</th>
			<th>Replies/Images</th>
			<th>Started</th>
			<th>Updated</th>
		<tr>
		<tbody class="${ns}-threads-body">
			${Player.templates.threadList(data)}
		</tbody>
	</table>
</div>`
