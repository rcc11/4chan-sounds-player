Object.keys(Player.threads.displayThreads).reduce((rows, board) => {
	return rows.concat(Player.threads.displayThreads[board].map(thread => `
		<tr>
			<td>
				<a class="quotelink" href="//boards.${thread.ws_board ? '4channel' : '4chan'}.org/${thread.board}/thread/${thread.no}#p${thread.no}" target="_blank">
					>>>/${thread.board}/${thread.no}
				</a>
			</td>
			<td>${thread.sub || ''}</td>
			<td>${thread.replies} / ${thread.images}</td>
			<td>${_.timeAgo(thread.time)}</td>
			<td>${_.timeAgo(thread.last_modified)}</td>
		</tr>
	`))
}, []).join('')
