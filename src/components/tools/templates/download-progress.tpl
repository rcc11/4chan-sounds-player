`<div class="mb-2">
	<div>
		<a class="${ns}-cancel-download pointer">${Icons.close}</a>
		<span class="${ns}-current-status"></span>
	</div>
	<div class="${ns}-row ${ns}-align-center" ${data.includeImages ? '' : 'style="display: none;"'}>
		<div class="${ns}-col-auto mr-4">${Icons.image}</div>
		<div class="${ns}-col"><div class="${ns}-full-bar"><div class="${ns}-image-bar"></div></div></div>
	</div>
	<div class="${ns}-row ${ns}-align-center" ${data.includeSounds ? '' : 'style="display: none;"'}>
		<div class="${ns}-col-auto mr-4">${Icons.soundwave}</div>
		<div class="${ns}-col"><div class="${ns}-full-bar"><div class="${ns}-sound-bar"></div></div></div>
	</div>
</div>`
