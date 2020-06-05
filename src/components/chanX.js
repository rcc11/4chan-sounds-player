module.exports = {
	initialize: function () {
		if (!isChanX) {
			return;
		}
		// Create a reply element to gather the style from
		const a = createElement('<a></a>', document.body);
		const style = document.defaultView.getComputedStyle(a);
		createElement(`<style>.${ns}-chan-x-controls .${ns}-media-control > div { background: ${style.color} }</style>`, document.head);
		// Clean up the element.
		document.body.removeChild(a);

		// Set up the contents and maintain user template changes.
		Player.userTemplate.maintain(Player.chanX, 'chanXTemplate', [ 'chanXControls' ], [ 'show', 'hide' ]);
		Player.on('rendered', Player.chanX.render);
	},

	render: function () {
		if (Player.container && isChanX) {
			let container = document.querySelector(`.${ns}-chan-x-controls`);
			// Create the element if it doesn't exist.
			// Set the user template and control events on it to make all the buttons work.
			if (!container) {
				container = createElementBefore(`<span class="${ns}-chan-x-controls ${ns}-row"></span>`, document.querySelector('#shortcuts').firstElementChild);
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
	}
};
