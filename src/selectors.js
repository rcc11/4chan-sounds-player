module.exports = {
	'4chan': {
		postIdPrefix: 'p',
		posts: '.post',
		// For 4chan there's native / 4chan X / 4chan X with file info formatting
		filename: {
			'.fileText .file-info .fnfull': 'textContent',
			'.fileText .file-info > a': 'textContent',
			'.fileText > a': 'title',
			'.fileText': 'textContent'
		},
		thumb: '.fileThumb',
		expandedImage: isChanX ? '.full-image' : '.expanded-thumb, .expandedWebm',
		hoverImage: isChanX ? '#ihover' : '#image-hover',
		playLink: {
			class: '',
			text: Icons.playFill,
			relative: '.fileText a',
			position: 'afterend',
			prependText: ' ',
			unfilterText: Icons.filter
		},
		// Deliberately missing dots because this is used to set the class
		styleFetcher: 'post reply style-fetcher',
		limitWidthOf: '.thread > .postContainer'
	},
	FoolFuuka: {
		postIdPrefix: '',
		posts: 'article',
		// For the archive the OP and reply selector differs
		filename: {
			'.thread_image_box .post_file_filename': 'textContent',
			'.post_file_filename': 'title'
		},
		thumb: '.thread_image_link',
		playLink: {
			class: 'btnr',
			text: 'Play',
			relative: '.post_controls',
			position: 'beforeend',
			unfilterText: 'Add'
		},
		styleFetcher: 'post_wrapper style-fetcher',
		limitWidthOf: '.posts > article.post'
	},
	Fuuka: {
		postIdPrefix: 'p',
		posts: '.content > div, td.reply',
		filename: {
			':scope > span': 'textContent'
		},
		filenameParser: v => v.split(', ').slice(2).join(', '),
		thumb: '.thumb',
		playLink: {
			class: '',
			text: 'play',
			relative: 'br:nth-of-type(2)',
			position: 'beforebegin',
			prependText: ' [',
			appendText: ']',
			unfilterText: 'add'
		},
		styleFetcher: 'reply style-fetcher',
		limitWidthOf: '.content > div, .content > table'
	}
}[Site];
