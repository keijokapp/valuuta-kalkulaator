package io.github.keijokapp.valuutakalkulaator.models;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

public class CurrencyList {

	private String source;
	private LocalDate date;
	private Map<String, Currency> currencyList = new HashMap<>();


	public String getSource() {
		return source;
	}

	public void setSource(String source) {
		this.source = source;
	}

	public LocalDate getDate() {
		return date;
	}

	public void setDate(LocalDate date) {
		this.date = date;
	}

	public Map<String, Currency> getCurrencyList() {
		return currencyList;
	}

	public void setCurrencyList(Map<String, Currency> currencyList) {
		this.currencyList = currencyList;
	}
}
