export function _set(object, path, value) {
	const props = path.split('.');
	const lastProp = props.pop(); 
	const setOn = props.reduce((obj, k) => obj[k] || (obj[k] = {}), object);
	setOn && (setOn[lastProp] = value);
	return object;
}

export function _get(object, path, dflt) {
	const props = path.split('.');
	return props.reduce((obj, k) => obj && obj[k], object) || dflt;
}

export function toDuration(number) {
	number = Math.floor(number || 0);
	let seconds = number % 60;
	const minutes = Math.floor(number / 60) % 60;
	const hours = Math.floor(number / 60 / 60);
	seconds < 10 && (seconds = '0' + seconds);
	return (hours ? hours + ':' : '') + minutes + ':' + seconds;
}

export function _mix (to, from) {
	for (let key in from || {}) {
		if (from[key] && typeof from[key] === 'object' && !Array.isArray(from[key])) {
			to[key] || (to[key] = {});
			_mix(to[key], from[key]);
		} else {
			to[key] = from[key];
		}
	}
}
