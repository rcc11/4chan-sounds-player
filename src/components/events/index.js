module.exports = {
	atRoot: [ 'on', 'off', 'trigger' ],

	// Holder of event handlers.
	_events: { },

	initialize() {
		const eventLocations = { Player, ...Player.components };
		const audio = [];

		for (let comp of Object.values(eventLocations)) {
			comp.audioEvents && audio.push(comp.audioEvents);
		}

		// Clear mousedown listeners when the mouse/touch is released.
		document.body.addEventListener('pointerup', Player.events.clearMousedown);
		document.body.addEventListener('pointercancel', Player.events.clearMousedown);

		Player.on('rendered', function () {
			// Wire up audio events.
			for (let eventList of audio) {
				for (let evt in eventList) {
					let handlers = Array.isArray(eventList[evt]) ? eventList[evt] : [ eventList[evt] ];
					handlers.forEach(handler => Player.audio.addEventListener(evt, Player.getHandler(handler)));
				}
			}
		});
	},

	/**
	 * Add event listeners from event attributes on an elements and all it's decendents.
	 *
	 * @param {Element} element The element to set event listeners for.
	 */
	apply(element) {
		// Find all elements with event attributes, including the given element.
		const eventAttrs = [];
		const elAttrs = document.evaluate('.//attribute::*[starts-with(name(), "@")]', element, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		for (let i = 0; i < elAttrs.snapshotLength; i++) {
			eventAttrs.push(elAttrs.snapshotItem(i));
		}
		const childAttrs = document.evaluate('.//*/attribute::*[starts-with(name(), "@")]', element, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		for (let i = 0; i < childAttrs.snapshotLength; i++) {
			eventAttrs.push(childAttrs.snapshotItem(i));
		}

		for (let attr of eventAttrs) {
			Player.events.set(attr.ownerElement, attr.name.slice(1), attr.value);
		}
	},

	set(el, attr, action) {
		const [ evt, ...modsArr ] = attr.split('.');
		const mods = modsArr.reduce((m, n) => {
			m[n] = true;
			return m;
		}, {});

		// Remove listener already set.
		const listeners = el._eventListeners || (el._eventListeners = {});
		listeners[evt] && el.removeEventListener(evt, listeners[evt]);

		// eslint-disable-next-line no-new-func
		const handler = action && (Player.getHandler(action.trim()) || Function('$event', 'Player', `with (Player) { ${action} }`));
		const listener = function (evt) {
			if (mods.prevent) {
				evt.preventDefault();
			}
			if (mods.stop) {
				evt.stopPropagation();
			}
			if (mods.disabled && evt.currentTarget.classList.contains('disabled')) {
				evt.currentTarget.classList.contains('disabled');
			}

			return handler && handler.call(this, evt, Player);
		};

		// Point drag is a special case to handle pointer dragging.
		if (evt === 'pointdrag') {
			const downListener = e => {
				// No idea why but this seems to fire twice. So avoid that.
				if (!e._dragInit) {
					e._dragInit = true;
					listeners.pointdragstart && listeners.pointdragstart(e);
					if (!e.preventDrag) {
						el.setPointerCapture(e.pointerId);
						Player._mousedown = el;
						Player._mousedownListener = listener;
						Player._mousedownMoveEl = mods.unbound ? document.documentElement : el;
						Player._mousedownMoveEl.addEventListener('pointermove', listener, mods);
						el.addEventListener('pointerleave', listener, mods);
						mods.boxed && el.addEventListener('pointerleave', Player.events.clearMousedown);
						!mods.move && listener(e);
					}
				}
			};
			el.addEventListener('pointerdown', downListener);
			listeners.pointerdown = downListener;
		} else if (evt === 'pointdragstart' || evt === 'pointdragend') {
			listeners[evt] = listener;
		} else {
			el.addEventListener(evt, listener, mods);
			listeners[evt] = listener;
		}
	},

	/**
	 * Create an event listener on the player.
	 *
	 * @param {String} evt The name of the events.
	 * @param {function} handler The handler function.
	 */
	on(evt, handler) {
		const evts = Array.isArray(evt) ? evt : [ evt ];
		evts.forEach(evt => {
			Player.events._events[evt] || (Player.events._events[evt] = []);
			Player.events._events[evt].push(handler);
		});
	},

	/**
	 * Remove an event listener on the player.
	 *
	 * @param {String} evt The name of the events.
	 * @param {function} handler The handler function.
	 */
	off(evt, handler) {
		const index = Player.events._events[evt] && Player.events._events[evt].indexOf(handler);
		if (index > -1) {
			Player.events._events[evt].splice(index, 1);
		}
	},

	/**
	 * Trigger an event on the player.
	 *
	 * @param {String} evt The name of the events.
	 * @param {*} data Data passed to the handler.
	 */
	async trigger(evt, ...data) {
		const events = Player.events._events[evt] || [];
		for (let handler of events) {
			await handler(...data);
		}
	},

	clearMousedown(e) {
		if (Player._mousedown) {
			Player._mousedown.releasePointerCapture(e.pointerId);
			Player._mousedownMoveEl.removeEventListener('pointermove', Player._mousedownListener);
			Player._mousedown.removeEventListener('pointerleave', Player._mousedownListener);
			Player._mousedown._eventListeners.pointdragend && Player._mousedown._eventListeners.pointdragend(e);
			Player._mousedown = Player._mousedownListener = null;
		}
	}
};
