/**
 * Global variables and helpers.
 */

window.ns = 'fc-sounds';

window.is4chan = location.hostname.includes('4chan.org') || location.hostname.includes('4channel.org');
window.isChanX = document.documentElement && document.documentElement.classList.contains('fourchan-x');
window.Board = location.pathname.split('/')[1];

// Determine what type of site this is. Default to FoolFuuka as the most common archiver.
window.Site = is4chan ? '4chan'
	: ((document.head.querySelector('meta[name="generator"]') || {}).content || '').includes('FoolFuuka') ? 'FoolFuuka'
	: ((document.head.querySelector('meta[name="description"]') || {}).content || '').includes('Fuuka') ? 'Fuuka'
	: 'FoolFuuka';

class PlayerError extends Error {
	constructor(msg, type, err) {
		super(msg);
		this.reason = msg;
		this.type = type;
		this.error = err;
	}
}
window.PlayerError = PlayerError;
