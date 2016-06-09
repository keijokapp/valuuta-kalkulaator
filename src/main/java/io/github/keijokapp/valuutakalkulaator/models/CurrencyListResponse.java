package io.github.keijokapp.valuutakalkulaator.models;

import java.util.List;

public class CurrencyListResponse {

	private List<String[]> currencies;

	public List<String[]> getCurrencies() {
		return currencies;
	}

	public void setCurrencies(List<String[]> currencies) {
		this.currencies = currencies;
	}
}
