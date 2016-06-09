import { xhr } from "../common";

/**
 * Fetches list of currencies for given date
 * @param date {Date} date
 * @returns {string[][]} array of 2-dimensional arrays describing currencies
 */
export default async function(date) {

	date = date.toISOString().substr(0, 10);

	var response = await xhr({
		method: 'GET',
		url: '/currencies/' + date,
	});

	if(response.status < 200 || response.status > 399) {
		throw new Error('Bad request status: ' + response.status + ' ' + response.statusText);
	}

	response = JSON.parse(response.payload);

	return response.currencies;
}
