`<div class="${ns}-menu dialog ${ns}-dialog" id="menu" tabindex="0" data-type="post" style="position: fixed;">
	${data.sound.post ? `<a class="entry" href="#${data.postIdPrefix + data.sound.post}">Show Post</a>` : ''}
	<div class="entry has-submenu" @entry-focus='playlist.loadTags("${data.sound.id}")' @entry-blur='playlist.abortTags("${data.sound.id}")'>
		Details
		<div class="dialog submenu tags-dialog" @click.stop="" data-sound-id="${data.sound.id}" style="inset: 0px auto auto 100%;">
			${Player.playlist.tagsDialogTemplate(data.sound)}
		</div>
	</div>
	<div class="entry has-submenu">
		Open
		<div class="dialog submenu" style="inset: 0px auto auto 100%;">
			<a class="entry" href="${data.sound.image}" target="_blank">Image</a>
			<a class="entry" href="${data.sound.src}" target="_blank">Sound</a>
		</div>
	</div>
	<div class="entry has-submenu">
		Download
		<div class="dialog submenu" style="inset: 0px auto auto 100%;">
			<a class="entry" href="#" @click.prevent='tools.download("${_.escAttr(data.sound.image, true)}", "${_.escAttr(data.sound.filename, true)}")'>Image</a>
			<a class="entry" href="#" @click.prevent='tools.download("${_.escAttr(data.sound.src, true)}", "${_.escAttr(data.sound.name, true)}")'>Sound</a>
		</div>
	</div>
	<div class="entry has-submenu">
		Filter
		<div class="dialog submenu" style="inset: 0px auto auto 100%;">
			${data.sound.imageMD5 ? `<a class="entry" href="#" @click.prevent='playlist.addFilter("${data.sound.imageMD5}")'>Image</a>` : ''}
			<a class="entry" href="#" @click.prevent='playlist.addFilter("${_.escAttr(data.sound.src, true).replace(/^(https?\:)?\/\//, '')}")'>Sound</a>
		</div>
	</div>
	<a class="entry" href="#" @click.prevent='remove("${data.sound.id}")'>Remove</a>
</div>`
