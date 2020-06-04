(Player.threads.displayThreads || []).map(thread => `
	<tr>
		<td>
			<a href="https://boards.${thread.ws_board ? '4channel' : '4chan'}.org/${thread.board}/thread/${thread.no}">
				>>>/${thread.board}/${thread.no}
			</a>
		</td>
		<td>${thread.sub || ''}</td>
		<td>${thread.replies} / ${thread.images}</td>
		<td>${timeAgo(thread.time)}</td>
		<td>${timeAgo(thread.last_modified)}</td>
	</tr>
`).join('')
