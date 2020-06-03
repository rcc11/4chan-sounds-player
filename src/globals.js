/**
 * Global variables and helpers.
 */

window.ns = 'fc-sounds';

window.is4chan = location.hostname.includes('4chan.org') || location.hostname.includes('4channel.org');
window.isChanX = document.documentElement.classList.contains('fourchan-x');

/**
 * Send an error notification event
 */
window._logError = function (message, type = 'error') {
	console.error(message);
	document.dispatchEvent(new CustomEvent("CreateNotification", {
		bubbles: true,
		detail: {
			type: type,
			content: message,
			lifetime: 5
		}
	}));
};

window._set = function(object, path, value) {
	const props = path.split('.');
	const lastProp = props.pop();
	const setOn = props.reduce((obj, k) => obj[k] || (obj[k] = {}), object);
	setOn && (setOn[lastProp] = value);
	return object;
};

window._get = function(object, path, dflt) {
	const props = path.split('.');
	const lastProp = props.pop();
	const parent = props.reduce((obj, k) => obj && obj[k], object);
	return parent && Object.prototype.hasOwnProperty.call(parent, lastProp)
		? parent[lastProp]
		: dflt;
};

window.toDuration = function(number) {
	number = Math.floor(number || 0);
	let seconds = number % 60;
	const minutes = Math.floor(number / 60) % 60;
	const hours = Math.floor(number / 60 / 60);
	seconds < 10 && (seconds = '0' + seconds);
	return (hours ? hours + ':' : '') + minutes + ':' + seconds;
};

window.createElement = function(html, parent, events = {}) {
	const container = document.createElement('div');
	container.innerHTML = html;
	const el = container.children[0];
	parent && parent.appendChild(el);
	for (let event in events) {
		el.addEventListener(event, events[event]);
	}
	return el;
}