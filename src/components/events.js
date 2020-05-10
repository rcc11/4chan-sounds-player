{
	// Holder of event handlers.
	_events: {},

	/**
	 * Create an event listener on the player.
	 *
	 * @param {String} evt The name of the event.
	 * @param {function} handler The handler function.
	 */
	on: function (evt, handler) {
		Player._events[evt] || (Player._events[evt] = []);
		Player._events[evt].push(handler);
	},

	/**
	 * Remove an event listener on the player.
	 *
	 * @param {String} evt The name of the event.
	 * @param {function} handler The handler function.
	 */
	off: function (evt, handler) {
		const index = Player._events[evt] && Player._events[evt].indexOf(handler);
		if (index > -1) {
			Player._events[evt].splice(index, 1);
		}
	},

	/**
	 * Trigger an event on the player.
	 *
	 * @param {String} evt The name of the event.
	 * @param {*} data Data passed to the handler.
	 */
	trigger: async function (evt, ...data) {
		const events = Player._events[evt] || [];
		for (let handler of events) {
			if (await handler(...data) === false) {
				return;
			}
		}
	}
}