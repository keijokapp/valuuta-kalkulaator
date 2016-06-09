import { xhr } from "../common";

/**
 * Fetches results of currency conversion
 * @param date {Date} date
 * @param from {string} currency code
 * @param to {string} currency code
 * @param input {number} input number
 * @returns {object} results object
 */
export default async function(date, from, to, input) {

	date = date.toISOString().substr(0, 10);

	var response = await xhr({
		method: 'GET',
		url: '/currency/' + encodeURIComponent(date)
		+ '/' + encodeURIComponent(from)
		+ '/' + encodeURIComponent(to)
		+ '/' + encodeURIComponent(input)

	})

	if(response.status < 200 || response.status > 399) {
		throw new Error('Bad request status: ' + response.status + ' ' + response.statusText);
	}

	response = JSON.parse(response.payload);

	return response;
}

