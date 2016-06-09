import loadCurrenciesService from "./services/loadCurrencies";
import loadResultService from "./services/loadResult";

function setError(e) {
	$('#result-table').html(`<tr><td><span class="result-error">${e}</span></td></tr>`)
}

function getSelectedDate() {
	var date = $('#currency-date').val();

	var m = date.match(/^([0-9]{2})\.([0-9]{2})\.([0-9]{4})$/);

	if(!m) throw new Error('Invalid date');
	date = Date.parse(m[3] + '-' + m[2] + '-' + m[1]);
	if(isNaN(date)) throw new Error('Invalid date');

	return new Date(date);
}

async function loadCurrencyList() {

	try {
		var date = getSelectedDate();
	} catch(e) {
		setError('Vigane kuupäev');
		return;
	}

	console.log('Loading list for date ', date);

	const currencies = await loadCurrenciesService(date);

	const elements = new Array(currencies.length);
	for(let i = 0, l = currencies.length; i < l; i++) {
		const currency = currencies[i];
		if(currency[1]) {
			elements[i] = `<option value="${currency[0]}">${currency[0]} - ${currency[1]}</option>`;
		} else {
			elements[i] = `<option value="${currency[0]}">${currency[0]}</option>`;
		}
	}

	$('#currency-from, #currency-to').html(elements.join(''));
}

async function loadResult() {
	try {
		var date = getSelectedDate();
	} catch(e) {
		setError('Vigane kuupäev');
		return;
	}

	// yeah, if field is empty it will be handled as 0
	// that's not *too* bad I think
	const amount = Math.floor($('#currency-amount').val() * 10000);
	if(!Number.isInteger(amount)) {
		setError('Vigane sisend');
		return;
	}

	const from = $('#currency-from').val();
	const to = $('#currency-to').val();


	const response = await loadResultService(date, from, to, amount);

	if(Object.keys(response.result).length === 0) {
		setError('Valitud valuuta kurssi ei leitud');
		return;
	}


	const elements = new Array()
	for(var i in response.result) {
		elements.push(`<tr>
			<td><span class="result-source">${i}</span></td>
			<td>
				<span class="result-value">${response.result[i] / 10000}</span>
				<span class="result-currency">${to}</span>
			</td>
		</tr>`);
	}

	$('#result-table').html(elements.join(''));
}

window.addEventListener('load', () => {
	$('#currency-date').datepicker({ dateFormat: 'dd.mm.yy' });

	$('#currency-date').change(() => {
		loadCurrencyList().catch(e => {
			console.error('Shit happened: ', e)
		});
	})

	$('#currency-form').submit(() => {
		loadResult().catch(e => {
			console.error('Shit happened: ', e)
		});
	})

	const date = new Date;

	$('#currency-date').val(('0' + date.getDate()).substr(-2) + '.'
	                      + ('0' + date.getMonth()).substr(-2) + '.'
	                      + ('000' + date.getFullYear()).substr(-4));

	// for some reason the above statement does not trigger change event
	$('#currency-date').change();

});
