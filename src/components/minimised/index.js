module.exports = {
	_showingPIP: false,

	initialize: function () {
		if (isChanX) {
			Player.userTemplate.maintain(Player.minimised, 'chanXTemplate', [ 'chanXControls' ], [ 'show', 'hide', 'stop' ]);
		}
		Player.on('rendered', Player.minimised.render);
		Player.on('show', Player.minimised.hidePIP);
		Player.on('hide', Player.minimised.showPIP);
		Player.on('stop', Player.minimised.hidePIP);
		Player.on('playsound', Player.minimised.showPIP);
	},

	render: function () {
		if (Player.container && isChanX) {
			let container = document.querySelector(`.${ns}-chan-x-controls`);
			// Create the element if it doesn't exist.
			// Set the user template and control events on it to make all the buttons work.
			if (!container) {
				container = _.elementBefore(`<span class="${ns}-chan-x-controls ${ns}-col-auto ${ns}-align-center"></span>`, document.querySelector('#shortcuts').firstElementChild);
			}

			if (Player.config.chanXControls === 'never' || Player.config.chanXControls === 'closed' && !Player.isHidden) {
				return container.innerHTML = '';
			}

			// Render the contents.
			_.elementHTML(container, Player.userTemplate.build({
				template: Player.config.chanXTemplate,
				location: '4chan-X-controls',
				sound: Player.playing,
				replacements: {
					'prev-button': `<a href="#" class="${ns}-media-control ${ns}-previous-button ${ns}-hover-fill" @click='previous({"force":true}):prevent'>${Icons.skipStart} ${Icons.skipStartFill}</a>`,
					'play-button': `<a href="#" class="${ns}-media-control ${ns}-play-button ${ns}-hover-fill ${!Player.audio || Player.audio.paused ? `${ns}-play` : ''}" @click="togglePlay:prevent">${Icons.play} ${Icons.pause} ${Icons.playFill} ${Icons.pauseFill}</a>`,
					'next-button': `<a href="#" class="${ns}-media-control ${ns}-next-button ${ns}-hover-fill" @click='next({"force":true}):prevent'>${Icons.skipEnd} ${Icons.skipEndFill} </a>`,
					'sound-current-time': `<span class="${ns}-current-time">0:00</span>`,
					'sound-duration': `<span class="${ns}-duration">0:00</span>`
				}
			}));
		}
	},

	/**
	 * Move the image to a picture in picture like thumnail.
	 */
	showPIP: function () {
		if (!Player.isHidden || !Player.config.pip || !Player.playing || Player.minimised._showingPIP) {
			return;
		}
		Player.minimised._showingPIP = true;
		const image = document.querySelector(`.${ns}-image-link`);
		document.body.appendChild(image);
		image.classList.add(`${ns}-pip`);
		image.style.bottom = (Player.position.getHeaderOffset().bottom + 10) + 'px';
		// Show the player again when the image is clicked.
		image.addEventListener('click', Player.minimised._handleImageClick);
	},

	/**
	 * Move the image back to the player.
	 */
	hidePIP: function () {
		Player.minimised._showingPIP = false;
		const image = document.querySelector(`.${ns}-image-link`);
		const controls = Player.$(`.${ns}-controls`);
		controls.parentNode.insertBefore(document.querySelector(`.${ns}-image-link`), controls);
		image.classList.remove(`${ns}-pip`);
		image.style.bottom = null;
		image.removeEventListener('click', Player.minimised._handleImageClick);
	},

	_handleImageClick: e => {
		e.preventDefault();
		Player.show();
	}
};
