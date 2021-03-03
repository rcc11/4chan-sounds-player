`${Player.tools.downloadTemplate()}
${Player.tools.createTemplate()}

<div class="${ns}-heading lined" style="margin-top: 1rem;">Encode / Decode URL</div>
<div style="margin: 0 .25rem">
	<div class="${ns}-row">
		<input type="text" class="${ns}-col ${ns}-decoded-input" @keyup="tools.handleDecoded" placeholder="https://">
		<input type="text" class="${ns}-col ${ns}-encoded-input" @keyup="tools.handleEncoded" placeholder="https%3A%2F%2F">
	</div>
</div>`