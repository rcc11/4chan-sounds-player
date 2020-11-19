const _ = module.exports;

module.exports.set = function set(object, path, value) {
	const props = path.split('.');
	const lastProp = props.pop();
	const setOn = props.reduce((obj, k) => obj[k] || (obj[k] = {}), object);
	setOn && (setOn[lastProp] = value);
	return object;
};

module.exports.get = function get(object, path, dflt) {
	if (typeof path !== 'string') {
		return dflt;
	}
	const props = path.split('.');
	const lastProp = props.pop();
	const parent = props.reduce((obj, k) => obj && obj[k], object);
	return parent && Object.prototype.hasOwnProperty.call(parent, lastProp)
		? parent[lastProp]
		: dflt;
};

/**
 * Check two values are equal. Arrays/Objects are deep checked.
 */
module.exports.isEqual = function isEqual(a, b, strict = true) {
	if (typeof a !== typeof b) {
		return false;
	}
	if (Array.isArray(a, b)) {
		return a === b || a.length === b.length && a.every((_a, i) => isEqual(_a, b[i]));
	}
	if (a && b && typeof a === 'object' && a !== b) {
		const allKeys = Object.keys(a);
		allKeys.push(...Object.keys(b).filter(k => !allKeys.includes(k)));
		return allKeys.every(key => _.isEqual(a[key], b[key]));
	}
	// eslint-disable-next-line eqeqeq
	return strict ? a === b : a == b;
};

module.exports.toDuration = function toDuration(number) {
	number = Math.floor(number || 0);
	let [ seconds, minutes, hours ] = _duration(0, number);
	seconds < 10 && (seconds = '0' + seconds);
	return (hours ? hours + ':' : '') + minutes + ':' + seconds;
};

module.exports.timeAgo = function timeAgo(date) {
	const [ seconds, minutes, hours, days, weeks ] = _duration(Math.floor(date), Math.floor(Date.now() / 1000));
	/* _eslint-disable indent */
	return weeks > 1 ? weeks + ' weeks ago'
		: days > 0 ? days + (days === 1 ? ' day' : ' days') + ' ago'
		: hours > 0 ? hours + (hours === 1 ? ' hour' : ' hours') + ' ago'
		: minutes > 0 ? minutes + (minutes === 1 ? ' minute' : ' minutes') + ' ago'
		: seconds + (seconds === 1 ? ' second' : ' seconds') + ' ago';
	/* eslint-enable indent */
};

function _duration(from, to) {
	const diff = Math.max(0, to - from);
	return [
		diff % 60,
		Math.floor(diff / 60) % 60,
		Math.floor(diff / 60 / 60) % 24,
		Math.floor(diff / 60 / 60 / 24) % 7,
		Math.floor(diff / 60 / 60 / 24 / 7)
	];
}

module.exports.element = function element(html, parent, events = {}) {
	const container = document.createElement('div');
	container.innerHTML = html;
	const el = container.children[0];
	parent && parent.appendChild(el);
	for (let event in events) {
		el.addEventListener(event, events[event]);
	}
	return el;
};

module.exports.elementBefore = function elementBefore(html, before, events = {}) {
	const el = _.element(html, null, events);
	before.parentNode.insertBefore(el, before);
	return el;
};

module.exports.noDefault = (f, ...args) => e => {
	e.preventDefault();
	const func = typeof f === 'function' ? f : _.get(Player, f);
	func(e, ...args);
};
