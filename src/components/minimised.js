module.exports = {
	_showingPIP: false,

	initialize: function () {
		if (isChanX) {
			// Create a reply element to gather the style from
			const a = createElement('<a></a>', document.body);
			const style = document.defaultView.getComputedStyle(a);
			createElement(`<style>.${ns}-chan-x-controls .${ns}-media-control > div { background: ${style.color} }</style>`, document.head);
			// Clean up the element.
			document.body.removeChild(a);

			// Set up the contents and maintain user template changes.
			Player.userTemplate.maintain(Player.minimised, 'chanXTemplate', [ 'chanXControls' ], [ 'show', 'hide' ]);
		}
		Player.on('rendered', Player.minimised.render);
		Player.on('show', Player.minimised.hidePIP);
		Player.on('hide', Player.minimised.showPIP);
		Player.on('playsound', Player.minimised.showPIP);
	},

	render: function () {
		if (Player.container && isChanX) {
			let container = document.querySelector(`.${ns}-chan-x-controls`);
			// Create the element if it doesn't exist.
			// Set the user template and control events on it to make all the buttons work.
			if (!container) {
				container = createElementBefore(`<span class="${ns}-chan-x-controls ${ns}-col-auto"></span>`, document.querySelector('#shortcuts').firstElementChild);
				Player.events.addDelegatedListeners(container, {
					click: [ Player.userTemplate.delegatedEvents.click, Player.controls.delegatedEvents.click ]
				});
			}

			if (Player.config.chanXControls === 'never' || Player.config.chanXControls === 'closed' && !Player.isHidden) {
				return container.innerHTML = '';
			}

			// Render the contents.
			container.innerHTML = Player.userTemplate.build({
				template: Player.config.chanXTemplate,
				location: '4chan-X-controls',
				sound: Player.playing,
				replacements: {
					'prev-button': `<div class="${ns}-media-control ${ns}-previous-button"><div class="${ns}-previous-button-display"></div></div>`,
					'play-button': `<div class="${ns}-media-control ${ns}-play-button"><div class="${ns}-play-button-display ${!Player.audio || Player.audio.paused ? `${ns}-play` : ''}"></div></div>`,
					'next-button': `<div class="${ns}-media-control ${ns}-next-button"><div class="${ns}-next-button-display"></div></div>`,
					'sound-current-time': `<span class="${ns}-current-time">0:00</span>`,
					'sound-duration': `<span class="${ns}-duration">0:00</span>`
				}
			});
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
		image.addEventListener('click', Player.show);
	},

	/**
	 * Move the image back to the player.
	 */
	hidePIP: function () {
		Player.minimised._showingPIP = false;
		const image = document.querySelector(`.${ns}-image-link`);
		Player.$(`.${ns}-media`).insertBefore(document.querySelector(`.${ns}-image-link`), Player.$(`.${ns}-controls`));
		image.classList.remove(`${ns}-pip`);
		image.style.bottom = null;
		image.removeEventListener('click', Player.show);
	}
};
