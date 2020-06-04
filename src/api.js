const cache = {};

module.exports = {
	get
};

async function get(url) {
	return new Promise(function (resolve, reject) {
		const xhr = new XMLHttpRequest();
		xhr.open('GET', url);
		xhr.responseType = 'json';
		if (cache[url]) {
			xhr.setRequestHeader('If-Modified-Since', cache[url].lastModified);
		}
		xhr.addEventListener('load', () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				cache[url] = { lastModified: xhr.getResponseHeader('last-modified'), response: xhr.response };
			}
			resolve(xhr.status === 304 ? cache[url].response : xhr.response);
		});
		xhr.addEventListener('error', reject);
		xhr.send();
	});
}
