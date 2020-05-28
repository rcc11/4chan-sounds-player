`<div class="${ns}-item-menu dialog" id="menu" tabindex="0" data-type="post" style="top: ${data.top}px; left: ${data.left}px;">
	<a class="${ns}-remove-link entry focused" href="javascript:;">Remove</a>
	<a class="entry" href="#${(is4chan ? 'p' : '') + data.sound.post}">Show Post</a>
	<a class="entry" href="${data.sound.image}" target="_blank">Open Image</a>
	<a class="entry" href="${data.sound.src}" target="_blank">Open Sound</a>
	<a class="${ns}-filter-link entry" data-filter="${data.sound.imageMD5}">Filter Image</a>
	<a class="${ns}-filter-link entry" data-filter="${data.sound.src.replace(/^(https?\:)?\/\//, '')}">Filter Sound</a>
</div>`
