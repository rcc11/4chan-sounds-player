const cache = {};

module.exports = {
	get
};

async function get(url) {
	return new Promise(function (resolve, reject) {
		const headers = {};
		if (cache[url]) {
			headers['If-Modified-Since'] = cache[url].lastModified;
		}
		GM.xmlHttpRequest({
			method: 'GET',
			url,
			headers,
			responseType: 'json',
			onload: response => {
				if (response.status >= 200 && response.status < 300) {
					cache[url] = { lastModified: response.responseHeaders['last-modified'], response: response.response };
				}
				resolve(response.status === 304 ? cache[url].response : response.response);
			},
			onerror: reject
		});
	});
}
