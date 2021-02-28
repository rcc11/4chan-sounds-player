`${Player.tools.downloadTemplate()}
${Player.tools.createTemplate()}

<div class="${ns}-heading lined" style="margin-top: 1rem;">Encode / Decode URL</div>
<div class="${ns}-row" style="margin: 0 .25rem">
	<div class="${ns}-col">
		<input type="text" class="${ns}-decoded-input w-100" @keyup="tools.handleDecoded" placeholder="https://">
	</div>
	<div class="${ns}-col">
		<input type="text" class="${ns}-encoded-input w-100" @keyup="tools.handleEncoded" placeholder="https%3A%2F%2F">
	</div>
</div>`