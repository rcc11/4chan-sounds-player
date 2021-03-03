const eventNames = [
	// Inputs/Forms
	'change', 'focus', 'blur', 'focusin', 'focusout', 'reset', 'submit',
	// View
	'fullscreenchange', 'fullscreenerror', 'resize', 'scroll',
	// Keyboard
	'keydown', 'keyup',
	// Clicks
	'auxclick', 'click', 'contextmenu', 'dblclick',
	// Mouse
	'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseup',
	// Custom pointer dragging
	'pointdrag', 'pointdragstart', 'pointdragend',
	// Touch
	'touchcancel', 'touchend', 'touchmove', 'touchstart',
	// Dragging
	'drag', 'dragend', 'dragenter', 'dragstart', 'dragleave', 'dragover', 'drop',
	// Media
	'canplay', 'canplaythrough', 'complete', 'duration-change', 'emptied', 'ended', 'loadeddata', 'loadedmetadata',
	'pause', 'play', 'playing', 'ratechange', 'seeked', 'seeking', 'stalled', 'suspend', 'timeupdate', 'volumechange', 'waiting'
];
const evtSelector = eventNames.map(e => `[\\@${e}]`).join(',');

module.exports = {
	atRoot: [ 'on', 'off', 'trigger' ],

	// Holder of event handlers.
	_events: { },

	initialize: function () {
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
	apply: function (element) {
		// Find all elements with event attributes, including the given element.
		const els = Array.from(element.querySelectorAll(evtSelector));
		element.matches(evtSelector) && els.unshift(element);
		els.forEach(el => {
			for (let { name, value } of el.attributes) {
				const evt = name[0] === '@' && name.slice(1);
				if (evt) {
					Player.events.set(el, evt, value);
				}
			}
		});
	},

	set(el, evt, value) {
		// Remove listeners already set.
		let listeners = el._eventListeners || (el._eventListeners = {});
		listeners[evt] || (listeners[evt] = []);
		listeners[evt].forEach(l => el.removeEventListener(evt, l));
		// Events are defined in the format `func1("arg1",...):mod1:modN`
		for (let spec of value.split(/\s*;\s*/)) {
			const [ _spec, handler, argString, modsString ] = spec.match(/^([^(:]+)?(\(.*\))?(?::(.*))?$/);
			const mods = modsString && modsString.split(':').reduce((m, n) => {
				const isArgs = n[0] === '[';
				m[isArgs ? 'args' : n] = isArgs ? JSON.parse(n) : n;
				return m;
			}, {}) || {};
			// Args are any JSON value, where "evt.property" signifies the event being passed and an optional property path.
			const args = argString && JSON.parse('[' + argString.slice(1, -1) + ']');
			const eventArgs = (args || []).reduce((a, arg, i) => a.concat(arg.startsWith && arg.startsWith('evt') ? [ [ i, arg.slice(4) ] ] : []), []);
			const f = handler && Player.getHandler(handler.trim());
			// Wrap the handler to handle prevent/stop/args.
			const needsWrapping = mods.prevent || mods.stop || mods.disabled || args;
			const listener = !needsWrapping ? f : e => {
				if (mods.disabled && e.currentTarget.classList.contains('disabled')) {
					return;
				}
				mods.prevent && e.preventDefault();
				mods.stop && e.stopPropagation();
				eventArgs.forEach(([ idx, path ]) => args.splice(idx, 1, _.get(e, path)));
				f && f.apply(null, args || [ e ]);
			};
			if (!listener || handler && !f) {
				console.error('[4chan sounds player] Invalid event', evt, spec, el);
			}
			// Point drag is a special case to handle pointer dragging.
			if (evt === 'pointdrag') {
				const downListener = e => {
					el._pointdragstart && el._pointdragstart(e);
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
				};
				el.addEventListener('pointerdown', downListener);
				listeners.pointerdown || (listeners.pointerdown = []);
				listeners.pointerdown.push(downListener);
			} else if (evt === 'pointdragstart' || evt === 'pointdragend') {
				el[`_${evt}`] = listener;
			} else {
				el.addEventListener(evt, listener, mods);
				listeners[evt].push(listener);
			}
		}
	},

	/**
	 * Create an event listener on the player.
	 *
	 * @param {String} evt The name of the events.
	 * @param {function} handler The handler function.
	 */
	on: function (evt, handler) {
		Player.events._events[evt] || (Player.events._events[evt] = []);
		Player.events._events[evt].push(handler);
	},

	/**
	 * Remove an event listener on the player.
	 *
	 * @param {String} evt The name of the events.
	 * @param {function} handler The handler function.
	 */
	off: function (evt, handler) {
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
	trigger: async function (evt, ...data) {
		const events = Player.events._events[evt] || [];
		for (let handler of events) {
			await handler(...data);
		}
	},

	clearMousedown: function (e) {
		if (Player._mousedown) {
			Player._mousedown.releasePointerCapture(e.pointerId);
			Player._mousedownMoveEl.removeEventListener('pointermove', Player._mousedownListener);
			Player._mousedown.removeEventListener('pointerleave', Player._mousedownListener);
			Player._mousedown._pointdragend && Player._mousedown._pointdragend(e);
			Player._mousedown = Player._mousedownListener = null;
		}
	}
};
