package io.github.keijokapp.valuutakalkulaator.services;

import io.github.keijokapp.valuutakalkulaator.exceptions.InvalidCurrencyListException;
import io.github.keijokapp.valuutakalkulaator.models.Currency;
import io.github.keijokapp.valuutakalkulaator.models.CurrencyList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.NodeList;

import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;
import java.text.NumberFormat;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

@Service
public class EestiPankCurrencySourceService extends CurrencySourceService {

	final static private Logger logger = LoggerFactory.getLogger(EestiPankCurrencySourceService.class);

	final static private String SOURCE_NAME = "Eesti Pank";
	final static private String urlFormat = "http://statistika.eestipank.ee/Reports?type=curd&format=xml&date1=%s&lng=est&print=off";
	final static private LocalDate lastFixings = LocalDate.parse("2010-12-31");

	@Override
	public String getSourceName() {
		return SOURCE_NAME;
	}

	@Override
	public CurrencyList fetchCurrencyList(LocalDate date) throws InvalidCurrencyListException {

		if(date.isAfter(lastFixings)) date = lastFixings;

		// This should be locale-independent way to get friday immediately before weekend
		if(date.getDayOfWeek() == DayOfWeek.SATURDAY) date = date.minus(1, ChronoUnit.DAYS);
		else if(date.getDayOfWeek() == DayOfWeek.SUNDAY) date = date.minus(2, ChronoUnit.DAYS);

		logger.debug("Fetching currency table for date {}", date);

		String url = String.format(urlFormat, date.format(DateTimeFormatter.ISO_DATE));

		try {
			Document result = performRequest(url);

			XPathFactory xPathfactory = XPathFactory.newInstance();
			XPathExpression currencyExpression = xPathfactory.newXPath().compile("/Report/Body/Currencies/Currency");
			NodeList currencyNodes = (NodeList) currencyExpression.evaluate(result, XPathConstants.NODESET);

			CurrencyList list = new CurrencyList();
			list.setSource(SOURCE_NAME);
			list.setDate(date);

			Currency currency = new Currency();
			currency.setSource(SOURCE_NAME);
			currency.setDate(date);
			currency.setCode("EEK");
			currency.setName("Eesti kroon");
			currency.setRate(1.);
			list.getCurrencyList().put("EEK", currency);

			NumberFormat format = NumberFormat.getInstance(Locale.forLanguageTag("et-EE"));
			for(int i = 0, l = currencyNodes.getLength(); i < l; i++) {
				Element node = (Element) currencyNodes.item(i);
				NamedNodeMap attributes = node.getAttributes();
				String code = attributes.getNamedItem("name").getNodeValue();
				String name = attributes.getNamedItem("text").getNodeValue();
				Double rate = format.parse(attributes.getNamedItem("rate").getNodeValue()).doubleValue();

				currency = new Currency();
				currency.setSource(SOURCE_NAME);
				currency.setDate(date);
				currency.setCode(code);
				currency.setName(name);
				currency.setRate(rate);
				list.getCurrencyList().put(code, currency);

				logger.debug("code: {}; name: {}; rate: {}", code, name, rate);
			}

			logger.debug("currencies ({}): {}", date, currencyNodes.getLength());

			return list;
		} catch(Exception e) {
			throw new InvalidCurrencyListException("Failed to fetch currency table from " + url, e);
		}
	}
}
