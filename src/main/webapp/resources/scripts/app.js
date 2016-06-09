(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

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

var xhr = exports.xhr = function () {
	var ref = _asyncToGenerator(function* (params) {
		var x = new XMLHttpRequest();
		x.open(typeof params.method === 'string' ? params.method : 'GET', params.url);

		if (typeof params.headers !== 'null' && typeof params.headers !== 'undefined') {
			for (var i in params.headers) {

				// silently skip common unsafe headers to avoid ugly warnings
				if (i.toLowerCase() === 'cookie' || i.toLowerCase() === 'referer') continue;

				x.setRequestHeader(i, params.headers[i]);
			}
		}

		return new Promise(function (resolve, reject) {
			x.onload = function () {
				return resolve({
					status: x.status,
					statusTest: x.statusText,
					payload: x.responseText
				});
			};
			x.onerror = function (e) {
				return reject(e);
			};
			x.onabort = function (e) {
				return reject(e);
			};
			x.send(typeof params.payload === 'string' ? params.payload : null);
		});
	});

	return function xhr(_x) {
		return ref.apply(this, arguments);
	};
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

},{}],2:[function(require,module,exports){
"use strict";

var loadCurrencyList = function () {
	var ref = _asyncToGenerator(function* () {

		try {
			var date = getSelectedDate();
		} catch (e) {
			setError('Vigane kuupäev');
			return;
		}

		console.log('Loading list for date ', date);

		var currencies = yield (0, _loadCurrencies2.default)(date);

		var elements = new Array(currencies.length);
		for (var i = 0, l = currencies.length; i < l; i++) {
			var currency = currencies[i];
			if (currency[1]) {
				elements[i] = "<option value=\"" + currency[0] + "\">" + currency[0] + " - " + currency[1] + "</option>";
			} else {
				elements[i] = "<option value=\"" + currency[0] + "\">" + currency[0] + "</option>";
			}
		}

		$('#currency-from, #currency-to').html(elements.join(''));
	});

	return function loadCurrencyList() {
		return ref.apply(this, arguments);
	};
}();

var loadResult = function () {
	var ref = _asyncToGenerator(function* () {
		try {
			var date = getSelectedDate();
		} catch (e) {
			setError('Vigane kuupäev');
			return;
		}

		// yeah, if field is empty it will be handled as 0
		// that's not *too* bad I think
		var amount = Math.floor($('#currency-amount').val() * 10000);
		if (!Number.isInteger(amount)) {
			setError('Vigane sisend');
			return;
		}

		var from = $('#currency-from').val();
		var to = $('#currency-to').val();

		var response = yield (0, _loadResult2.default)(date, from, to, amount);

		if (Object.keys(response.result).length === 0) {
			setError('Valitud valuuta kurssi ei leitud');
			return;
		}

		var elements = new Array();
		for (var i in response.result) {
			elements.push("<tr>\n\t\t\t<td><span class=\"result-source\">" + i + "</span></td>\n\t\t\t<td>\n\t\t\t\t<span class=\"result-value\">" + response.result[i] / 10000 + "</span>\n\t\t\t\t<span class=\"result-currency\">" + to + "</span>\n\t\t\t</td>\n\t\t</tr>");
		}

		$('#result-table').html(elements.join(''));
	});

	return function loadResult() {
		return ref.apply(this, arguments);
	};
}();

var _loadCurrencies = require("./services/loadCurrencies");

var _loadCurrencies2 = _interopRequireDefault(_loadCurrencies);

var _loadResult = require("./services/loadResult");

var _loadResult2 = _interopRequireDefault(_loadResult);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function setError(e) {
	$('#result-table').html("<tr><td><span class=\"result-error\">" + e + "</span></td></tr>");
}

function getSelectedDate() {
	var date = $('#currency-date').val();

	var m = date.match(/^([0-9]{2})\.([0-9]{2})\.([0-9]{4})$/);

	if (!m) throw new Error('Invalid date');
	date = Date.parse(m[3] + '-' + m[2] + '-' + m[1]);
	if (isNaN(date)) throw new Error('Invalid date');

	return new Date(date);
}

window.addEventListener('load', function () {
	$('#currency-date').datepicker({ dateFormat: 'dd.mm.yy' });

	$('#currency-date').change(function () {
		loadCurrencyList().catch(function (e) {
			console.error('Shit happened: ', e);
		});
	});

	$('#currency-form').submit(function () {
		loadResult().catch(function (e) {
			console.error('Shit happened: ', e);
		});
	});

	var date = new Date();

	$('#currency-date').val(('0' + date.getDate()).substr(-2) + '.' + ('0' + date.getMonth()).substr(-2) + '.' + ('000' + date.getFullYear()).substr(-4));

	// for some reason the above statement does not trigger change event
	$('#currency-date').change();
});

},{"./services/loadCurrencies":3,"./services/loadResult":4}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _common = require('../common');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * Fetches list of currencies for given date
 * @param date {Date} date
 * @returns {string[][]} array of 2-dimensional arrays describing currencies
 */

exports.default = function () {
	var ref = _asyncToGenerator(function* (date) {

		date = date.toISOString().substr(0, 10);

		var response = yield (0, _common.xhr)({
			method: 'GET',
			url: '/currencies/' + date
		});

		if (response.status < 200 || response.status > 399) {
			throw new Error('Bad request status: ' + response.status + ' ' + response.statusText);
		}

		response = JSON.parse(response.payload);

		return response.currencies;
	});

	return function (_x) {
		return ref.apply(this, arguments);
	};
}();

},{"../common":1}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _common = require('../common');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * Fetches results of currency conversion
 * @param date {Date} date
 * @param from {string} currency code
 * @param to {string} currency code
 * @param input {number} input number
 * @returns {object} results object
 */

exports.default = function () {
	var ref = _asyncToGenerator(function* (date, from, to, input) {

		date = date.toISOString().substr(0, 10);

		var response = yield (0, _common.xhr)({
			method: 'GET',
			url: '/currency/' + encodeURIComponent(date) + '/' + encodeURIComponent(from) + '/' + encodeURIComponent(to) + '/' + encodeURIComponent(input)

		});

		if (response.status < 200 || response.status > 399) {
			throw new Error('Bad request status: ' + response.status + ' ' + response.statusText);
		}

		response = JSON.parse(response.payload);

		return response;
	});

	return function (_x, _x2, _x3, _x4) {
		return ref.apply(this, arguments);
	};
}();

},{"../common":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29tbW9uLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL3NlcnZpY2VzL2xvYWRDdXJyZW5jaWVzLmpzIiwic3JjL3NlcnZpY2VzL2xvYWRSZXN1bHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NkJDY08sV0FBbUIsTUFBbkIsRUFBMkI7QUFDakMsTUFBSSxJQUFJLElBQUksY0FBSixFQUFSO0FBQ0EsSUFBRSxJQUFGLENBQU8sT0FBTyxPQUFPLE1BQWQsS0FBeUIsUUFBekIsR0FBb0MsT0FBTyxNQUEzQyxHQUFvRCxLQUEzRCxFQUFrRSxPQUFPLEdBQXpFOztBQUVBLE1BQUcsT0FBTyxPQUFPLE9BQWQsS0FBMEIsTUFBMUIsSUFBb0MsT0FBTyxPQUFPLE9BQWQsS0FBMEIsV0FBakUsRUFBOEU7QUFDN0UsUUFBSSxJQUFJLENBQVIsSUFBYSxPQUFPLE9BQXBCLEVBQTZCOzs7QUFHNUIsUUFBRyxFQUFFLFdBQUYsT0FBb0IsUUFBcEIsSUFBZ0MsRUFBRSxXQUFGLE9BQW9CLFNBQXZELEVBQWtFOztBQUVsRSxNQUFFLGdCQUFGLENBQW1CLENBQW5CLEVBQXNCLE9BQU8sT0FBUCxDQUFlLENBQWYsQ0FBdEI7QUFDQTtBQUNEOztBQUVELFNBQU8sSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFxQjtBQUN2QyxLQUFFLE1BQUYsR0FBVztBQUFBLFdBQU0sUUFBUTtBQUN4QixhQUFRLEVBQUUsTUFEYztBQUV4QixpQkFBWSxFQUFFLFVBRlU7QUFHeEIsY0FBUyxFQUFFO0FBSGEsS0FBUixDQUFOO0FBQUEsSUFBWDtBQUtBLEtBQUUsT0FBRixHQUFZO0FBQUEsV0FBSyxPQUFPLENBQVAsQ0FBTDtBQUFBLElBQVo7QUFDQSxLQUFFLE9BQUYsR0FBWTtBQUFBLFdBQUssT0FBTyxDQUFQLENBQUw7QUFBQSxJQUFaO0FB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Z2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG4vKipcbiAqIFhIUiB3cmFwcGVyIGZ1bmN0aW9ucy4gQmVjYXVzZSB0aGF0J3MgZXhhY3RseSBob3cgSSBsaWtlIGl0LiBcbiAqIEBUT0RPOiByZXR1cm4gcmVzcG9uc2UgaGVhZGVyc1xuICogQHBhcmFtIHtvYmplY3R9IHJlcXVlc3Qgb2JqZWN0XG4gKiAgICBtZXRob2Qge3N0cmluZ30gLSBIVFRQIG1ldGhvZFxuICogICAgdXJsIHtzdHJpbmd9IC0gcmVxdWVzdCB1cmxcbiAqICAgIGhlYWRlcnMge29iamVjdH0gLSByZXF1ZXN0IGhlYWRlcnNcbiAqICAgIHBheWxvYWQge3N0cmluZ30gLSByZXF1ZXN0IGJvZHlcbiAqIEByZXR1cm5zIHtvYmplY3R9IHJlc3BvbnNlIG9iamVjdFxuICogICAgc3RhdHVzIHtudW1iZXJ9IC0gc3RhdHVzIGNvZGVcbiAqICAgIHN0YXR1c1RleHQge3N0cmluZ30gLSBzdGF0dXMgdGV4dFxuICogICAgcGF5bG9hZCB7c3RyaW5nfSAtIHJlc3BvbnNlIGJvZHlcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHhocihwYXJhbXMpIHtcblx0dmFyIHggPSBuZXcgWE1MSHR0cFJlcXVlc3Q7XG5cdHgub3Blbih0eXBlb2YgcGFyYW1zLm1ldGhvZCA9PT0gJ3N0cmluZycgPyBwYXJhbXMubWV0aG9kIDogJ0dFVCcsIHBhcmFtcy51cmwpO1xuXG5cdGlmKHR5cGVvZiBwYXJhbXMuaGVhZGVycyAhPT0gJ251bGwnICYmIHR5cGVvZiBwYXJhbXMuaGVhZGVycyAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRmb3IodmFyIGkgaW4gcGFyYW1zLmhlYWRlcnMpIHtcblxuXHRcdFx0Ly8gc2lsZW50bHkgc2tpcCBjb21tb24gdW5zYWZlIGhlYWRlcnMgdG8gYXZvaWQgdWdseSB3YXJuaW5nc1xuXHRcdFx0aWYoaS50b0xvd2VyQ2FzZSgpID09PSAnY29va2llJyB8fCBpLnRvTG93ZXJDYXNlKCkgPT09ICdyZWZlcmVyJykgY29udGludWU7XG5cblx0XHRcdHguc2V0UmVxdWVzdEhlYWRlcihpLCBwYXJhbXMuaGVhZGVyc1tpXSk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHR4Lm9ubG9hZCA9ICgpID0+IHJlc29sdmUoe1xuXHRcdFx0c3RhdHVzOiB4LnN0YXR1cyxcblx0XHRcdHN0YXR1c1Rlc3Q6IHguc3RhdHVzVGV4dCxcblx0XHRcdHBheWxvYWQ6IHgucmVzcG9uc2VUZXh0XG5cdFx0fSk7XG5cdFx0eC5vbmVycm9yID0gZSA9PiByZWplY3QoZSk7XG5cdFx0eC5vbmFib3J0ID0gZSA9PiByZWplY3QoZSk7XG5cdFx0eC5zZW5kKHR5cGVvZiBwYXJhbXMucGF5bG9hZCA9PT0gJ3N0cmluZycgPyBwYXJhbXMucGF5bG9hZCA6IG51bGwpO1xuXHR9KTtcbn1cblxuXG4iLCJpbXBvcnQgbG9hZEN1cnJlbmNpZXNTZXJ2aWNlIGZyb20gXCIuL3NlcnZpY2VzL2xvYWRDdXJyZW5jaWVzXCI7XG5pbXBvcnQgbG9hZFJlc3VsdFNlcnZpY2UgZnJvbSBcIi4vc2VydmljZXMvbG9hZFJlc3VsdFwiO1xuXG5mdW5jdGlvbiBzZXRFcnJvcihlKSB7XG5cdCQoJyNyZXN1bHQtdGFibGUnKS5odG1sKGA8dHI+PHRkPjxzcGFuIGNsYXNzPVwicmVzdWx0LWVycm9yXCI+JHtlfTwvc3Bhbj48L3RkPjwvdHI+YClcbn1cblxuZnVuY3Rpb24gZ2V0U2VsZWN0ZWREYXRlKCkge1xuXHR2YXIgZGF0ZSA9ICQoJyNjdXJyZW5jeS1kYXRlJykudmFsKCk7XG5cblx0dmFyIG0gPSBkYXRlLm1hdGNoKC9eKFswLTldezJ9KVxcLihbMC05XXsyfSlcXC4oWzAtOV17NH0pJC8pO1xuXG5cdGlmKCFtKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgZGF0ZScpO1xuXHRkYXRlID0gRGF0ZS5wYXJzZShtWzNdICsgJy0nICsgbVsyXSArICctJyArIG1bMV0pO1xuXHRpZihpc05hTihkYXRlKSkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGRhdGUnKTtcblxuXHRyZXR1cm4gbmV3IERhdGUoZGF0ZSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWRDdXJyZW5jeUxpc3QoKSB7XG5cblx0dHJ5IHtcblx0XHR2YXIgZGF0ZSA9IGdldFNlbGVjdGVkRGF0ZSgpO1xuXHR9IGNhdGNoKGUpIHtcblx0XHRzZXRFcnJvcignVmlnYW5lIGt1dXDDpGV2Jyk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Y29uc29sZS5sb2coJ0xvYWRpbmcgbGlzdCBmb3IgZGF0ZSAnLCBkYXRlKTtcblxuXHRjb25zdCBjdXJyZW5jaWVzID0gYXdhaXQgbG9hZEN1cnJlbmNpZXNTZXJ2aWNlKGRhdGUpO1xuXG5cdGNvbnN0IGVsZW1lbnRzID0gbmV3IEFycmF5KGN1cnJlbmNpZXMubGVuZ3RoKTtcblx0Zm9yKGxldCBpID0gMCwgbCA9IGN1cnJlbmNpZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdFx0Y29uc3QgY3VycmVuY3kgPSBjdXJyZW5jaWVzW2ldO1xuXHRcdGlmKGN1cnJlbmN5WzFdKSB7XG5cdFx0XHRlbGVtZW50c1tpXSA9IGA8b3B0aW9uIHZhbHVlPVwiJHtjdXJyZW5jeVswXX1cIj4ke2N1cnJlbmN5WzBdfSAtICR7Y3VycmVuY3lbMV19PC9vcHRpb24+YDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZWxlbWVudHNbaV0gPSBgPG9wdGlvbiB2YWx1ZT1cIiR7Y3VycmVuY3lbMF19XCI+JHtjdXJyZW5jeVswXX08L29wdGlvbj5gO1xuXHRcdH1cblx0fVxuXG5cdCQoJyNjdXJyZW5jeS1mcm9tLCAjY3VycmVuY3ktdG8nKS5odG1sKGVsZW1lbnRzLmpvaW4oJycpKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gbG9hZFJlc3VsdCgpIHtcblx0dHJ5IHtcblx0XHR2YXIgZGF0ZSA9IGdldFNlbGVjdGVkRGF0ZSgpO1xuXHR9IGNhdGNoKGUpIHtcblx0XHRzZXRFcnJvcignVmlnYW5lIGt1dXDDpGV2Jyk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Ly8geWVhaCwgaWYgZmllbGQgaXMgZW1wdHkgaXQgd2lsbCBiZSBoYW5kbGVkIGFzIDBcblx0Ly8gdGhhdCdzIG5vdCAqdG9vKiBiYWQgSSB0aGlua1xuXHRjb25zdCBhbW91bnQgPSBNYXRoLmZsb29yKCQoJyNjdXJyZW5jeS1hbW91bnQnKS52YWwoKSAqIDEwMDAwKTtcblx0aWYoIU51bWJlci5pc0ludGVnZXIoYW1vdW50KSkge1xuXHRcdHNldEVycm9yKCdWaWdhbmUgc2lzZW5kJyk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Y29uc3QgZnJvbSA9ICQoJyNjdXJyZW5jeS1mcm9tJykudmFsKCk7XG5cdGNvbnN0IHRvID0gJCgnI2N1cnJlbmN5LXRvJykudmFsKCk7XG5cblxuXHRjb25zdCByZXNwb25zZSA9IGF3YWl0IGxvYWRSZXN1bHRTZXJ2aWNlKGRhdGUsIGZyb20sIHRvLCBhbW91bnQpO1xuXG5cdGlmKE9iamVjdC5rZXlzKHJlc3BvbnNlLnJlc3VsdCkubGVuZ3RoID09PSAwKSB7XG5cdFx0c2V0RXJyb3IoJ1ZhbGl0dWQgdmFsdXV0YSBrdXJzc2kgZWkgbGVpdHVkJyk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblxuXHRjb25zdCBlbGVtZW50cyA9IG5ldyBBcnJheSgpXG5cdGZvcih2YXIgaSBpbiByZXNwb25zZS5yZXN1bHQpIHtcblx0XHRlbGVtZW50cy5wdXNoKGA8dHI+XG5cdFx0XHQ8dGQ+PHNwYW4gY2xhc3M9XCJyZXN1bHQtc291cmNlXCI+JHtpfTwvc3Bhbj48L3RkPlxuXHRcdFx0PHRkPlxuXHRcdFx0XHQ8c3BhbiBjbGFzcz1cInJlc3VsdC12YWx1ZVwiPiR7cmVzcG9uc2UucmVzdWx0W2ldIC8gMTAwMDB9PC9zcGFuPlxuXHRcdFx0XHQ8c3BhbiBjbGFzcz1cInJlc3VsdC1jdXJyZW5jeVwiPiR7dG99PC9zcGFuPlxuXHRcdFx0PC90ZD5cblx0XHQ8L3RyPmApO1xuXHR9XG5cblx0JCgnI3Jlc3VsdC10YWJsZScpLmh0bWwoZWxlbWVudHMuam9pbignJykpO1xufVxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtcblx0JCgnI2N1cnJlbmN5LWRhdGUnKS5kYXRlcGlja2VyKHsgZGF0ZUZvcm1hdDogJ2RkLm1tLnl5JyB9KTtcblxuXHQkKCcjY3VycmVuY3ktZGF0ZScpLmNoYW5nZSgoKSA9PiB7XG5cdFx0bG9hZEN1cnJlbmN5TGlzdCgpLmNhdGNoKGUgPT4ge1xuXHRcdFx0Y29uc29sZS5lcnJvcignU2hpdCBoYXBwZW5lZDogJywgZSlcblx0XHR9KTtcblx0fSlcblxuXHQkKCcjY3VycmVuY3ktZm9ybScpLnN1Ym1pdCgoKSA9PiB7XG5cdFx0bG9hZFJlc3VsdCgpLmNhdGNoKGUgPT4ge1xuXHRcdFx0Y29uc29sZS5lcnJvcignU2hpdCBoYXBwZW5lZDogJywgZSlcblx0XHR9KTtcblx0fSlcblxuXHRjb25zdCBkYXRlID0gbmV3IERhdGU7XG5cblx0JCgnI2N1cnJlbmN5LWRhdGUnKS52YWwoKCcwJyArIGRhdGUuZ2V0RGF0ZSgpKS5zdWJzdHIoLTIpICsgJy4nXG5cdCAgICAgICAgICAgICAgICAgICAgICArICgnMCcgKyBkYXRlLmdldE1vbnRoKCkpLnN1YnN0cigtMikgKyAnLidcblx0ICAgICAgICAgICAgICAgICAgICAgICsgKCcwMDAnICsgZGF0ZS5nZXRGdWxsWWVhcigpKS5zdWJzdHIoLTQpKTtcblxuXHQvLyBmb3Igc29tZSByZWFzb24gdGhlIGFib3ZlIHN0YXRlbWVudCBkb2VzIG5vdCB0cmlnZ2VyIGNoYW5nZSBldmVudFxuXHQkKCcjY3VycmVuY3ktZGF0ZScpLmNoYW5nZSgpO1xuXG59KTtcbiIsImltcG9ydCB7IHhociB9IGZyb20gXCIuLi9jb21tb25cIjtcblxuLyoqXG4gKiBGZXRjaGVzIGxpc3Qgb2YgY3VycmVuY2llcyBmb3IgZ2l2ZW4gZGF0ZVxuICogQHBhcmFtIGRhdGUge0RhdGV9IGRhdGVcbiAqIEByZXR1cm5zIHtzdHJpbmdbXVtdfSBhcnJheSBvZiAyLWRpbWVuc2lvbmFsIGFycmF5cyBkZXNjcmliaW5nIGN1cnJlbmNpZXNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24oZGF0ZSkge1xuXG5cdGRhdGUgPSBkYXRlLnRvSVNPU3RyaW5nKCkuc3Vic3RyKDAsIDEwKTtcblxuXHR2YXIgcmVzcG9uc2UgPSBhd2FpdCB4aHIoe1xuXHRcdG1ldGhvZDogJ0dFVCcsXG5cdFx0dXJsOiAnL2N1cnJlbmNpZXMvJyArIGRhdGUsXG5cdH0pO1xuXG5cdGlmKHJlc3BvbnNlLnN0YXR1cyA8IDIwMCB8fCByZXNwb25zZS5zdGF0dXMgPiAzOTkpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ0JhZCByZXF1ZXN0IHN0YXR1czogJyArIHJlc3BvbnNlLnN0YXR1cyArICcgJyArIHJlc3BvbnNlLnN0YXR1c1RleHQpO1xuXHR9XG5cblx0cmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlc3BvbnNlLnBheWxvYWQpO1xuXG5cdHJldHVybiByZXNwb25zZS5jdXJyZW5jaWVzO1xufVxuIiwiaW1wb3J0IHsgeGhyIH0gZnJvbSBcIi4uL2NvbW1vblwiO1xuXG4vKipcbiAqIEZldGNoZXMgcmVzdWx0cyBvZiBjdXJyZW5jeSBjb252ZXJzaW9uXG4gKiBAcGFyYW0gZGF0ZSB7RGF0ZX0gZGF0ZVxuICogQHBhcmFtIGZyb20ge3N0cmluZ30gY3VycmVuY3kgY29kZVxuICogQHBhcmFtIHRvIHtzdHJpbmd9IGN1cnJlbmN5IGNvZGVcbiAqIEBwYXJhbSBpbnB1dCB7bnVtYmVyfSBpbnB1dCBudW1iZXJcbiAqIEByZXR1cm5zIHtvYmplY3R9IHJlc3VsdHMgb2JqZWN0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uKGRhdGUsIGZyb20sIHRvLCBpbnB1dCkge1xuXG5cdGRhdGUgPSBkYXRlLnRvSVNPU3RyaW5nKCkuc3Vic3RyKDAsIDEwKTtcblxuXHR2YXIgcmVzcG9uc2UgPSBhd2FpdCB4aHIoe1xuXHRcdG1ldGhvZDogJ0dFVCcsXG5cdFx0dXJsOiAnL2N1cnJlbmN5LycgKyBlbmNvZGVVUklDb21wb25lbnQoZGF0ZSlcblx0XHQrICcvJyArIGVuY29kZVVSSUNvbXBvbmVudChmcm9tKVxuXHRcdCsgJy8nICsgZW5jb2RlVVJJQ29tcG9uZW50KHRvKVxuXHRcdCsgJy8nICsgZW5jb2RlVVJJQ29tcG9uZW50KGlucHV0KVxuXG5cdH0pXG5cblx0aWYocmVzcG9uc2Uuc3RhdHVzIDwgMjAwIHx8IHJlc3BvbnNlLnN0YXR1cyA+IDM5OSkge1xuXHRcdHRocm93IG5ldyBFcnJvcignQmFkIHJlcXVlc3Qgc3RhdHVzOiAnICsgcmVzcG9uc2Uuc3RhdHVzICsgJyAnICsgcmVzcG9uc2Uuc3RhdHVzVGV4dCk7XG5cdH1cblxuXHRyZXNwb25zZSA9IEpTT04ucGFyc2UocmVzcG9uc2UucGF5bG9hZCk7XG5cblx0cmV0dXJuIHJlc3BvbnNlO1xufVxuXG4iXX0=
