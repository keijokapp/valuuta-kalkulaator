
/**
 * XHR wrapper functions. Because that's exactly how I like it. 
 * @TODO: return response headers
 * @param {object} request object
 *    method {string} - HTTP method
 *    url {string} - request url
 *    headers {object} - request headers
 *    payload {string} - request body
 * @returns {object} response object
 *    status {number} - status code
 *    statusText {string} - status text
 *    payload {string} - response body
 */
export async function xhr(params) {
	var x = new XMLHttpRequest;
	x.open(typeof params.method === 'string' ? params.method : 'GET', params.url);

	if(typeof params.headers !== 'null' && typeof params.headers !== 'undefined') {
		for(var i in params.headers) {

			// silently skip common unsafe headers to avoid ugly warnings
			if(i.toLowerCase() === 'cookie' || i.toLowerCase() === 'referer') continue;

			x.setRequestHeader(i, params.headers[i]);
		}
	}

	return new Promise((resolve, reject) => {
		x.onload = () => resolve({
			status: x.status,
			statusTest: x.statusText,
			payload: x.responseText
		});
		x.onerror = e => reject(e);
		x.onabort = e => reject(e);
		x.send(typeof params.payload === 'string' ? params.payload : null);
	});
}


