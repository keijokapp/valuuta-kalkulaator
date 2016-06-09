package io.github.keijokapp.valuutakalkulaator.controllers;

import io.github.keijokapp.valuutakalkulaator.models.CurrencyListResponse;
import io.github.keijokapp.valuutakalkulaator.services.CurrencyService;
import io.github.keijokapp.valuutakalkulaator.services.DateService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.time.LocalDate;
import java.util.List;

@Controller
@RequestMapping("/currencies")
public class CurrencyListController {

	private static Logger logger = LoggerFactory.getLogger(CurrencyListController.class);

	@Autowired
	CurrencyService currencyService;

	@Autowired
	DateService dateService;

	@RequestMapping()
	public ResponseEntity<CurrencyListResponse> getList() {
		try {
			LocalDate date = dateService.getDate(LocalDate.now());

			List<String[]> mergedList = currencyService.getMergedCurrencies(date);

			CurrencyListResponse response = new CurrencyListResponse();
			response.setCurrencies(mergedList);

			logger.debug("Response: {}", response);

			return new ResponseEntity<>(response, HttpStatus.OK);
		} catch(Exception e) {
			logger.error("{}", e);
			return null;
		}
	}

	@RequestMapping("{date}")
	public ResponseEntity<CurrencyListResponse> getListByDate(@PathVariable("date") String dateString) {
		try {
			LocalDate date = dateService.getDate(LocalDate.parse(dateString));

			List<String[]> mergedList = currencyService.getMergedCurrencies(date);

			CurrencyListResponse response = new CurrencyListResponse();
			response.setCurrencies(mergedList);

			return new ResponseEntity<>(response, HttpStatus.OK);
		} catch(Exception e) {
			logger.error("{}", e);
			return null;
		}
	}

}
