package io.github.keijokapp.valuutakalkulaator.services;

import io.github.keijokapp.valuutakalkulaator.exceptions.InvalidCurrencyListException;
import io.github.keijokapp.valuutakalkulaator.models.Currency;
import io.github.keijokapp.valuutakalkulaator.models.CurrencyList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class LeeduPankCurrencySourceService extends CurrencySourceService {

	final static private Logger logger = LoggerFactory.getLogger(LeeduPankCurrencySourceService.class);

	final static private String SOURCE_NAME = "Leedu Pank";
	final static private String urlFormat = "http://webservices.lb.lt/ExchangeRates/ExchangeRates.asmx/getExchangeRatesByDate?Date=%s";
	final static private LocalDate lastFixings = LocalDate.parse("2014-12-31");

	@Override
	public String getSourceName() {
		return SOURCE_NAME;
	}

	@Override
	public CurrencyList fetchCurrencyList(LocalDate date) throws InvalidCurrencyListException {

		if(date.isAfter(lastFixings)) date = lastFixings;

		logger.debug("Fetching currency table for date {}", date);

		String url = String.format(urlFormat, date.format(DateTimeFormatter.ISO_DATE));

		try {
			Document result = performRequest(url);

			XPathFactory xPathfactory = XPathFactory.newInstance();
			XPathExpression currencyExpression = xPathfactory.newXPath().compile("/ExchangeRates/item");

			NodeList currencyNodes = (NodeList) currencyExpression.evaluate(result, XPathConstants.NODESET);

			CurrencyList list = new CurrencyList();
			list.setSource(SOURCE_NAME);
			list.setDate(date);

			Currency currency = new Currency();
			currency.setSource(SOURCE_NAME);
			currency.setDate(date);
			currency.setCode("LTL");
			currency.setName(null);
			currency.setRate(1.);
			list.getCurrencyList().put("LTL", currency);

			NumberFormat format = NumberFormat.getInstance(Locale.forLanguageTag("en-US")); // I hope US locale will do
			for(int i = 0, l = currencyNodes.getLength(); i < l; i++) {
				Element node = (Element) currencyNodes.item(i);
				String code = node.getElementsByTagName("currency").item(0).getFirstChild().getNodeValue();
				Integer quantity = Integer.parseInt(node.getElementsByTagName("quantity").item(0).getFirstChild().getNodeValue());
				Double rate = format.parse(node.getElementsByTagName("rate").item(0).getFirstChild().getNodeValue()).doubleValue();

				currency = new Currency();
				currency.setSource(SOURCE_NAME);
				currency.setDate(date);
				currency.setCode(code);
				currency.setName(null);
				currency.setRate(rate / (double)quantity); // I'm no entirely sure whether this is correct or not
				list.getCurrencyList().put(code, currency);

				logger.debug("code: {}; quantity: {}, rate: {}", code, quantity, rate);
			}

			logger.debug("currencies ({}): {}", date, currencyNodes.getLength());

			return list;
		} catch(Exception e) {
			throw new InvalidCurrencyListException("Failed to fetch currency table from " + url, e);
		}
	}
}
