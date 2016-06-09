package io.github.keijokapp.valuutakalkulaator.controllers;

import io.github.keijokapp.valuutakalkulaator.models.CurrencyResponse;
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
import java.util.Map;

@Controller
@RequestMapping("/currency")
public class CurrencyController {

	private static Logger logger = LoggerFactory.getLogger(CurrencyController.class);

	@Autowired
	CurrencyService currencyService;

	@Autowired
	DateService dateService;

	@RequestMapping("{date}/{from}/{to}/{value}")
	public ResponseEntity<CurrencyResponse> getValue(@PathVariable("date") String dateString,
	                                                 @PathVariable String from,
	                                                 @PathVariable String to,
	                                                 @PathVariable("value") String valueString) {

		try {
			LocalDate date = dateService.getDate(LocalDate.parse(dateString));

			long value = Long.valueOf(valueString);

			Map<String, Long> result = currencyService.calculate(date, from, to, value);

			CurrencyResponse response = new CurrencyResponse();
			response.setDate(date);
			response.setFrom(from);
			response.setTo(to);
			response.setInput(value);
			response.setResult(result);

			return new ResponseEntity<>(response, HttpStatus.OK);
		} catch(Exception e) {
			logger.error("{}", e);
			return new ResponseEntity<>(new CurrencyResponse(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
