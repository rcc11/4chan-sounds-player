`<a class="${ns}-image-link" style="height: 128px" target="_blank">
	<img class="${ns}-image"></img>
	<video class="${ns}-video"></video>
</a>
<div class="${ns}-controls ${ns}-row">
	${Player.templates.controls({ data })}
</div>
<div class="${ns}-list-container" style="height: 100px">
	<ul class="${ns}-list">
		${Player.templates.list({ data })}
	</ul>
</div>`