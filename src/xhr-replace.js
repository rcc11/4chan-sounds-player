let autoRestore = false;

function toGM(restore) {
	autoRestore = +restore || false;
	XMLHttpRequest = xhrGM;
};
 function toNative() {
	autoRestore = false;
	XMLHttpRequest = xhrNative;
};

const xhrNative = XMLHttpRequest;
const xhrGM = function() {
	if (typeof autoRestore === 'number' && --autoRestore == 0) {
		toNative();
	}
	let method, url, headers = {}, mime;
	this.open = (m, u) => {
		method = m;
		url = u;
	};
	this.setRequestHeader = (name, value) => headers[name] = value;
	this.getAllResponseHeaders = () => this.responseHeaders;
	this.getResponseHeader = name => this._responseHeaders[name.toLowerCase()];
	this.overrideMimeType = m => mime = m;
	this.send = data => {
		GM.xmlHttpRequest({
			method,
			url,
			headers,
			data,
			responseType: this.responseType,
			onload: data => {
				Object.assign(this, data);
				this._responseHeaders = (data.responseHeaders || '').split('\n').reduce((headers, h) => {
					let [ name, ...val ] = h.split(': ');
					headers[name.toLowerCase()] = val.join(': ');
					return headers;
				}, {});
				this.responseText = data.responseText;
				this.onload(this)
			},
			onerror: this.onerror,
			onreadystatechange: this.onreadystatechange,
			ontimeout: this.ontimeout,
			timeout: this.timeout,
			overrideMimeType: mime
		});
	};
	this.onload = null;
	return this;
};

module.exports.toGM = toGM;
module.exports.toNative = toNative;