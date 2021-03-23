`${Player.tools.createTemplate()}
${Player.tools.downloadTemplate()}

<div class="${ns}-heading lined mt-5">Encode / Decode URL</div>
<div class="m-2">
	<div class="${ns}-row">
		<input type="text" class="${ns}-col ${ns}-decoded-input" @keyup="tools.handleDecoded" placeholder="https://">
		<input type="text" class="${ns}-col ${ns}-encoded-input" @keyup="tools.handleEncoded" placeholder="https%3A%2F%2F">
	</div>
</div>`