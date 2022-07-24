`<span>
	<br>Complete!<br>
	${is4chan ? '<a href="#" @click.prevent="tools.addCreatedToQR">Post</a> - ' : ''}
	<a href="#" @click.prevent="tools.addCreatedToPlayer">Add</a> -
	<a href="${Player.tools._createdImageURL}" download="${Player.tools._createdImage.name}" title="${Player.tools._createdImage.name}">Download</a>
</span>`