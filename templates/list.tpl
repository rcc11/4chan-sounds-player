<% Player.sounds.forEach(sound => { %>
	<li class="<%= ns %>-list-item <%= sound.playing ? 'playing' : '' %>" data-id="<%= sound.id %>">
		<%= sound.title %>
	</li>
<% }) %>