`<span>
	<br>Complete!<br>'
	${is4chan ? '<a href="#" @click="tools.addCreatedToQR:prevent">Post</a> - ' : ''}
	<a href="#" @click="tools.addCreatedToPlayer:prevent">Add</a> -
	<a href="${Player.tools._createdImageURL}" download="${Player.tools._createdImage.name}" title="${Player.tools._createdImage.name}">Download</a>
</span>`