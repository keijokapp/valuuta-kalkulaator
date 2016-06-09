package io.github.keijokapp.valuutakalkulaator.services;

import io.github.keijokapp.valuutakalkulaator.exceptions.InvalidCurrencyListException;
import io.github.keijokapp.valuutakalkulaator.models.Currency;
import io.github.keijokapp.valuutakalkulaator.models.CurrencyList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class CurrencyService {

	private static Logger logger = LoggerFactory.getLogger(CurrencyService.class);

	@Autowired
	CurrencySourceService[] currencySourceServices; // nice trick I learned today

	private Map<LocalDate, List<CurrencyList>> currencyLists = new HashMap<>(); // cache for currency lists

	/**
	 * Returns list of all currencies from all sources for a given date
	 *
	 * @param date requested date
	 * @return list of all currencies from all sources for a given date
	 * @throws InvalidCurrencyListException
	 */
	public List<Currency> getCurrencies(LocalDate date) throws InvalidCurrencyListException {

		List<CurrencyList> currencyLists = getCurrencyLists(date);

		List<Currency> result = new ArrayList<>();

		for(CurrencyList currencyList : currencyLists) {
			Collection<Currency> currencies = currencyList.getCurrencyList().values();
			result.addAll(currencies);
		}

		return result;
	}

	/**
	 * Returns list of all currency codes and names from all sources for a given date without duplicates
	 *
	 * @param date requested date
	 * @return list of all currency codes and names from all sources for a given date without duplicates
	 * @throws InvalidCurrencyListException
	 */
	public List<String[]> getMergedCurrencies(LocalDate date) throws InvalidCurrencyListException {
		List<Currency> currencies = getCurrencies(date);

		currencies.sort((o1, o2) -> {
			int codeDiff = o1.getCode().compareTo(o2.getCode());
			if(codeDiff != 0) return codeDiff;
			if(o1.getName() == null) return 1;
			if(o2.getName() == null) return -1;
			return o1.getName().compareTo(o2.getName());
		});

		List<String[]> mergedList = new ArrayList<>();
		String lastCode = null;

		for(Currency currency : currencies) {
			if(!currency.getCode().equals(lastCode)) {
				mergedList.add(new String[]{currency.getCode(), currency.getName()});
				lastCode = currency.getCode();
			}
		}

		mergedList.sort((o1, o2) -> {
			if(o1[1] == null || o2[1] == null) return o1[0].compareTo(o2[0]);
			return o1[1].compareTo(o2[1]);
		});

		return mergedList;
	}

	/**
	 * Returns map of results where keys are source names and values are corresponding results
	 *
	 * @param date  requested date
	 * @param from  currency code
	 * @param to    currency code
	 * @param value value
	 * @return conversion results
	 * @throws InvalidCurrencyListException
	 */
	public Map<String, Long> calculate(LocalDate date, String from, String to, long value) throws InvalidCurrencyListException {
		Map<String, Long> result = new HashMap<>();
		logger.debug("value: {}", value);
		List<CurrencyList> lists = getCurrencyLists(date);
		for(CurrencyList list : lists) {
			Currency fromCurrency = list.getCurrencyList().get(from);
			Currency toCurrency = list.getCurrencyList().get(to);
			if(fromCurrency == null || toCurrency == null) continue;

			double ratio = fromCurrency.getRate() / toCurrency.getRate();
			logger.debug("ratio: {}", ratio);
			long r = Math.round(((double) value * ratio));

			result.put(list.getSource(), r);
		}
		return result;
	}

	/**
	 * Returns collection of currency lists (one for each source) and fetches them from external source if needed
	 *
	 * @param date requested currency list date
	 * @return list of currency lists (one for each source)
	 * @throws InvalidCurrencyListException
	 */
	private List<CurrencyList> getCurrencyLists(LocalDate date) throws InvalidCurrencyListException {
		List<CurrencyList> currencyLists = this.currencyLists.get(date);
		if(currencyLists != null) return currencyLists;
		return fetchCurrencyLists(date);
	}

	/**
	 * Fetches currency lists and stores them in cache
	 *
	 * @param date date
	 * @throws InvalidCurrencyListException
	 * @return list of fetched lists
	 */
	private List<CurrencyList> fetchCurrencyLists(LocalDate date) throws InvalidCurrencyListException {
		List<CurrencyList> lists = new ArrayList<>();
		for(CurrencySourceService source : currencySourceServices) {
			CurrencyList list = source.fetchCurrencyList(date);
			lists.add(list);
		}
		currencyLists.put(date, lists);
		return lists;
	}

}
