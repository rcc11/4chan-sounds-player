(Player.threads.displayThreads || []).map(thread => `
	<tr>
		<td>
			<a class="quotelink" href="//boards.${thread.ws_board ? '4channel' : '4chan'}.org/${thread.board}/thread/${thread.no}#p${thread.no}" target="_blank">
				>>>/${thread.board}/${thread.no}
			</a>
		</td>
		<td>${thread.sub || ''}</td>
		<td>${thread.replies} / ${thread.images}</td>
		<td>${timeAgo(thread.time)}</td>
		<td>${timeAgo(thread.last_modified)}</td>
	</tr>
`).join('')
